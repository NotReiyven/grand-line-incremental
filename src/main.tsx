import { StrictMode } from 'react';
import {
  createRoot,
} from 'react-dom/client';

import App from './App.tsx';
import './index.css';

import {
  initEngine,
  startEngine,
  stopEngine,
} from './engine/loop';

import {
  loadGame,
  saveGame,
} from './engine/save';

import {
  useGameStore,
} from './store/gameStore';

const initialState =
  loadGame();

const sync =
  useGameStore.getState().sync;

initEngine(
  initialState,
  sync,
);

startEngine();

const persistBeforeExit =
  (): void => {
    saveGame(
      useGameStore.getState(),
      'grand_line_v1',
    );
  };

window.addEventListener(
  'pagehide',
  persistBeforeExit,
);

window.addEventListener(
  'beforeunload',
  persistBeforeExit,
);

window.addEventListener(
  'pageshow',
  () => {
    useGameStore
      .getState()
      .sync(
        useGameStore.getState(),
      );
  },
);

createRoot(
  document.getElementById(
    'root',
  )!,
).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

window.addEventListener(
  'pagehide',
  () => {
    stopEngine();
  },
  { once: true },
);