import {
  useEffect,
  useState,
} from 'react';
import {
  useGameStore,
} from './store/gameStore';
import {
  useSettingsStore,
} from './store/settingsStore';
import {
  formatDecimal,
} from './utils/math';
import {
  chapters,
} from './data/chapters';
import {
  crewList,
} from './data/crew';
import {
  expeditions,
} from './data/expeditions';
import {
  endingsMeta,
} from './engine/prestige';
import {
  skills,
} from './data/skills';
import {
  fruits,
} from './data/fruits';
import {
  worldBosses,
} from './data/bosses';
import type {
  Choice,
} from './data/chapters';
import {
  dispatchCommand,
} from './engine/loop';
import styles from './App.module.css';
type Tab =
  | 'story'
  | 'training'
  | 'abilities'
  | 'crew'
  | 'world'
  | 'settings';
const formatTime = (
  totalSeconds: number,
): string => {
  const safe =
    Math.max(
      0,
      Math.ceil(totalSeconds),
    );
  const hours =
    Math.floor(safe / 3600);
  const minutes =
    Math.floor(
      (safe % 3600) / 60,
    );
  const seconds =
    safe % 60;
  if (hours > 0) {
    return `${hours}h ${minutes
      .toString()
      .padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds
      .toString()
      .padStart(2, '0')}s`;
  }
  return `${seconds}s`;
};
const formatRep = (
  value: number,
): string => {
  if (value > 0) {
    return `+${value}`;
  }
  return value.toString();
};
function App() {
  const [
    activeTab,
    setActiveTab,
  ] = useState<Tab>('story');
  const isDead =
    useGameStore(
      (state) =>
        state.isDead,
    );
  if (isDead) {
    return <DeathScreen />;
  }
  return (
    <div className={styles.app}>
      <GameHeader />
      <nav
        className={styles.nav}
        aria-label="Game navigation"
      >
        <TabButton
          active={
            activeTab === 'story'
          }
          onClick={() =>
            setActiveTab('story')
          }
        >
          Story
        </TabButton>
        <TabButton
          active={
            activeTab === 'training'
          }
          onClick={() =>
            setActiveTab('training')
          }
        >
          Training
        </TabButton>
        <TabButton
          active={
            activeTab === 'abilities'
          }
          onClick={() =>
            setActiveTab(
              'abilities',
            )
          }
        >
          Abilities
        </TabButton>
        <TabButton
          active={
            activeTab === 'crew'
          }
          onClick={() =>
            setActiveTab('crew')
          }
        >
          Crew
        </TabButton>
        <TabButton
          active={
            activeTab === 'world'
          }
          onClick={() =>
            setActiveTab('world')
          }
        >
          World
        </TabButton>
        <TabButton
          active={
            activeTab === 'settings'
          }
          onClick={() =>
            setActiveTab(
              'settings',
            )
          }
        >
          Settings
        </TabButton>
      </nav>
      <main
        className={styles.content}
      >
        {activeTab === 'story' && (
          <StoryTab />
        )}
        {activeTab === 'training' && (
          <TrainingTab />
        )}
        {activeTab === 'abilities' && (
          <AbilitiesTab />
        )}
        {activeTab === 'crew' && (
          <CrewTab />
        )}
        {activeTab === 'world' && (
          <WorldTab />
        )}
        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </main>
    </div>
  );
}
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: string;
}
function TabButton({
  active,
  onClick,
  children,
}: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? styles.tabButtonActive
          : styles.tabButton
      }
      aria-current={
        active
          ? 'page'
          : undefined
      }
    >
      {children}
    </button>
  );
}
function GameHeader() {
  const era =
    useGameStore(
      (state) => state.era,
    );
  const stamina =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stamina,
          0,
        ),
    );
  const maxStamina =
    useGameStore(
      (state) =>
        formatDecimal(
          state.maxStamina,
          0,
        ),
    );
  const infamy =
    useGameStore(
      (state) =>
        formatDecimal(
          state.factions
            .infamy,
          0,
        ),
    );
  const lastEvent =
    useGameStore(
      (state) =>
        state.lastEvent,
    );
  const str =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stats.str,
          0,
        ),
    );
  const agi =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stats.agi,
          0,
        ),
    );
  const end =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stats.end,
          0,
        ),
    );
  const wil =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stats.wil,
          0,
        ),
    );
  return (
    <header
      className={styles.header}
    >
      <div
        className={styles.headerTop}
      >
        <div>
          <div
            className={styles.eyebrow}
          >
            GRAND LINE
          </div>
          <h1
            className={styles.title}
          >
            The Endless Voyage
          </h1>
        </div>
        <div
          className={styles.headerMeta}
        >
          <div
            className={styles.metaItem}
          >
            <span>ERA</span>
            <strong>{era}</strong>
          </div>
          <div
            className={styles.metaItem}
          >
            <span>STAMINA</span>
            <strong>
              {stamina} / {maxStamina}
            </strong>
          </div>
          <div
            className={styles.metaItem}
          >
            <span>INFAMY</span>
            <strong>{infamy}</strong>
          </div>
        </div>
      </div>
      <div
        className={styles.eventBar}
        aria-live="polite"
      >
        <span
          className={styles.eventMark}
        />
        <span>{lastEvent}</span>
      </div>
      <div
        className={styles.quickStats}
      >
        <HeaderStat
          label="STR"
          value={str}
        />
        <HeaderStat
          label="AGI"
          value={agi}
        />
        <HeaderStat
          label="END"
          value={end}
        />
        <HeaderStat
          label="WIL"
          value={wil}
        />
      </div>
    </header>
  );
}
function HeaderStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className={styles.quickStat}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function DeathScreen() {
  const lastEnding =
    useGameStore(
      (state) =>
        state.lastEnding,
    );
  const confirmInheritWill =
    useGameStore(
      (state) =>
        state.confirmInheritWill,
    );
  const hakiMultiplier =
    useGameStore(
      (state) =>
        formatDecimal(
          state.hakiMultiplier,
          3,
        ),
    );
  const era =
    useGameStore(
      (state) => state.era,
    );
  const endings =
    useGameStore(
      (state) => state.endings,
    );
  const heirlooms =
    useGameStore(
      (state) =>
        state.heirlooms,
    );
  const endingInfo =
    lastEnding
      ? endingsMeta[
          lastEnding
        ]
      : null;
  return (
    <main
      className={styles.deathScreen}
    >
      <section
        className={styles.deathCard}
      >
        <div
          className={
            styles.deathEyebrow
          }
        >
          ERA {era}
        </div>
        <h1>
          Your Journey Ends
        </h1>
        {endingInfo && (
          <div
            className={
              styles.endingPanel
            }
          >
            <span>
              FINAL CHAPTER
            </span>
            <h2>
              {endingInfo.name}
            </h2>
            <p>
              Heirloom secured
            </p>
            <strong>
              {endingInfo.heirloom}
            </strong>
          </div>
        )}
        <blockquote
          className={
            styles.deathQuote
          }
        >
          A man's dream will
          never die.
        </blockquote>
        <div
          className={
            styles.deathStats
          }
        >
          <div>
            <span>
              Inherited Haki
            </span>
            <strong>
              +{hakiMultiplier}
            </strong>
          </div>
          <div>
            <span>
              Endings found
            </span>
            <strong>
              {endings.length}
            </strong>
          </div>
          <div>
            <span>
              Heirlooms
            </span>
            <strong>
              {heirlooms.length}
            </strong>
          </div>
        </div>
        <button
          type="button"
          className={
            styles.primaryButton
          }
          onClick={
            confirmInheritWill
          }
        >
          Inherit Will
        </button>
      </section>
    </main>
  );
}
function StoryTab() {
  const chapterProgress =
    useGameStore(
      (state) =>
        state.chapterProgress,
    );
  const currentChapterId =
    useGameStore(
      (state) =>
        state.currentChapter,
    );
  const chapter =
    chapters.find(
      (entry) =>
        entry.id ===
        currentChapterId,
    );
  const makeChoice =
    useGameStore(
      (state) =>
        state.makeChoice,
    );
  const marineRep =
    useGameStore(
      (state) =>
        state.factions.marine,
    );
  const pirateRep =
    useGameStore(
      (state) =>
        state.factions.pirate,
    );
  const revRep =
    useGameStore(
      (state) =>
        state.factions
          .revolutionary,
    );
  const infamy =
    useGameStore(
      (state) =>
        formatDecimal(
          state.factions
            .infamy,
          0,
        ),
    );
  const doubleAgentUnlocked =
    useGameStore(
      (state) =>
        state.doubleAgentUnlocked,
    );
  const doubleAgentActive =
    useGameStore(
      (state) =>
        state.doubleAgentActive,
    );
  if (!chapter) {
    return (
      <SectionCard>
        <EmptyState>
          The story continues beyond
          the current chart.
        </EmptyState>
      </SectionCard>
    );
  }
  const toggleDoubleAgent =
    (): void => {
      dispatchCommand(
        (state) => {
          if (
            !state.doubleAgentActive
          ) {
            state.doubleAgentBackup =
              {
                pirate:
                  state.factions
                    .pirate,
                marine:
                  state.factions
                    .marine,
              };
            state.doubleAgentActive =
              true;
            state.lockedFactions =
              [
                'pirate',
                'marine',
              ];
            state.factions.pirate =
              50;
            state.factions.marine =
              50;
            state.lastEvent =
              'Double-Agent identity activated. Pirate and Marine reputation is temporarily frozen.';
            return;
          }
          if (
            state.doubleAgentBackup
          ) {
            state.factions.pirate =
              state.doubleAgentBackup
                .pirate;
            state.factions.marine =
              state.doubleAgentBackup
                .marine;
          }
          state.doubleAgentActive =
            false;
          state.doubleAgentBackup =
            null;
          state.lockedFactions =
            null;
          state.lastEvent =
            'Double-Agent identity deactivated. Your original reputation returns.';
        },
      );
    };
  return (
    <>
      <section
        className={styles.heroCard}
      >
        <div
          className={
            styles.sectionEyebrow
          }
        >
          ARC {chapter.arc} · CHAPTER{' '}
          {chapter.id}
        </div>
        <h2>
          {chapter.title}
        </h2>
        <p
          className={
            styles.leadText
          }
        >
          {chapter.description}
        </p>
        {chapter.speaker &&
          chapter.voiceLine && (
            <div
              className={
                styles.voiceLine
              }
            >
              <strong>
                {chapter.speaker}
              </strong>
              <span>
                "{chapter.voiceLine}"
              </span>
            </div>
          )}
        {chapterProgress ===
          0 &&
          chapter.choices.length >
            0 && (
            <div
              className={
                styles.choiceList
              }
            >
              {chapter.choices.map(
                (
                  choice: Choice,
                ) => {
                  const requirement =
                    choice.requirement;
                  const disabled =
                    requirement !==
                      undefined &&
                    useGameStore
                      .getState()
                      .stats[
                        requirement
                          .stat
                      ].lt(
                        requirement.value,
                      );
                  return (
                    <button
                      key={
                        choice.id
                      }
                      type="button"
                      className={
                        styles.choiceButton
                      }
                      onClick={() =>
                        makeChoice(
                          choice.id,
                        )
                      }
                      disabled={
                        disabled
                      }
                    >
                      <span>
                        {
                          choice.text
                        }
                      </span>
                      {requirement && (
                        <small>
                          Requires{' '}
                          {
                            requirement.value
                          }{' '}
                          {
                            requirement.stat.toUpperCase()
                          }
                        </small>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          )}
        {chapterProgress > 0 && (
          <div
            className={
              styles.resolvedMessage
            }
          >
            The decision is locked
            in. The Log Pose turns
            toward the next horizon.
          </div>
        )}
      </section>
      <SectionCard
        title="World Standing"
      >
        <FactionBar
          label="Pirate"
          value={pirateRep}
          className={
            styles.pirateFill
          }
        />
        <FactionBar
          label="Marine"
          value={marineRep}
          className={
            styles.marineFill
          }
        />
        <FactionBar
          label="Revolutionary"
          value={revRep}
          className={
            styles.revolutionFill
          }
        />
        <div
          className={
            styles.infamyRow
          }
        >
          <span>
            Infamy
          </span>
          <strong>
            {infamy}
          </strong>
        </div>
      </SectionCard>
      {doubleAgentUnlocked && (
        <SectionCard>
          <div
            className={
              styles.toggleRow
            }
          >
            <div>
              <strong>
                Double-Agent
              </strong>
              <p>
                Freeze Pirate and
                Marine reputation while
                cutting passive gains by
                50%.
              </p>
            </div>
            <input
              type="checkbox"
              checked={
                doubleAgentActive
              }
              onChange={
                toggleDoubleAgent
              }
            />
          </div>
        </SectionCard>
      )}
    </>
  );
}
function FactionBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  const width =
    Math.min(
      100,
      Math.abs(value),
    );
  return (
    <div
      className={
        styles.factionBar
      }
    >
      <div
        className={
          styles.factionBarTop
        }
      >
        <span>{label}</span>
        <strong>
          {formatRep(value)}
        </strong>
      </div>
      <div
        className={
          styles.factionTrack
        }
      >
        <div
          className={`${styles.factionFill} ${className}`}
          style={{
            width: `${width}%`,
          }}
        />
      </div>
    </div>
  );
}
function TrainingTab() {
  const str =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stats.str,
          1,
        ),
    );
  const agi =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stats.agi,
          1,
        ),
    );
  const end =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stats.end,
          1,
        ),
    );
  const wil =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stats.wil,
          1,
        ),
    );
  const stamina =
    useGameStore(
      (state) =>
        formatDecimal(
          state.stamina,
          0,
        ),
    );
  const maxStamina =
    useGameStore(
      (state) =>
        formatDecimal(
          state.maxStamina,
          0,
        ),
    );
  const train =
    useGameStore(
      (state) => state.train,
    );
  const canTrain =
    useGameStore(
      (state) =>
        state.stamina.gte(10),
    );
  const stats = [
    {
      key: 'str' as const,
      label: 'Strength',
      value: str,
      description:
        'Raw force and direct combat power.',
    },
    {
      key: 'agi' as const,
      label: 'Agility',
      value: agi,
      description:
        'Speed, footwork, and evasive movement.',
    },
    {
      key: 'end' as const,
      label: 'Endurance',
      value: end,
      description:
        'Durability and maximum stamina growth.',
    },
    {
      key: 'wil' as const,
      label: 'Willpower',
      value: wil,
      description:
        'Resolve, Haki potential, and mental resistance.',
    },
  ];
  return (
    <>
      <SectionCard>
        <div
          className={
            styles.trainingHero
          }
        >
          <div>
            <div
              className={
                styles.sectionEyebrow
              }
            >
              TRAINING GROUNDS
            </div>
            <h2>
              Build the captain
              you want to become.
            </h2>
            <p>
              Stamina regenerates
              continuously. END also
              expands your stamina
              ceiling over time.
            </p>
          </div>
          <div
            className={
              styles.staminaDisplay
            }
          >
            <span>
              STAMINA
            </span>
            <strong>
              {stamina}
            </strong>
            <small>
              / {maxStamina}
            </small>
          </div>
        </div>
      </SectionCard>
      <section
        className={styles.statGrid}
      >
        {stats.map((stat) => (
          <article
            key={stat.key}
            className={
              styles.statCard
            }
          >
            <div
              className={
                styles.statCardHeader
              }
            >
              <div>
                <span>
                  {stat.key.toUpperCase()}
                </span>
                <h3>
                  {stat.label}
                </h3>
              </div>
              <strong>
                {stat.value}
              </strong>
            </div>
            <p>
              {stat.description}
            </p>
            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={() =>
                train(stat.key)
              }
              disabled={!canTrain}
            >
              Train {stat.key.toUpperCase()}
              <small>
                10 stamina
              </small>
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
function AbilitiesTab() {
  const game =
    useGameStore();
  const eatFruit =
    game.eatFruit;
  const activeFruit =
    fruits.find(
      (fruit) =>
        fruit.id ===
        game.devilFruit,
    );
  const availableFruitIds =
    Array.from(
      new Set([
        ...game.worldFruits,
        ...Object.keys(
          game.inventory,
        ).filter((id) =>
          id.startsWith(
            'fruit_',
          ),
        ),
      ]),
    );
  return (
    <>
      <SectionCard
        title="Devil Fruit"
        subtitle="You only get one."
      >
        {activeFruit ? (
          <div
            className={
              styles.activeAbility
            }
          >
            <div>
              <span>
                CURRENT POWER
              </span>
              <h3>
                {activeFruit.name}
              </h3>
            </div>
            <strong>
              {activeFruit.multiplier.toFixed(
                2,
              )}
              x
            </strong>
            <p>
              {
                activeFruit.description
              }
            </p>
          </div>
        ) : (
          <div
            className={
              styles.emptyAbility
            }
          >
            <strong>
              Your body is still
              ordinary.
            </strong>
            <p>
              Consume a discovered
              Devil Fruit below to
              permanently change your
              combat multiplier.
            </p>
          </div>
        )}
        {!game.devilFruit &&
          availableFruitIds.length >
            0 && (
            <div
              className={
                styles.cardGrid
              }
            >
              {availableFruitIds.map(
                (fruitId) => {
                  const fruit =
                    fruits.find(
                      (entry) =>
                        entry.id ===
                        fruitId,
                    );
                  if (!fruit) {
                    return null;
                  }
                  const inventoryAmount =
                    game.inventory[
                      fruitId
                    ];
                  const worldAmount =
                    game.worldFruits.filter(
                      (id) =>
                        id ===
                        fruitId,
                    ).length;
                  const amount =
                    worldAmount +
                    (inventoryAmount
                      ?.toNumber() ??
                      0);
                  return (
                    <article
                      key={fruit.id}
                      className={
                        styles.itemCard
                      }
                    >
                      <div>
                        <span>
                          FOUND ×
                          {amount}
                        </span>
                        <h4>
                          {fruit.name}
                        </h4>
                        <p>
                          {
                            fruit.description
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        className={
                          styles.primaryButton
                        }
                        onClick={() =>
                          eatFruit(
                            fruit.id,
                          )
                        }
                      >
                        Eat
                      </button>
                    </article>
                  );
                },
              )}
            </div>
          )}
      </SectionCard>
      <SectionCard
        title="Haki"
        subtitle="Your spirit has a ceiling only until you break it."
      >
        <div
          className={
            styles.hakiGrid
          }
        >
          <AbilityMeter
            label="Observation"
            value={
              game.haki
                .observation
            }
            max={5}
          />
          <AbilityMeter
            label="Armament"
            value={
              game.haki.armament
            }
            max={5}
          />
          <div
            className={
              game.haki.conqueror
                ? styles.hakiCardUnlocked
                : styles.hakiCard
            }
          >
            <span>
              CONQUEROR
            </span>
            <strong>
              {game.haki
                .conqueror
                ? 'AWAKENED'
                : 'DORMANT'}
            </strong>
            <p>
              A rare disposition
              associated with
              overwhelming ambition.
            </p>
          </div>
        </div>
      </SectionCard>
      <SectionCard
        title="Skills"
        subtitle="Core-stat thresholds unlock permanent techniques."
      >
        <div
          className={
            styles.skillList
          }
        >
          {skills.map((skill) => {
            const unlocked =
              game.unlockedSkills.includes(
                skill.id,
              );
            const statValue =
              game.stats[
                skill.stat
              ].toNumber();
            const progress =
              Math.min(
                100,
                (statValue /
                  skill.threshold) *
                  100,
              );
            return (
              <article
                key={skill.id}
                className={
                  unlocked
                    ? styles.skillCardUnlocked
                    : styles.skillCard
                }
              >
                <div
                  className={
                    styles.skillHeader
                  }
                >
                  <div>
                    <span>
                      {skill.stat.toUpperCase()}
                    </span>
                    <h4>
                      {skill.name}
                    </h4>
                  </div>
                  <strong>
                    {unlocked
                      ? 'UNLOCKED'
                      : `${formatDecimal(
                          game.stats[
                            skill.stat
                          ],
                          0,
                        )} / ${skill.threshold}`}
                  </strong>
                </div>
                <p>
                  {skill.description}
                </p>
                <div
                  className={
                    styles.progressTrack
                  }
                >
                  <div
                    className={
                      styles.progressFill
                    }
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </SectionCard>
    </>
  );
}
function AbilityMeter({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width =
    Math.min(
      100,
      (value / max) * 100,
    );
  return (
    <div
      className={
        styles.hakiCard
      }
    >
      <span>
        {label.toUpperCase()}
      </span>
      <strong>
        Lv. {value}
      </strong>
      <div
        className={
          styles.progressTrack
        }
      >
        <div
          className={
            styles.progressFill
          }
          style={{
            width: `${width}%`,
          }}
        />
      </div>
      <p>
        {value >= max
          ? 'Mastered'
          : 'Keep training to deepen your control.'}
      </p>
    </div>
  );
}
function CrewTab() {
  const game =
    useGameStore();
  const [
    selectedExp,
    setSelectedExp,
  ] = useState(
    expeditions[0]?.id ?? '',
  );
  const [
    selectedCrew,
    setSelectedCrew,
  ] = useState('');
  const [, setCurrentTime] =
    useState(Date.now());
  const availableCrew =
    crewList.filter(
      (crew) =>
        game.unlockedCrew.includes(
          crew.id,
        ),
    );
  const busyCrewIds =
    new Set(
      game.activeExpeditions.map(
        (entry) =>
          entry.crewId,
      ),
    );
  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setCurrentTime(
            Date.now(),
          );
        },
        1000,
      );
    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, []);
  const handleStart =
    (): void => {
      if (
        !selectedExp ||
        !selectedCrew
      ) {
        return;
      }
      game.startExpedition(
        selectedExp,
        selectedCrew,
      );
      setSelectedCrew('');
    };
  return (
    <>
      <SectionCard
        title="Crew Manifest"
        subtitle="Your crew turns downtime into progress."
      >
        {availableCrew.length ===
        0 ? (
          <EmptyState>
            No crew members recruited
            yet. The story will bring
            people aboard.
          </EmptyState>
        ) : (
          <div
            className={
              styles.cardGrid
            }
          >
            {availableCrew.map(
              (crew) => (
                <article
                  key={crew.id}
                  className={
                    styles.itemCard
                  }
                >
                  <div>
                    <span>
                      CREW
                    </span>
                    <h3>
                      {crew.name}
                    </h3>
                    <strong>
                      {crew.title}
                    </strong>
                    <p>
                      {
                        crew.description
                      }
                    </p>
                    <small>
                      +{Math.round(
                        crew
                          .passiveMultiplier
                          .value *
                          100,
                      )}
                      %{' '}
                      {crew
                        .passiveMultiplier
                        .stat
                        .toUpperCase()}{' '}
                      training gain
                    </small>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </SectionCard>
      <SectionCard
        title="Expeditions"
        subtitle="Send available crew away while you train."
      >
        {availableCrew.length >
          0 && (
          <div
            className={
              styles.expeditionControls
            }
          >
            <label>
              <span>
                EXPEDITION
              </span>
              <select
                value={
                  selectedExp
                }
                onChange={(
                  event,
                ) =>
                  setSelectedExp(
                    event.target
                      .value,
                  )
                }
              >
                {expeditions.map(
                  (expedition) => (
                    <option
                      key={
                        expedition.id
                      }
                      value={
                        expedition.id
                      }
                    >
                      {
                        expedition.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>
            <label>
              <span>
                CREW
              </span>
              <select
                value={
                  selectedCrew
                }
                onChange={(
                  event,
                ) =>
                  setSelectedCrew(
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  Select crew
                </option>
                {availableCrew.map(
                  (crew) => (
                    <option
                      key={
                        crew.id
                      }
                      value={
                        crew.id
                      }
                      disabled={busyCrewIds.has(
                        crew.id,
                      )}
                    >
                      {crew.name}
                      {busyCrewIds.has(
                        crew.id,
                      )
                        ? ' — away'
                        : ''}
                    </option>
                  ),
                )}
              </select>
            </label>
            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={
                handleStart
              }
              disabled={
                !selectedExp ||
                !selectedCrew
              }
            >
              Dispatch
            </button>
          </div>
        )}
        <div
          className={
            styles.expeditionList
          }
        >
          {game.activeExpeditions.length ===
          0 ? (
            <EmptyState>
              No crews are currently
              away.
            </EmptyState>
          ) : (
            game.activeExpeditions.map(
              (active) => {
                const expedition =
                  expeditions.find(
                    (entry) =>
                      entry.id ===
                      active.id,
                  );
                const crew =
                  crewList.find(
                    (entry) =>
                      entry.id ===
                      active.crewId,
                  );
                const remaining =
                  Math.max(
                    0,
                    Math.ceil(
                      (active.completeAt -
                        Date.now()) /
                        1000,
                    ),
                  );
                const complete =
                  remaining === 0;
                return (
                  <article
                    key={`${active.id}-${active.crewId}`}
                    className={
                      styles.expeditionCard
                    }
                  >
                    <div>
                      <span>
                        AWAY
                      </span>
                      <h4>
                        {
                          expedition?.name
                        }
                      </h4>
                      <p>
                        Assigned:{' '}
                        {
                          crew?.name ??
                          active.crewId
                        }
                      </p>
                    </div>
                    {complete ? (
                      <button
                        type="button"
                        className={
                          styles.primaryButton
                        }
                        onClick={() =>
                          game.claimExpedition(
                            active.id,
                          )
                        }
                      >
                        Claim Rewards
                      </button>
                    ) : (
                      <strong>
                        {formatTime(
                          remaining,
                        )}
                      </strong>
                    )}
                  </article>
                );
              },
            )
          )}
        </div>
      </SectionCard>
      <SectionCard
        title="Ship Cargo"
      >
        {Object.keys(
          game.inventory,
        ).length === 0 ? (
          <EmptyState>
            Cargo hold is empty.
          </EmptyState>
        ) : (
          <div
            className={
              styles.inventoryGrid
            }
          >
            {Object.entries(
              game.inventory,
            ).map(
              ([
                itemId,
                amount,
              ]) => (
                <div
                  key={itemId}
                  className={
                    styles.inventoryItem
                  }
                >
                  <span>
                    {itemId.replaceAll(
                      '_',
                      ' ',
                    )}
                  </span>
                  <strong>
                    {formatDecimal(
                      amount,
                      0,
                    )}
                  </strong>
                </div>
              ),
            )}
          </div>
        )}
      </SectionCard>
    </>
  );
}
function WorldTab() {
  const game =
    useGameStore();
  const currentPower =
    game.stats.str
      .plus(game.stats.agi)
      .plus(game.stats.end)
      .plus(game.stats.wil);
  return (
    <>
      <SectionCard
        title="World Threats"
        subtitle="Bosses are one-time tests with permanent rewards."
      >
        <div
          className={
            styles.worldPower
          }
        >
          <span>
            CURRENT COMBAT POWER
          </span>
          <strong>
            {formatDecimal(
              currentPower,
              0,
            )}
          </strong>
        </div>
      </SectionCard>
      <div
        className={
          styles.bossList
        }
      >
        {worldBosses.map(
          (boss) => {
            const locked =
              game.currentChapter <
              boss.requiresChapter;
            const defeated =
              game.defeatedBosses.includes(
                boss.id,
              );
            const best =
              game
                .highestBossDamage[
                boss.id
              ];
            return (
              <article
                key={boss.id}
                className={
                  defeated
                    ? styles.bossCardDefeated
                    : styles.bossCard
                }
              >
                <div
                  className={
                    styles.bossHeader
                  }
                >
                  <div>
                    <span>
                      {locked
                        ? `UNLOCKS IN CHAPTER ${boss.requiresChapter}`
                        : defeated
                          ? 'DEFEATED'
                          : 'WORLD THREAT'}
                    </span>
                    <h3>
                      {boss.name}
                    </h3>
                  </div>
                  <strong>
                    HP{' '}
                    {formatDecimal(
                      boss.hp,
                      0,
                    )}
                  </strong>
                </div>
                <p>
                  {
                    boss.description
                  }
                </p>
                <div
                  className={
                    styles.bossMeta
                  }
                >
                  <span>
                    Cost:{' '}
                    {
                      boss.staminaCost
                    }{' '}
                    stamina
                  </span>
                  <span>
                    Reward:{' '}
                    {
                      boss.rewardText
                    }
                  </span>
                </div>
                {best && (
                  <div
                    className={
                      styles.bossBest
                    }
                  >
                    Best damage:{' '}
                    {formatDecimal(
                      best,
                      0,
                    )}
                  </div>
                )}
                <button
                  type="button"
                  className={
                    styles.primaryButton
                  }
                  onClick={() =>
                    game.challengeBoss(
                      boss.id,
                    )
                  }
                  disabled={
                    locked ||
                    defeated ||
                    !game.stamina.gte(
                      boss.staminaCost,
                    )
                  }
                >
                  {defeated
                    ? 'Defeated'
                    : locked
                      ? 'Locked'
                      : 'Challenge'}
                </button>
              </article>
            );
          },
        )}
      </div>
    </>
  );
}
function SettingsTab() {
  const {
    audioEnabled,
    hapticsEnabled,
    reduceMotion,
    toggleAudio,
    toggleHaptics,
    toggleMotion,
    resetSave,
  } = useSettingsStore();
  return (
    <>
      <SectionCard
        title="Settings"
        subtitle="Small controls that shape how the voyage feels."
      >
        <div
          className={
            styles.settingsList
          }
        >
          <SettingRow
            label="Audio"
            description="Leave space for future sound effects without changing the game flow."
            checked={audioEnabled}
            onChange={
              toggleAudio
            }
          />
          <SettingRow
            label="Haptics"
            description="Use short vibration feedback on supported devices."
            checked={hapticsEnabled}
            onChange={
              toggleHaptics
            }
          />
          <SettingRow
            label="Reduce motion"
            description="Remove most interface transitions."
            checked={
              reduceMotion
            }
            onChange={
              toggleMotion
            }
          />
        </div>
      </SectionCard>
      <SectionCard
        title="Danger Zone"
        subtitle="This permanently clears your local voyage."
      >
        <button
          type="button"
          className={
            styles.dangerButton
          }
          onClick={() => {
            const confirmed =
              window.confirm(
                'Start a new voyage? This erases the current local save.',
              );
            if (confirmed) {
              resetSave();
            }
          }}
        >
          Start New Voyage
        </button>
      </SectionCard>
    </>
  );
}
function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={
        styles.settingRow
      }
    >
      <div>
        <strong>
          {label}
        </strong>
        <p>
          {description}
        </p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
}
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        styles.sectionCard
      }
    >
      {title && (
        <div
          className={
            styles.sectionHeader
          }
        >
          <div>
            <h2>{title}</h2>
            {subtitle && (
              <p>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}
function EmptyState({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        styles.emptyState
      }
    >
      {children}
    </div>
  );
}
export default App;
