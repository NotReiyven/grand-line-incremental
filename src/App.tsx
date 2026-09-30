import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useSettingsStore } from './store/settingsStore';
import { formatDecimal } from './utils/math';
import { chapters } from './data/chapters';
import { crewList } from './data/crew';
import { expeditions } from './data/expeditions';
import { endingsMeta } from './engine/prestige';
import type { Choice } from './data/chapters';
import { dispatchCommand } from './engine/loop';
import styles from './App.module.css';

function App() {
  const [activeTab, setActiveTab] = useState<
    'story' | 'training' | 'crew' | 'settings'
  >('story');

  const isDead = useGameStore((s) => s.isDead);

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
          className={activeTab === 'story' ? styles.activeTab : ''}
        >
          Story
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('training')}
          aria-pressed={activeTab === 'training'}
          className={activeTab === 'training' ? styles.activeTab : ''}
        >
          Training
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('crew')}
          aria-pressed={activeTab === 'crew'}
          className={activeTab === 'crew' ? styles.activeTab : ''}
        >
          Crew
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          aria-pressed={activeTab === 'settings'}
          className={activeTab === 'settings' ? styles.activeTab : ''}
        >
          Settings
        </button>
      </nav>

      <main className={styles.content}>
        {activeTab === 'story' && <StoryTab />}
        {activeTab === 'training' && <TrainingTab />}
        {activeTab === 'crew' && <CrewTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

function DeathScreen() {
  const lastEnding = useGameStore((s) => s.lastEnding);
  const confirmInheritWill = useGameStore((s) => s.confirmInheritWill);
  const hakiMultiplier = useGameStore((s) =>
    formatDecimal(s.hakiMultiplier, 3),
  );
  const era = useGameStore((s) => s.era);

  const endingInfo = lastEnding ? endingsMeta[lastEnding] : null;

  return (
    <main className={styles.deathScreen}>
      <section className={styles.section}>
        <h1>Your Journey Ends</h1>

        {endingInfo && (
          <div className={styles.endingInfo}>
            <h2>{endingInfo.name}</h2>

            <p>
              Heirloom Secured: <strong>{endingInfo.heirloom}</strong>
            </p>
          </div>
        )}

        <blockquote>"A man's dream will never die."</blockquote>

        <p>Entering Era {era + 1}</p>

        <p>
          Inherited Haki Multiplier: +{hakiMultiplier}
        </p>

        <button type="button" onClick={confirmInheritWill}>
          Inherit Will
        </button>
      </section>
    </main>
  );
}

function StoryTab() {
  const chapterProgress = useGameStore((s) => s.chapterProgress);
  const currentChapterId = useGameStore((s) => s.currentChapter);
  const chapter = chapters.find((c) => c.id === currentChapterId);
  const makeChoice = useGameStore((s) => s.makeChoice);

  const marineRep = useGameStore((s) => s.factions.marine);
  const pirateRep = useGameStore((s) => s.factions.pirate);
  const revRep = useGameStore((s) => s.factions.revolutionary);
  const infamyText = useGameStore((s) =>
    formatDecimal(s.factions.infamy, 0),
  );

  const doubleAgentUnlocked = useGameStore((s) => s.doubleAgentUnlocked);
  const doubleAgentActive = useGameStore((s) => s.doubleAgentActive);

  if (!chapter) {
    return (
      <section className={styles.section}>
        <h2>The Story Continues...</h2>
      </section>
    );
  }

  const getStatVal = (stat: Choice['requirement'] extends undefined
    ? never
    : NonNullable<Choice['requirement']>['stat']): number => {
    const stats = useGameStore.getState().stats;
    return stats[stat].toNumber();
  };

  const toggleDoubleAgent = () => {
    dispatchCommand((state) => {
      state.doubleAgentActive = !state.doubleAgentActive;

      if (state.doubleAgentActive) {
        state.lockedFactions = ['pirate', 'marine'];
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

      <p className={styles.description}>{chapter.description}</p>

      {chapter.speaker && chapter.voiceLine && (
        <p className={styles.voiceLine}>
          <strong>{chapter.speaker}:</strong> "{chapter.voiceLine}"
        </p>
      )}

      {chapterProgress === 0 && chapter.choices.length > 0 && (
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
                onClick={() => makeChoice(choice.id)}
                disabled={disabled}
                className={styles.choiceButton}
              >
                {choice.text}
              </button>
            );
          })}
        </div>
      )}

      {chapterProgress > 0 && <p>The die is cast.</p>}

      <section className={styles.worldStanding}>
        <h3>World Standing</h3>

        <p>Marine Reputation: {marineRep}</p>
        <p>Pirate Reputation: {pirateRep}</p>
        <p>Revolutionary Reputation: {revRep}</p>
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

          <p>-50% passive stat gains while active.</p>
        </section>
      )}
    </section>
  );
}

