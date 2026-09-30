import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useSettingsStore } from './store/settingsStore';
import { formatDecimal } from './utils/math';
import { chapters } from './data/chapters';
import { endingsMeta } from './engine/prestige';
import type { Choice } from './data/chapters';
import { dispatchCommand } from './engine/loop';
import styles from './App.module.css';

function App() {
  const [activeTab, setActiveTab] = useState<
    'story' | 'training' | 'settings'
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

  const getStatVal = (stat: string): number => {
    const stats = useGameStore.getState().stats;
    const key = stat as keyof typeof stats;
    const value = stats[key];

    if (value && typeof value.toNumber === 'function') {
      return value.toNumber();
    }

    return 0;
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

          <p>
            Locks Pirate &amp; Marine at +50 and applies -50% passive stat
            gains.
          </p>
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
  const paranoiaActive = useGameStore((s) => s.doubleAgentActive);
  const train = useGameStore((s) => s.train);

  const canTrain = useGameStore((s) => s.stamina.gte(10));
  const passiveRate = paranoiaActive ? '+0.05' : '+0.10';

  return (
    <section className={styles.section}>
      <h2>Training Grounds</h2>

      <p>
        Stamina: <strong>{stamina}</strong> /{' '}
        <strong>{maxStamina}</strong>
      </p>

      <p>Base Passive Gain: {passiveRate} per second</p>

      {paranoiaActive && (
        <p>Paranoia Active: Passive gains halved.</p>
      )}

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