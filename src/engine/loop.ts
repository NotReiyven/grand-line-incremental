import type { GameState } from './types';
import { createInitialState } from './save';

interface EndingMeta {
  name: string;
  heirloom: string;
}

export const endingsMeta: Record<
  string,
  EndingMeta
> = {
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

  revolution_death: {
    name: 'Silenced in the Dark',
    heirloom: 'Ciphered Letter',
  },

  pirate_legacy: {
    name: 'King Without a Crown',
    heirloom: 'Weathered Straw Hat',
  },

  marine_legacy: {
    name: 'Absolute Justice',
    heirloom: 'White Coat',
  },

  revolution_legacy: {
    name: "Voice of the Dawn",
    heirloom: "Dawn's Standard",
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

  const ending =
    endingsMeta[endingId];

  state.lastEvent = ending
    ? `${ending.name}. Your era has reached its end.`
    : 'Your era has reached its end.';
};

export const inheritWill = (
  state: GameState,
): void => {
  const endingId = state.lastEnding;

  const ending = endingId
    ? endingsMeta[endingId]
    : undefined;

  const newHeirloom =
    ending?.heirloom;

  const oldEra = state.era;
  const oldEndings = [
    ...state.endings,
  ];

  const oldHeirlooms = new Set(
    state.heirlooms,
  );

  if (newHeirloom) {
    oldHeirlooms.add(newHeirloom);
  }

  const totalStats = state.stats.str
    .plus(state.stats.agi)
    .plus(state.stats.end)
    .plus(state.stats.wil);

  const earnedHaki =
    totalStats
      .divide(100)
      .times(0.01);

  const newHakiMultiplier =
    state.hakiMultiplier.plus(
      earnedHaki,
    );

  const currentFruit =
    state.devilFruit;

  const nextWorldFruits = new Set(
    state.worldFruits,
  );

  for (const fruit of state.lockedFruits) {
    nextWorldFruits.add(fruit);
  }

  const nextLockedFruits = [
    ...state.lockedFruits,
  ];

  if (currentFruit) {
    nextWorldFruits.add(currentFruit);

    if (
      endingId?.includes('capture')
    ) {
      nextLockedFruits.push(
        currentFruit,
      );
      nextWorldFruits.delete(
        currentFruit,
      );
    }
  }

  const freshState =
    createInitialState();

  Object.assign(
    state,
    freshState,
  );

  state.era = oldEra + 1;
  state.endings = oldEndings;
  state.heirlooms =
    Array.from(oldHeirlooms);
  state.hakiMultiplier =
    newHakiMultiplier;

  state.worldFruits = Array.from(
    nextWorldFruits,
  );

  state.lockedFruits = Array.from(
    new Set(nextLockedFruits),
  );

  state.lastTick = Date.now();
  state.lastEvent = `Era ${state.era} begins. The Will continues.`;
};