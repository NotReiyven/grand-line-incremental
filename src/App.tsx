import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useSettingsStore } from './store/settingsStore';
import { formatDecimal } from './utils/math';
import { chapters } from './data/chapters';
import { crewList } from './data/crew';
import { expeditions } from './data/expeditions';
import { endingsMeta } from './engine/prestige';
import { skills } from './data/skills';
import { fruits } from './data/fruits';
import type { Choice } from './data/chapters';
import { dispatchCommand } from './engine/loop';
import styles from './App.module.css';

function App() {
  const [activeTab, setActiveTab] = useState<
    'story' | 'training' | 'abilities' | 'crew' | 'settings'
  >('story');

  const isDead = useGameStore((state) => state.isDead);

  if (isDead) {
    return <DeathScreen />;
  }

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <button
          type="button"
          onClick={() => setActiveTab('story')}
          aria-pressed={activeTab === 'story'}
          className={
            activeTab === 'story' ? styles.activeTab : ''
          }
        >
          Story
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('training')}
          aria-pressed={activeTab === 'training'}
          className={
            activeTab === 'training' ? styles.activeTab : ''
          }
        >
          Training
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('abilities')}
          aria-pressed={activeTab === 'abilities'}
          className={
            activeTab === 'abilities' ? styles.activeTab : ''
          }
        >
          Abilities
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('crew')}
          aria-pressed={activeTab === 'crew'}
          className={
            activeTab === 'crew' ? styles.activeTab : ''
          }
        >
          Crew
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          aria-pressed={activeTab === 'settings'}
          className={
            activeTab === 'settings' ? styles.activeTab : ''
          }
        >
          Settings
        </button>
      </nav>

      <main className={styles.content}>
        {activeTab === 'story' && <StoryTab />}
        {activeTab === 'training' && <TrainingTab />}
        {activeTab === 'abilities' && <AbilitiesTab />}
        {activeTab === 'crew' && <CrewTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

function DeathScreen() {
  const lastEnding = useGameStore((state) => state.lastEnding);

  const confirmInheritWill = useGameStore(
    (state) => state.confirmInheritWill,
  );

  const hakiMultiplier = useGameStore((state) =>
    formatDecimal(state.hakiMultiplier, 3),
  );

  const era = useGameStore((state) => state.era);

  const endingInfo = lastEnding
    ? endingsMeta[lastEnding]
    : null;

  return (
    <main className={styles.deathScreen}>
      <section className={styles.section}>
        <h1>Your Journey Ends</h1>

        {endingInfo && (
          <div className={styles.endingInfo}>
            <h2>{endingInfo.name}</h2>

            <p>
              Heirloom Secured:{' '}
              <strong>{endingInfo.heirloom}</strong>
            </p>
          </div>
        )}

        <blockquote>
          "A man's dream will never die."
        </blockquote>

        <p>Entering Era {era + 1}</p>

        <p>
          Inherited Haki Multiplier: +{hakiMultiplier}
        </p>

        <button
          type="button"
          onClick={confirmInheritWill}
        >
          Inherit Will
        </button>
      </section>
    </main>
  );
}

function StoryTab() {
  const chapterProgress = useGameStore(
    (state) => state.chapterProgress,
  );

  const currentChapterId = useGameStore(
    (state) => state.currentChapter,
  );

  const chapter = chapters.find(
    (currentChapter) =>
      currentChapter.id === currentChapterId,
  );

  const makeChoice = useGameStore(
    (state) => state.makeChoice,
  );

  const marineRep = useGameStore(
    (state) => state.factions.marine,
  );

  const pirateRep = useGameStore(
    (state) => state.factions.pirate,
  );

  const revRep = useGameStore(
    (state) => state.factions.revolutionary,
  );

  const infamyText = useGameStore((state) =>
    formatDecimal(state.factions.infamy, 0),
  );

  const doubleAgentUnlocked = useGameStore(
    (state) => state.doubleAgentUnlocked,
  );

  const doubleAgentActive = useGameStore(
    (state) => state.doubleAgentActive,
  );

  const getStatVal = (
    stat: NonNullable<Choice['requirement']>['stat'],
  ): number => {
    const stats = useGameStore.getState().stats;
    return stats[stat].toNumber();
  };

  if (!chapter) {
    return (
      <section className={styles.section}>
        <h2>The Story Continues...</h2>
      </section>
    );
  }

  const toggleDoubleAgent = () => {
    dispatchCommand((state) => {
      state.doubleAgentActive =
        !state.doubleAgentActive;

      if (state.doubleAgentActive) {
        state.lockedFactions = [
          'pirate',
          'marine',
        ];

        state.factions.pirate = 50;
        state.factions.marine = 50;
      } else {
        state.lockedFactions = null;
        state.factions.pirate = -50;
        state.factions.marine = -50;
      }
    });
  };

  return (
    <section className={styles.section}>
      <h2>
        Arc {chapter.arc} - {chapter.title}
      </h2>

      <p className={styles.description}>
        {chapter.description}
      </p>

      {chapter.speaker && chapter.voiceLine && (
        <p className={styles.voiceLine}>
          <strong>{chapter.speaker}:</strong>{' '}
          "{chapter.voiceLine}"
        </p>
      )}

      {chapterProgress === 0 &&
        chapter.choices.length > 0 && (
          <div className={styles.choices}>
            {chapter.choices.map((choice: Choice) => {
              const disabled =
                choice.requirement !== undefined &&
                getStatVal(choice.requirement.stat) <
                  choice.requirement.value;

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() =>
                    makeChoice(choice.id)
                  }
                  disabled={disabled}
                  className={styles.choiceButton}
                >
                  {choice.text}
                </button>
              );
            })}
          </div>
        )}

      {chapterProgress > 0 && (
        <p>The die is cast.</p>
      )}

      <section className={styles.worldStanding}>
        <h3>World Standing</h3>

        <p>
          Marine Reputation: {marineRep}
        </p>

        <p>
          Pirate Reputation: {pirateRep}
        </p>

        <p>
          Revolutionary Reputation: {revRep}
        </p>

        <p>Infamy: {infamyText}</p>
      </section>

      {doubleAgentUnlocked && (
        <section className={styles.doubleAgent}>
          <label>
            <input
              type="checkbox"
              checked={doubleAgentActive}
              onChange={toggleDoubleAgent}
            />
            <strong> Activate Double-Agent</strong>
          </label>

          <p>
            -50% passive stat gains while active.
          </p>
        </section>
      )}
    </section>
  );
}

