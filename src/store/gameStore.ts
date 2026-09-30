import { create } from 'zustand';
import Decimal from 'break_eternity.js';

import type { GameState } from '../engine/types';
import {
  createInitialState,
} from '../engine/save';
import {
  dispatchCommand,
} from '../engine/loop';
import {
  inheritWill,
  triggerEnding,
} from '../engine/prestige';
import {
  chapters,
} from '../data/chapters';
import {
  crewList,
} from '../data/crew';
import {
  expeditions,
} from '../data/expeditions';
import {
  skills,
} from '../data/skills';
import {
  fruits,
} from '../data/fruits';
import {
  worldBosses,
} from '../data/bosses';
import {
  updateProgression,
} from '../engine/progression';

interface GameStore extends GameState {
  sync: (
    state: GameState,
  ) => void;

  train: (
    stat: keyof GameState['stats'],
  ) => void;

  makeChoice: (
    choiceId: string,
  ) => void;

  confirmInheritWill: () => void;

  startExpedition: (
    expeditionId: string,
    crewId: string,
  ) => void;

  claimExpedition: (
    expeditionId: string,
  ) => void;

  eatFruit: (
    fruitId: string,
  ) => void;

  challengeBoss: (
    bossId: string,
  ) => void;
}

const clampReputation = (
  value: number,
): number =>
  Math.max(
    -100,
    Math.min(100, value),
  );

const getFruitMultiplier = (
  state: GameState,
): number => {
  if (!state.devilFruit) {
    return 1;
  }

  return (
    fruits.find(
      (fruit) =>
        fruit.id ===
        state.devilFruit,
    )?.multiplier ?? 1
  );
};

const snapshotState = (
  state: GameState,
): GameState => ({
  ...state,

  stats: {
    ...state.stats,
  },

  factions: {
    ...state.factions,
  },

  lockedFactions:
    state.lockedFactions
      ? ([
          ...state.lockedFactions,
        ] as [
          GameState['lockedFactions'] extends [
            infer A,
            infer B,
          ]
            ? A
            : never,
          GameState['lockedFactions'] extends [
            infer A,
            infer B,
          ]
            ? B
            : never,
        ])
      : null,

  doubleAgentBackup:
    state.doubleAgentBackup
      ? {
          ...state.doubleAgentBackup,
        }
      : null,

  endings: [
    ...state.endings,
  ],

  heirlooms: [
    ...state.heirlooms,
  ],

  unlockedCrew: [
    ...state.unlockedCrew,
  ],

  activeExpeditions:
    state.activeExpeditions.map(
      (expedition) => ({
        ...expedition,
      }),
    ),

  inventory: {
    ...state.inventory,
  },

  unlockedSkills: [
    ...state.unlockedSkills,
  ],

  haki: {
    ...state.haki,
  },

  worldFruits: [
    ...state.worldFruits,
  ],

  lockedFruits: [
    ...state.lockedFruits,
  ],

  highestBossDamage: {
    ...state.highestBossDamage,
  },

  defeatedBosses: [
    ...state.defeatedBosses,
  ],
});

