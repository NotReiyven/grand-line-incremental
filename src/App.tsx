import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useSettingsStore } from './store/settingsStore';
import { formatDecimal } from './utils/math';
import { chapters } from './data/chapters';
import { dispatchCommand } from './engine/loop';

function App() {
  const [activeTab, setActiveTab] = useState<
    'story' | 'training' | 'settings'
  >('story');

  return (
    <div>
      <main>
        {activeTab === 'story' && <StoryTab />}
        {activeTab === 'training' && <TrainingTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      <nav>
        <button
          type="button"
          onClick={() => setActiveTab('story')}
          aria-pressed={activeTab === 'story'}
        >
          Story
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('training')}
          aria-pressed={activeTab === 'training'}
        >
          Training
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          aria-pressed={activeTab === 'settings'}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}

function StoryTab() {
  const chapterProgress = useGameStore((s) => s.chapterProgress);
  const currentChapterId = useGameStore((s) => s.currentChapter);
  const chapter = chapters.find((c) => c.id === currentChapterId);

  const marineRep = useGameStore((s) => s.factions.marine);
  const pirateRep = useGameStore((s) => s.factions.pirate);

  if (!chapter) {
    return <p>No chapter found.</p>;
  }

  const handleChoice = () => {
    dispatchCommand((state) => {
      if (!chapter.choice) {
        return;
      }

      chapter.choice.factionDeltas.forEach((d) => {
        const faction = d.faction as keyof typeof state.factions;
        state.factions[faction] += d.delta;
      });

      state.chapterProgress = 1;
    });
  };

  return (
    <section>
      <h2>
        Arc {chapter.arc} - {chapter.title}
      </h2>

      <p>{chapter.description}</p>

      {chapterProgress === 0 && chapter.choice && (
        <div>
          <p>{chapter.choice.text}</p>

          <button type="button" onClick={handleChoice}>
            Choose
          </button>
        </div>
      )}

      {chapterProgress > 0 && <p>The die is cast.</p>}

      <section>
        <h3>World Standing</h3>

        <p>Marine Reputation: {marineRep}</p>
        <p>Pirate Reputation: {pirateRep}</p>
      </section>
    </section>
  );
}

function TrainingTab() {
  const str = useGameStore((s) => formatDecimal(s.stats.str));
  const stamina = useGameStore((s) => formatDecimal(s.stamina, 1));
  const maxStamina = useGameStore((s) => formatDecimal(s.maxStamina));
  const train = useGameStore((s) => s.train);

  const canTrain = useGameStore((s) => s.stamina.gte(10));

  return (
    <section>
      <h2>Training Grounds</h2>

      <p>
        Stamina: {stamina} / {maxStamina}
      </p>

      <p>Strength: {str}</p>

      <button
        type="button"
        onClick={() => train('str')}
        disabled={!canTrain}
      >
        Train Strength (-10 Stamina)
      </button>
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
    <section>
      <h2>Settings</h2>

      <label>
        <input
          type="checkbox"
          checked={audioEnabled}
          onChange={toggleAudio}
        />
        Enable Audio
      </label>

      <br />

      <label>
        <input
          type="checkbox"
          checked={hapticsEnabled}
          onChange={toggleHaptics}
        />
        Enable Haptics
      </label>

      <br />

      <label>
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