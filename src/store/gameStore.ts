import { create } from 'zustand';
import type { GameState } from '../engine/types';
import { createInitialState } from '../engine/save';
import { dispatchCommand } from '../engine/loop';
import { inheritWill, triggerEnding } from '../engine/prestige';
import { chapters } from '../data/chapters';
import Decimal from 'break_eternity.js';

interface GameStore extends GameState {
  sync: (state: GameState) => void;
  train: (stat: keyof GameState['stats']) => void;
  makeChoice: (choiceId: string) => void;
  confirmInheritWill: () => void;
}

export const useGameStore = create()((set) => ({
  ...createInitialState(),
  sync: (state) => set({ ...state }),
  train: (stat) => {
    dispatchCommand((state) => {
      if (state.stamina.gte(10)) {
        state.stamina = state.stamina.minus(10);
        const hakiMult = state.hakiMultiplier.plus(1);
        state.stats[stat] = state.stats[stat].plus(new Decimal(1).times(hakiMult));
      }
    });
  },
  makeChoice: (choiceId) => {
    dispatchCommand((state) => {
      const chapter = chapters.find(c => c.id === state.currentChapter);
      if (!chapter) return;
      const choice = chapter.choices.find(c => c.id === choiceId);
      if (!choice) return;

      choice.factionDeltas.forEach((delta) => {
        const faction = delta.faction;
        if (!state.doubleAgentActive || !state.lockedFactions?.includes(faction)) {
          state.factions[faction] = Math.max(-100, Math.min(100, state.factions[faction] + delta.delta));
        }
      });
      if (choice.infamyDelta) state.factions.infamy = state.factions.infamy.plus(choice.infamyDelta);

      if (choice.powerCheck) {
        const statValue = state.stats[choice.powerCheck.stat];
        if (statValue.gte(choice.powerCheck.value)) {
          if (choice.powerCheck.successEndingId) triggerEnding(state, choice.powerCheck.successEndingId);
          else if (choice.powerCheck.successChapterId) {
            state.currentChapter = choice.powerCheck.successChapterId;
            state.chapterProgress = 0;
          }
        } else {
          if (choice.powerCheck.failEndingId) triggerEnding(state, choice.powerCheck.failEndingId);
        }
      } else if (choice.endingId) {
        triggerEnding(state, choice.endingId);
      } else if (choice.nextChapterId) {
        state.currentChapter = choice.nextChapterId;
        const nextChap = chapters.find((c) => c.id === choice.nextChapterId);
        if (nextChap) state.currentArc = nextChap.arc;
        state.chapterProgress = 0;
      } else {
        state.chapterProgress = 1;
      }
    });
  },
  confirmInheritWill: () => {
    const inheritWillAction = (state: GameState) => inheritWill(state);
    dispatchCommand(inheritWillAction);
  }
}));