export const useGameStore =
  create<GameStore>()(
    (set) => ({
      ...createInitialState(),

      sync: (
        state: GameState,
      ) => {
        updateProgression(state);

        set(
          snapshotState(state),
        );
      },

      train: (
        stat: keyof GameState['stats'],
      ) => {
        dispatchCommand(
          (state: GameState) => {
            if (
              !state.stamina.gte(10)
            ) {
              state.lastEvent =
                'Not enough stamina. Keep moving and it will recover.';
              return;
            }

            state.stamina =
              state.stamina.minus(
                10,
              );

            let crewMultiplier = 0;

            for (const crewId of state.unlockedCrew) {
              const crew =
                crewList.find(
                  (member) =>
                    member.id === crewId,
                );

              if (
                crew &&
                crew.passiveMultiplier
                  .stat === stat
              ) {
                crewMultiplier +=
                  crew.passiveMultiplier
                    .value;
              }
            }

            const fruitMultiplier =
              getFruitMultiplier(
                state,
              );

            const hakiMultiplier =
              state.hakiMultiplier.plus(
                1,
              );

            const finalGain =
              new Decimal(1)
                .times(
                  hakiMultiplier,
                )
                .times(
                  1 +
                    crewMultiplier,
                )
                .times(
                  fruitMultiplier,
                );

            state.stats[stat] =
              state.stats[stat].plus(
                finalGain,
              );

            state.lastEvent = `Training complete. +${finalGain.toFixed(
              2,
            )} ${stat.toUpperCase()}.`;
          },
        );
      },

      makeChoice: (
        choiceId: string,
      ) => {
        dispatchCommand(
          (state: GameState) => {
            const chapter =
              chapters.find(
                (entry) =>
                  entry.id ===
                  state.currentChapter,
              );

            if (!chapter) {
              return;
            }

            if (
              state.chapterProgress !==
              0
            ) {
              return;
            }

            const choice =
              chapter.choices.find(
                (entry) =>
                  entry.id === choiceId,
              );

            if (!choice) {
              return;
            }

            if (
              choice.requirement &&
              state.stats[
                choice.requirement
                  .stat
              ].lt(
                choice.requirement
                  .value,
              )
            ) {
              state.lastEvent =
                `You need ${choice.requirement.value} ${choice.requirement.stat.toUpperCase()} for that choice.`;
              return;
            }

            for (const delta of choice.factionDeltas) {
              const faction =
                delta.faction;

              if (
                !state.doubleAgentActive ||
                !state.lockedFactions?.includes(
                  faction,
                )
              ) {
                state.factions[
                  faction
                ] =
                  clampReputation(
                    state.factions[
                      faction
                    ] +
                      delta.delta,
                  );
              }
            }

            if (
              choice.infamyDelta !==
              undefined
            ) {
              state.factions.infamy =
                state.factions.infamy.plus(
                  choice.infamyDelta,
                );
            }

            if (
              choice.crewUnlock &&
              !state.unlockedCrew.includes(
                choice.crewUnlock,
              )
            ) {
              state.unlockedCrew.push(
                choice.crewUnlock,
              );
            }

            if (choice.powerCheck) {
              const statValue =
                state.stats[
                  choice.powerCheck
                    .stat
                ];

              if (
                statValue.gte(
                  choice.powerCheck
                    .value,
                )
              ) {
                if (
                  choice.powerCheck
                    .successEndingId
                ) {
                  triggerEnding(
                    state,
                    choice.powerCheck
                      .successEndingId,
                  );
                } else if (
                  choice.powerCheck
                    .successChapterId
                ) {
                  state.currentChapter =
                    choice.powerCheck
                      .successChapterId;

                  const nextChapter =
                    chapters.find(
                      (entry) =>
                        entry.id ===
                        choice
                          .powerCheck
                          ?.successChapterId,
                    );

                  if (nextChapter) {
                    state.currentArc =
                      nextChapter.arc;
                  }

                  state.chapterProgress = 0;
                }
              } else if (
                choice.powerCheck
                  .failEndingId
              ) {
                triggerEnding(
                  state,
                  choice.powerCheck
                    .failEndingId,
                );
              }

              if (!state.isDead) {
                state.lastEvent =
                  `Check passed. ${choice.text.replace(/\s*\(Check:.*\)$/i, '')}`;
              }

              return;
            }

            if (choice.endingId) {
              triggerEnding(
                state,
                choice.endingId,
              );
              return;
            }

            if (
              choice.nextChapterId
            ) {
              state.currentChapter =
                choice.nextChapterId;

              const nextChapter =
                chapters.find(
                  (entry) =>
                    entry.id ===
                    choice.nextChapterId,
                );

              if (nextChapter) {
                state.currentArc =
                  nextChapter.arc;

                state.lastEvent = `The voyage continues into ${nextChapter.title}.`;
              }

              state.chapterProgress = 0;
              return;
            }

            state.chapterProgress = 1;
            state.lastEvent =
              'The decision has been made.';
          },
        );
      },

      confirmInheritWill: () => {
        dispatchCommand(
          (state) => {
            inheritWill(state);
          },
          true,
        );
      },

      startExpedition: (
        expeditionId: string,
        crewId: string,
      ) => {
        dispatchCommand(
          (state) => {
            const expedition =
              expeditions.find(
                (entry) =>
                  entry.id ===
                  expeditionId,
              );

            if (!expedition) {
              return;
            }

            if (
              !state.unlockedCrew.includes(
                crewId,
              )
            ) {
              return;
            }

            if (
              state.activeExpeditions.some(
                (entry) =>
                  entry.crewId ===
                  crewId,
              )
            ) {
              state.lastEvent =
                'That crew member is already away.';
              return;
            }

            if (
              state.activeExpeditions.some(
                (entry) =>
                  entry.id ===
                  expeditionId,
              )
            ) {
              state.lastEvent =
                'That expedition is already underway.';
              return;
            }

            state.activeExpeditions.push(
              {
                id: expeditionId,
                crewId,
                completeAt:
                  Date.now() +
                  expedition.durationSeconds *
                    1000,
              },
            );

            state.lastEvent = `${expedition.name} launched.`;
          },
        );
      },

      claimExpedition: (
        expeditionId: string,
      ) => {
        dispatchCommand(
          (state) => {
            const activeIndex =
              state.activeExpeditions.findIndex(
                (entry) =>
                  entry.id ===
                  expeditionId,
              );

            if (
              activeIndex === -1
            ) {
              return;
            }

            const active =
              state.activeExpeditions[
                activeIndex
              ];

            if (!active) {
              return;
            }

            if (
              Date.now() <
              active.completeAt
            ) {
              return;
            }

            const expedition =
              expeditions.find(
                (entry) =>
                  entry.id ===
                  expeditionId,
              );

            if (expedition) {
              for (const reward of expedition.rewards) {
                const existing =
                  state.inventory[
                    reward.itemId
                  ] ??
                  new Decimal(0);

                state.inventory[
                  reward.itemId
                ] =
                  existing.plus(
                    reward.baseAmount,
                  );
              }

              state.lastEvent = `${expedition.name} returned with rewards.`;
            }

            state.activeExpeditions.splice(
              activeIndex,
              1,
            );
          },
        );
      },

      eatFruit: (
        fruitId: string,
      ) => {
        dispatchCommand(
          (state) => {
            if (state.devilFruit) {
              state.lastEvent =
                'Your body cannot consume a second Devil Fruit.';
              return;
            }

            const inventoryAmount =
              state.inventory[
                fruitId
              ];

            if (
              inventoryAmount &&
              inventoryAmount.gt(0)
            ) {
              state.inventory[
                fruitId
              ] =
                inventoryAmount.minus(1);

              state.devilFruit =
                fruitId;
            } else {
              const worldIndex =
                state.worldFruits.indexOf(
                  fruitId,
                );

              if (worldIndex === -1) {
                return;
              }

              state.worldFruits.splice(
                worldIndex,
                1,
              );

              state.devilFruit =
                fruitId;
            }

            const fruit =
              fruits.find(
                (entry) =>
                  entry.id ===
                  fruitId,
              );

            state.lastEvent = fruit
              ? `${fruit.name} consumed. Your body has changed.`
              : 'A strange fruit has been consumed.';
          },
        );
      },

      challengeBoss: (
        bossId: string,
      ) => {
        dispatchCommand(
          (state) => {
            const boss =
              worldBosses.find(
                (entry) =>
                  entry.id ===
                  bossId,
              );

            if (!boss) {
              return;
            }

            if (
              state.currentChapter <
              boss.requiresChapter
            ) {
              state.lastEvent =
                'That threat is beyond the current arc.';
              return;
            }

            if (
              state.defeatedBosses.includes(
                boss.id,
              )
            ) {
              state.lastEvent =
                `${boss.name} has already been defeated.`;
              return;
            }

            if (
              !state.stamina.gte(
                boss.staminaCost,
              )
            ) {
              state.lastEvent =
                `You need ${boss.staminaCost} stamina to challenge ${boss.name}.`;
              return;
            }

            state.stamina =
              state.stamina.minus(
                boss.staminaCost,
              );

            const basePower =
              state.stats.str
                .plus(state.stats.agi)
                .plus(state.stats.end)
                .plus(state.stats.wil);

            const damage =
              basePower
                .times(
                  state.hakiMultiplier.plus(
                    1,
                  ),
                )
                .times(
                  getFruitMultiplier(
                    state,
                  ),
                );

            const previousBest =
              state.highestBossDamage[
                boss.id
              ] ??
              new Decimal(0);

            if (
              damage.gt(previousBest)
            ) {
              state.highestBossDamage[
                boss.id
              ] = damage;
            }

            if (
              damage.gte(boss.hp)
            ) {
              state.defeatedBosses.push(
                boss.id,
              );

              state.factions.infamy =
                state.factions.infamy.plus(
                  boss.infamyReward,
                );

              if (
                boss.rewardItemId &&
                boss.rewardItemAmount
              ) {
                const existing =
                  state.inventory[
                    boss.rewardItemId
                  ] ??
                  new Decimal(0);

                state.inventory[
                  boss.rewardItemId
                ] =
                  existing.plus(
                    boss.rewardItemAmount,
                  );
              }

              state.lastEvent = `${boss.name} defeated. ${boss.rewardText}`;
            } else {
              state.lastEvent = `${boss.name} resisted. You dealt ${damage.toFixed(
                0,
              )} damage out of ${boss.hp.toFixed(
                0,
              )}.`;
            }
          },
        );
      },
    }),
  );