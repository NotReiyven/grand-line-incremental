import { create } from 'zustand';
import Decimal from 'break_eternity.js';

import type { GameState } from '../engine/types';
import { createInitialState } from '../engine/save';
import { dispatchCommand } from '../engine/loop';
import { inheritWill, triggerEnding } from '../engine/prestige';
import { chapters } from '../data/chapters';
import { crewList } from '../data/crew';
import { expeditions } from '../data/expeditions';
import { skills } from '../data/skills';
import { fruits } from '../data/fruits';

interface GameStore extends GameState {
  sync: (state: GameState) => void;
  train: (stat: keyof GameState['stats']) => void;
  makeChoice: (choiceId: string) => void;
  confirmInheritWill: () => void;
  startExpedition: (expeditionId: string, crewId: string) => void;
  claimExpedition: (expeditionId: string) => void;
  eatFruit: (fruitId: string) => void;
}

const checkSkillUnlocks = (state: GameState): void => {
  skills.forEach((skill) => {
    if (
      !state.unlockedSkills.includes(skill.id) &&
      state.stats[skill.stat].gte(skill.threshold)
    ) {
      state.unlockedSkills.push(skill.id);
    }
  });
};

export const useGameStore = create<GameStore>()((set) => ({
  ...createInitialState(),

  sync: (state: GameState) => {
    checkSkillUnlocks(state);
    set({ ...state });
  },

  train: (stat: keyof GameState['stats']) => {
    dispatchCommand((state: GameState) => {
      if (!state.stamina.gte(10)) {
        return;
      }

      state.stamina = state.stamina.minus(10);

      let crewMult = 0;

      state.unlockedCrew.forEach((crewId) => {
        const crew = crewList.find(
          (member) => member.id === crewId,
        );

        if (
          crew &&
          crew.passiveMultiplier.stat === stat
        ) {
          crewMult += crew.passiveMultiplier.value;
        }
      });

      let fruitMult = 1;

      if (state.devilFruit) {
        const activeFruit = fruits.find(
          (fruit) => fruit.id === state.devilFruit,
        );

        if (activeFruit) {
          fruitMult = activeFruit.multiplier;
        }
      }

      const hakiMult = state.hakiMultiplier.plus(1);

      const finalGain = new Decimal(1)
        .times(hakiMult)
        .times(1 + crewMult)
        .times(fruitMult);

      state.stats[stat] =
        state.stats[stat].plus(finalGain);

      checkSkillUnlocks(state);
    });
  },

  makeChoice: (choiceId: string) => {
    dispatchCommand((state: GameState) => {
      const chapter = chapters.find(
        (entry) => entry.id === state.currentChapter,
      );

      if (!chapter) {
        return;
      }

      const choice = chapter.choices.find(
        (entry) => entry.id === choiceId,
      );

      if (!choice) {
        return;
      }

      choice.factionDeltas.forEach((delta) => {
        const faction = delta.faction;

        if (
          !state.doubleAgentActive ||
          !state.lockedFactions?.includes(faction)
        ) {
          state.factions[faction] = Math.max(
            -100,
            Math.min(
              100,
              state.factions[faction] + delta.delta,
            ),
          );
        }
      });

      if (choice.infamyDelta !== undefined) {
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
        state.unlockedCrew.push(choice.crewUnlock);
      }

      if (choice.powerCheck) {
        const statValue =
          state.stats[choice.powerCheck.stat];

        if (
          statValue.gte(choice.powerCheck.value)
        ) {
          if (choice.powerCheck.successEndingId) {
            triggerEnding(
              state,
              choice.powerCheck.successEndingId,
            );
          } else if (
            choice.powerCheck.successChapterId
          ) {
            state.currentChapter =
              choice.powerCheck.successChapterId;

            state.chapterProgress = 0;
          }
        } else if (choice.powerCheck.failEndingId) {
          triggerEnding(
            state,
            choice.powerCheck.failEndingId,
          );
        }
      } else if (choice.endingId) {
        triggerEnding(state, choice.endingId);
      } else if (choice.nextChapterId) {
        state.currentChapter =
          choice.nextChapterId;

        const nextChapter = chapters.find(
          (entry) =>
            entry.id === choice.nextChapterId,
        );

        if (nextChapter) {
          state.currentArc = nextChapter.arc;
        }

        state.chapterProgress = 0;
      } else {
        state.chapterProgress = 1;
      }
    });
  },

  confirmInheritWill: () => {
    const inheritWillAction = (state: GameState) => {
      inheritWill(state);
    };

    dispatchCommand(inheritWillAction);
  },

  startExpedition: (
    expeditionId: string,
    crewId: string,
  ) => {
    dispatchCommand((state: GameState) => {
      const expedition = expeditions.find(
        (entry) => entry.id === expeditionId,
      );

      if (!expedition) {
        return;
      }

      if (
        state.activeExpeditions.some(
          (entry) => entry.crewId === crewId,
        )
      ) {
        return;
      }

      if (
        state.activeExpeditions.some(
          (entry) => entry.id === expeditionId,
        )
      ) {
        return;
      }

      state.activeExpeditions.push({
        id: expeditionId,
        crewId,
        completeAt:
          Date.now() +
          expedition.durationSeconds * 1000,
      });
    });
  },

  claimExpedition: (expeditionId: string) => {
    dispatchCommand((state: GameState) => {
      const activeIndex =
        state.activeExpeditions.findIndex(
          (entry) => entry.id === expeditionId,
        );

      if (activeIndex === -1) {
        return;
      }

      const active =
        state.activeExpeditions[activeIndex];

      if (!active || Date.now() < active.completeAt) {
        return;
      }

      const expedition = expeditions.find(
        (entry) => entry.id === expeditionId,
      );

      if (expedition) {
        expedition.rewards.forEach((reward) => {
          if (!state.inventory[reward.itemId]) {
            state.inventory[reward.itemId] =
              new Decimal(0);
          }

          state.inventory[reward.itemId] =
            state.inventory[reward.itemId].plus(
              reward.baseAmount,
            );
        });
      }

      state.activeExpeditions.splice(
        activeIndex,
        1,
      );
    });
  },

  eatFruit: (fruitId: string) => {
    dispatchCommand((state: GameState) => {
      if (state.devilFruit) {
        return;
      }

      const amount = state.inventory[fruitId];

      if (!amount || amount.lte(0)) {
        return;
      }

      state.inventory[fruitId] =
        amount.minus(1);

      state.devilFruit = fruitId;
    });
  },
}));