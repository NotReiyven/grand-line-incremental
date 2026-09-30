import { create } from 'zustand';
import { GameState, createInitialState } from '../engine/save';
import { dispatchCommand } from '../engine/loop';

interface GameStore extends GameState {
  sync: (state: GameState) => void;
  train: (stat: keyof GameState['stats']) => void;
}

export const useGameStore = create()((set) => ({
  ...createInitialState(),
  sync: (state) => set({ ...state }),
  train: (stat) => {
    dispatchCommand((state) => {
      if (state.stamina.gte(10)) {
        state.stamina = state.stamina.minus(10);
        state.stats[stat] = state.stats[stat].plus(1);
      }
    });
  }
}));