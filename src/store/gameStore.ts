import { create } from 'zustand';
import type { GameState } from '../engine/types';
import { createInitialState } from '../engine/save';
import { dispatchCommand } from '../engine/loop';
import { inheritWill, triggerEnding } from '../engine/prestige';
import { chapters } from '../data/chapters';
import { crewList } from '../data/crew';
import { expeditions } from '../data/expeditions';
import { skills } from '../data/skills';
import { fruits } from '../data/fruits';
import Decimal from 'break_eternity.js';

interface GameStore extends GameState {
  sync: (state: GameState) => void;
  train: (stat: keyof GameState['stats']) => void;
  makeChoice: (choiceId: string) => void;
  confirmInheritWill: () => void;
  startExpedition: (expeditionId: string, crewId: string) => void;
  claimExpedition: (expeditionId: string) => void;
  eatFruit: (fruitId: string) => void;
}

const checkSkillUnlocks = (state: GameState) => {
  skills.forEach(skill => {
    if (!state.unlockedSkills.includes(skill.id)) {
      if (state.stats[skill.stat].gte(skill.threshold)) {
        state.unlockedSkills.push(skill.id);
      }
    }
  });
};

export const useGameStore = create()((set) => ({
  ...createInitialState(),
  sync: (state) => {
    checkSkillUnlocks(state);
    set({ ...state });
  },
  train: (stat) => {
    dispatchCommand((state) => {
      if (state.stamina.gte(10)) {
        state.stamina = state.stamina.minus(10);
        
        let crewMult = 0;
        state.unlockedCrew.forEach(cId => {
          const crew = crewList.find(c => c.id === cId);
          if (crew && crew.passiveMultiplier.stat === stat) {
            crewMult += crew.passiveMultiplier.value;
          }
        });

        let fruitMult = 1;
        if (state.devilFruit) {
          const activeFruit = fruits.find(f => f.id === state.devilFruit);
          if (activeFruit) fruitMult = activeFruit.multiplier;
        }

        const hakiMult = state.hakiMultiplier.plus(1);
        const finalGain = new Decimal(1).times(hakiMult).times(1 + crewMult).times(fruitMult);
        state.stats[stat] = state.stats[stat].plus(finalGain);
        
        checkSkillUnlocks(state);
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
      
      if (choice.crewUnlock && !state.unlockedCrew.includes(choice.crewUnlock)) {
        state.unlockedCrew.push(choice.crewUnlock);
      }

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
  },
  startExpedition: (expeditionId, crewId) => {
    dispatchCommand((state) => {
      const exp = expeditions.find(e => e.id === expeditionId);
      if (!exp) return;
      if (state.activeExpeditions.some(e => e.crewId === crewId)) return;
      if (state.activeExpeditions.some(e => e.id === expeditionId)) return;

      state.activeExpeditions.push({
        id: expeditionId,
        crewId,
        completeAt: Date.now() + (exp.durationSeconds * 1000)
      });
    });
  },
  claimExpedition: (expeditionId) => {
    dispatchCommand((state) => {
      const activeIdx = state.activeExpeditions.findIndex(e => e.id === expeditionId);
      if (activeIdx === -1) return;
      const active = state.activeExpeditions[activeIdx];
      if (Date.now() < active.completeAt) return;

      const exp = expeditions.find(e => e.id === expeditionId);
      if (exp) {
        exp.rewards.forEach(reward => {
          if (!state.inventory[reward.itemId]) state.inventory[reward.itemId] = new Decimal(0);
          state.inventory[reward.itemId] = state.inventory[reward.itemId].plus(reward.baseAmount);
        });
      }
      state.activeExpeditions.splice(activeIdx, 1);
    });
  },
  eatFruit: (fruitId) => {
    dispatchCommand((state) => {
      if (state.devilFruit) return; 
      if (!state.inventory[fruitId] || state.inventory[fruitId].lte(0)) return; 
      
      state.inventory[fruitId] = state.inventory[fruitId].minus(1);
      state.devilFruit = fruitId;
    });
  }
}));