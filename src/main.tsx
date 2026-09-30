import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initEngine, startEngine } from './engine/loop';
import { loadGame } from './engine/save';
import { useGameStore } from './store/gameStore';

const initialState = loadGame();
initEngine(initialState, useGameStore.getState().sync);
startEngine();

createRoot(document.getElementById('root')!).render(
  
    
  ,
);