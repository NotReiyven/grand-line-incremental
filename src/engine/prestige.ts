import type { GameState } from './types';
import { createInitialState } from './save';

interface EndingMeta {
  name: string;
  heirloom: string;
}

export const endingsMeta: Record<string, EndingMeta> = {
  pirate_death: {
    name: 'Going Down Swinging',
    heirloom: 'Shattered Jolly Roger',
  },
  marine_death: {
    name: "A Traitor's End",
    heirloom: "Admiral's Coat",
  },
  marine_capture: {
    name: 'Chained Hound',
    heirloom: 'Seastone Cuffs',
  },
  pirate_capture: {
    name: 'Impel Down Inmate',
    heirloom: 'Tarnished Coin',
  },
};

export const triggerEnding = (
  state: GameState,
  endingId: string,
): void => {
  state.isDead = true;
  state.lastEnding = endingId;

  if (!state.endings.includes(endingId)) {
    state.endings.push(endingId);
  }
};

export const inheritWill = (state: GameState): void => {
  const endingId = state.lastEnding;
  const ending = endingId ? endingsMeta[endingId] : undefined;
  const newHeirloom = ending?.heirloom;

  const oldEra = state.era;
  const oldEndings = [...state.endings];
  const oldHeirlooms = new Set(state.heirlooms);

  if (newHeirloom) {
    oldHeirlooms.add(newHeirloom);
  }

  const totalStats = state.stats.str
    .plus(state.stats.agi)
    .plus(state.stats.end)
    .plus(state.stats.wil);

  const earnedHaki = totalStats.divide(100).times(0.01);
  const newHakiMultiplier = state.hakiMultiplier.plus(earnedHaki);

  const freshState = createInitialState();

  Object.assign(state, freshState);

  state.era = oldEra + 1;
  state.endings = oldEndings;
  state.heirlooms = Array.from(oldHeirlooms);
  state.hakiMultiplier = newHakiMultiplier;
};