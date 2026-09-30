import type { GameState } from './types';
import { skills } from '../data/skills';
import { D } from '../utils/math';

const OBSERVATION_THRESHOLDS = [100, 250, 500, 1000, 2500];
const ARMAMENT_THRESHOLDS = [250, 600, 1200, 2500, 5000];

export const updateProgression = (state: GameState): void => {
  for (const skill of skills) {
    if (
      !state.unlockedSkills.includes(skill.id) &&
      state.stats[skill.stat].gte(skill.threshold)
    ) {
      state.unlockedSkills.push(skill.id);
    }
  }

  let observationLevel = 0;

  for (let i = 0; i < OBSERVATION_THRESHOLDS.length; i += 1) {
    if (state.stats.wil.gte(OBSERVATION_THRESHOLDS[i])) {
      observationLevel = i + 1;
    }
  }

  let armamentLevel = 0;
  const physicalPower = state.stats.str.plus(state.stats.end);

  for (let i = 0; i < ARMAMENT_THRESHOLDS.length; i += 1) {
    if (physicalPower.gte(ARMAMENT_THRESHOLDS[i])) {
      armamentLevel = i + 1;
    }
  }

  state.haki.observation = Math.max(
    state.haki.observation,
    observationLevel,
  );

  state.haki.armament = Math.max(
    state.haki.armament,
    armamentLevel,
  );

  if (state.factions.infamy.gte(50000)) {
    state.haki.conqueror = true;
  }

  const enduranceBonusSteps = Math.max(
    0,
    Math.floor(Math.max(0, state.stats.end.toNumber() - 10) / 10),
  );

  const maxStamina = D(
    100 + Math.min(500, enduranceBonusSteps * 5),
  );

  if (maxStamina.gt(state.maxStamina)) {
    state.maxStamina = maxStamina;
  }

  if (state.stamina.gt(state.maxStamina)) {
    state.stamina = state.maxStamina;
  }
};