function TrainingTab() {
  const str = useGameStore((state) =>
    formatDecimal(state.stats.str, 1),
  );

  const agi = useGameStore((state) =>
    formatDecimal(state.stats.agi, 1),
  );

  const end = useGameStore((state) =>
    formatDecimal(state.stats.end, 1),
  );

  const wil = useGameStore((state) =>
    formatDecimal(state.stats.wil, 1),
  );

  const stamina = useGameStore((state) =>
    formatDecimal(state.stamina, 0),
  );

  const maxStamina = useGameStore((state) =>
    formatDecimal(state.maxStamina, 0),
  );

  const train = useGameStore(
    (state) => state.train,
  );

  const canTrain = useGameStore((state) =>
    state.stamina.gte(10),
  );

  return (
    <section className={styles.section}>
      <h2>Training Grounds</h2>

      <p>
        Stamina: <strong>{stamina}</strong> /{' '}
        <strong>{maxStamina}</strong>
      </p>

      <div className={styles.trainingStats}>
        <div>
          <p>Strength: {str}</p>

          <button
            type="button"
            onClick={() => train('str')}
            disabled={!canTrain}
          >
            Train STR
          </button>
        </div>

        <div>
          <p>Agility: {agi}</p>

          <button
            type="button"
            onClick={() => train('agi')}
            disabled={!canTrain}
          >
            Train AGI
          </button>
        </div>

        <div>
          <p>Endurance: {end}</p>

          <button
            type="button"
            onClick={() => train('end')}
            disabled={!canTrain}
          >
            Train END
          </button>
        </div>

        <div>
          <p>Willpower: {wil}</p>

          <button
            type="button"
            onClick={() => train('wil')}
            disabled={!canTrain}
          >
            Train WIL
          </button>
        </div>
      </div>
    </section>
  );
}