function TrainingTab() {
  const str = useGameStore((s) => formatDecimal(s.stats.str, 1));
  const agi = useGameStore((s) => formatDecimal(s.stats.agi, 1));
  const end = useGameStore((s) => formatDecimal(s.stats.end, 1));
  const wil = useGameStore((s) => formatDecimal(s.stats.wil, 1));

  const stamina = useGameStore((s) => formatDecimal(s.stamina, 0));
  const maxStamina = useGameStore((s) => formatDecimal(s.maxStamina, 0));
  const train = useGameStore((s) => s.train);
  const canTrain = useGameStore((s) => s.stamina.gte(10));

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

function CrewTab() {
  const unlockedCrewIds = useGameStore((s) => s.unlockedCrew);
  const activeExpeditions = useGameStore((s) => s.activeExpeditions);
  const inventory = useGameStore((s) => s.inventory);
  const startExpedition = useGameStore((s) => s.startExpedition);
  const claimExpedition = useGameStore((s) => s.claimExpedition);

  const [selectedExp, setSelectedExp] = useState(
    expeditions[0]?.id ?? '',
  );
  const [selectedCrew, setSelectedCrew] = useState('');
  const [, setCurrentTime] = useState(Date.now());

  const availableCrew = crewList.filter((crew) =>
    unlockedCrewIds.includes(crew.id),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (!selectedExp || !selectedCrew) return;

    startExpedition(selectedExp, selectedCrew);
    setSelectedCrew('');
  };

  return (
    <section className={styles.section}>
      <h2>Crew Manifest</h2>

      {availableCrew.length === 0 ? (
        <p>
          No crew members recruited yet. Advance the story to find
          allies.
        </p>
      ) : (
        <div>
          {availableCrew.map((crew) => (
            <article key={crew.id} className={styles.card}>
              <h3>
                {crew.name} - {crew.title}
              </h3>

              <p>{crew.description}</p>

              <p>
                Passive: +{crew.passiveMultiplier.value * 100}% to{' '}
                {crew.passiveMultiplier.stat.toUpperCase()} gain
              </p>
            </article>
          ))}
        </div>
      )}

      {availableCrew.length > 0 && (
        <section>
          <h3>Expeditions</h3>

          <div>
            <label>
              Expedition
              <select
                value={selectedExp}
                onChange={(event) => setSelectedExp(event.target.value)}
              >
                {expeditions.map((expedition) => (
                  <option key={expedition.id} value={expedition.id}>
                    {expedition.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Crew
              <select
                value={selectedCrew}
                onChange={(event) => setSelectedCrew(event.target.value)}
              >
                <option value="">Select crew</option>

                {availableCrew.map((crew) => (
                  <option key={crew.id} value={crew.id}>
                    {crew.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleStart}
              disabled={!selectedExp || !selectedCrew}
            >
              Dispatch
            </button>
          </div>

          <div>
            {activeExpeditions.length === 0 ? (
              <p>No active expeditions.</p>
            ) : (
              activeExpeditions.map((activeExpedition) => {
                const expedition = expeditions.find(
                  (exp) => exp.id === activeExpedition.id,
                );

                const crew = crewList.find(
                  (member) => member.id === activeExpedition.crewId,
                );

                const remaining = Math.max(
                  0,
                  Math.ceil(
                    (activeExpedition.completeAt - Date.now()) / 1000,
                  ),
                );

                const isDone = remaining === 0;

                return (
                  <article
                    key={`${activeExpedition.id}-${activeExpedition.crewId}`}
                    className={styles.card}
                  >
                    <h4>{expedition?.name ?? 'Unknown Expedition'}</h4>

                    <p>
                      Assigned:{' '}
                      {crew?.name ?? activeExpedition.crewId}
                    </p>

                    {isDone ? (
                      <button
                        type="button"
                        onClick={() =>
                          claimExpedition(activeExpedition.id)
                        }
                      >
                        Claim Rewards
                      </button>
                    ) : (
                      <p>Returns in: {remaining}s</p>
                    )}
                  </article>
                );
              })
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
            {Object.entries(inventory).map(([itemId, amount]) => (
              <p key={itemId}>
                {itemId.toUpperCase()}: {formatDecimal(amount, 0)}
              </p>
            ))}
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