function AbilitiesTab() {
  const unlockedSkills = useGameStore(
    (state) => state.unlockedSkills,
  );

  const haki = useGameStore(
    (state) => state.haki,
  );

  const devilFruitId = useGameStore(
    (state) => state.devilFruit,
  );

  const inventory = useGameStore(
    (state) => state.inventory,
  );

  const eatFruit = useGameStore(
    (state) => state.eatFruit,
  );

  const activeFruit = fruits.find(
    (fruit) => fruit.id === devilFruitId,
  );

  const edibleFruits = fruits.filter((fruit) => {
    const amount = inventory[fruit.id];

    return amount !== undefined && amount.gte(1);
  });

  return (
    <section className={styles.section}>
      <h2>Abilities</h2>

      <section className={styles.card}>
        <h3>Devil Fruit</h3>

        {activeFruit ? (
          <>
            <h4>{activeFruit.name}</h4>

            <p>{activeFruit.description}</p>

            <p>
              Combat Multiplier:{' '}
              {activeFruit.multiplier}x
            </p>
          </>
        ) : (
          <>
            <p>
              You are a standard human. The sea does
              not hate you.
            </p>

            {edibleFruits.length > 0 && (
              <>
                <h4>
                  Uneaten Fruits in Inventory
                </h4>

                <div>
                  {edibleFruits.map((fruit) => (
                    <article
                      key={fruit.id}
                      className={styles.card}
                    >
                      <h4>{fruit.name}</h4>

                      <p>
                        {fruit.description}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          eatFruit(fruit.id)
                        }
                      >
                        Eat
                      </button>
                    </article>
                  ))}
                </div>

                <p>
                  Warning: You can only eat one. The
                  sea will forever reject you.
                </p>
              </>
            )}
          </>
        )}
      </section>

      <section className={styles.card}>
        <h3>Skills</h3>

        {unlockedSkills.length === 0 ? (
          <p>
            Push your core stats higher to awaken
            combat skills.
          </p>
        ) : (
          unlockedSkills.map((skillId) => {
            const skill = skills.find(
              (entry) => entry.id === skillId,
            );

            if (!skill) {
              return null;
            }

            return (
              <article
                key={skill.id}
                className={styles.card}
              >
                <h4>{skill.name}</h4>

                <p>{skill.description}</p>
              </article>
            );
          })
        )}
      </section>

      {(haki.observation > 0 ||
        haki.armament > 0 ||
        haki.conqueror) && (
        <section className={styles.card}>
          <h3>Haki</h3>

          {haki.observation > 0 && (
            <p>
              Observation Haki (Level{' '}
              {haki.observation})
            </p>
          )}

          {haki.armament > 0 && (
            <p>
              Armament Haki (Level{' '}
              {haki.armament})
            </p>
          )}

          {haki.conqueror && (
            <p>
              Conqueror's Haki
              <br />
              The disposition of a king.
            </p>
          )}
        </section>
      )}
    </section>
  );
}

function CrewTab() {
  const unlockedCrewIds = useGameStore(
    (state) => state.unlockedCrew,
  );

  const activeExpeditions = useGameStore(
    (state) => state.activeExpeditions,
  );

  const inventory = useGameStore(
    (state) => state.inventory,
  );

  const startExpedition = useGameStore(
    (state) => state.startExpedition,
  );

  const claimExpedition = useGameStore(
    (state) => state.claimExpedition,
  );

  const [selectedExp, setSelectedExp] =
    useState<string>(
      expeditions[0]?.id ?? '',
    );

  const [selectedCrew, setSelectedCrew] =
    useState<string>('');

  const [, setCurrentTime] = useState(
    Date.now(),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const availableCrew = crewList.filter(
    (crew) => unlockedCrewIds.includes(crew.id),
  );

  const handleStart = () => {
    if (!selectedExp || !selectedCrew) {
      return;
    }

    startExpedition(
      selectedExp,
      selectedCrew,
    );

    setSelectedCrew('');
  };

  return (
    <section className={styles.section}>
      <h2>Crew Manifest</h2>

      {availableCrew.length === 0 ? (
        <p>
          No crew members recruited yet. Advance the
          story to find allies.
        </p>
      ) : (
        <div className={styles.crewList}>
          {availableCrew.map((crew) => (
            <article
              key={crew.id}
              className={styles.card}
            >
              <h3>
                {crew.name} - {crew.title}
              </h3>

              <p>{crew.description}</p>

              <p>
                Passive: +
                {crew.passiveMultiplier.value * 100}
                % to{' '}
                {crew.passiveMultiplier.stat.toUpperCase()}{' '}
                gain
              </p>
            </article>
          ))}
        </div>
      )}

      {availableCrew.length > 0 && (
        <section>
          <h3>Expeditions</h3>

          <div className={styles.settingsRow}>
            <label>
              Expedition
              <select
                value={selectedExp}
                onChange={(event) =>
                  setSelectedExp(
                    event.target.value,
                  )
                }
              >
                {expeditions.map((expedition) => (
                  <option
                    key={expedition.id}
                    value={expedition.id}
                  >
                    {expedition.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Crew
              <select
                value={selectedCrew}
                onChange={(event) =>
                  setSelectedCrew(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select crew
                </option>

                {availableCrew.map((crew) => (
                  <option
                    key={crew.id}
                    value={crew.id}
                  >
                    {crew.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleStart}
              disabled={
                !selectedExp || !selectedCrew
              }
            >
              Dispatch
            </button>
          </div>

          <div className={styles.crewList}>
            {activeExpeditions.length === 0 ? (
              <p>No active expeditions.</p>
            ) : (
              activeExpeditions.map(
                (activeExpedition) => {
                  const expedition =
                    expeditions.find(
                      (entry) =>
                        entry.id ===
                        activeExpedition.id,
                    );

                  const crew = crewList.find(
                    (member) =>
                      member.id ===
                      activeExpedition.crewId,
                  );

                  const remaining = Math.max(
                    0,
                    Math.ceil(
                      (activeExpedition.completeAt -
                        Date.now()) /
                        1000,
                    ),
                  );

                  const isDone = remaining === 0;

                  return (
                    <article
                      key={`${activeExpedition.id}-${activeExpedition.crewId}`}
                      className={styles.card}
                    >
                      <h4>
                        {expedition?.name ??
                          'Unknown Expedition'}
                      </h4>

                      <p>
                        Assigned:{' '}
                        {crew?.name ??
                          activeExpedition.crewId}
                      </p>

                      {isDone ? (
                        <button
                          type="button"
                          onClick={() =>
                            claimExpedition(
                              activeExpedition.id,
                            )
                          }
                        >
                          Claim Rewards
                        </button>
                      ) : (
                        <p>
                          Returns in: {remaining}s
                        </p>
                      )}
                    </article>
                  );
                },
              )
            )}
          </div>
        </section>
      )}

      <section>
        <h3>Ship Cargo</h3>

        {Object.keys(inventory).length === 0 ? (
          <p>Cargo hold is empty.</p>
        ) : (
          <div>
            {Object.entries(inventory).map(
              ([itemId, amount]) => (
                <p key={itemId}>
                  {itemId.toUpperCase()}:{' '}
                  {formatDecimal(amount, 0)}
                </p>
              ),
            )}
          </div>
        )}
      </section>
    </section>
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
  } = useSettingsStore();

  return (
    <section className={styles.section}>
      <h2>Settings</h2>

      <label className={styles.setting}>
        <input
          type="checkbox"
          checked={audioEnabled}
          onChange={toggleAudio}
        />
        Enable Audio
      </label>

      <label className={styles.setting}>
        <input
          type="checkbox"
          checked={hapticsEnabled}
          onChange={toggleHaptics}
        />
        Enable Haptics
      </label>

      <label className={styles.setting}>
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={toggleMotion}
        />
        Reduce Motion
      </label>
    </section>
  );
}

export default App;