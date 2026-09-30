import {
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest';

import Decimal from 'break_eternity.js';

import {
  initEngine,
  dispatchCommand,
} from '../src/engine/loop';

import {
  createInitialState,
} from '../src/engine/save';

import type {
  GameState,
} from '../src/engine/types';

describe('Core Engine Simulation', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialState();

    initEngine(
      state,
      (newState) => {
        state = {
          ...newState,
        };
      },
    );
  });

  it('initializes with default values', () => {
    expect(
      state.stats.str.eq(10),
    ).toBe(true);

    expect(
      state.stats.agi.eq(10),
    ).toBe(true);

    expect(
      state.stats.end.eq(10),
    ).toBe(true);

    expect(
      state.stats.wil.eq(10),
    ).toBe(true);

    expect(
      state.stamina.eq(100),
    ).toBe(true);

    expect(
      state.maxStamina.eq(100),
    ).toBe(true);
  });

  it('consumes stamina and increases stats via dispatch command', () => {
    dispatchCommand((current) => {
      if (
        current.stamina.gte(10)
      ) {
        current.stamina =
          current.stamina.minus(10);

        current.stats.str =
          current.stats.str.plus(
            1,
          );
      }
    });

    expect(
      state.stamina.eq(90),
    ).toBe(true);

    expect(
      state.stats.str.eq(11),
    ).toBe(true);
  });

  it('rejects training if stamina is insufficient', () => {
    dispatchCommand((current) => {
      current.stamina =
        new Decimal(5);
    });

    dispatchCommand((current) => {
      if (
        current.stamina.gte(10)
      ) {
        current.stamina =
          current.stamina.minus(
            10,
          );

        current.stats.str =
          current.stats.str.plus(
            1,
          );
      }
    });

    expect(
      state.stamina.eq(5),
    ).toBe(true);

    expect(
      state.stats.str.eq(10),
    ).toBe(true);
  });

  it('does not allow story requirements to be bypassed', async () => {
    const {
      useGameStore,
    } = await import(
      '../src/store/gameStore'
    );

    useGameStore
      .getState()
      .sync(state);

    useGameStore
      .getState()
      .makeChoice(
        'c2_work',
      );

    expect(
      useGameStore.getState()
        .currentChapter,
    ).toBe(1);
  });

  it('unlocks skills at the correct thresholds', async () => {
    const {
      useGameStore,
    } = await import(
      '../src/store/gameStore'
    );

    state.stats.str =
      new Decimal(25);

    useGameStore
      .getState()
      .sync(state);

    expect(
      useGameStore
        .getState()
        .unlockedSkills.includes(
          'brawling',
        ),
    ).toBe(true);
  });

  it('does not let a defeated boss pay out twice', async () => {
    const {
      useGameStore,
    } = await import(
      '../src/store/gameStore'
    );

    state.stats.str =
      new Decimal(5000);

    state.stats.agi =
      new Decimal(5000);

    state.stats.end =
      new Decimal(5000);

    state.stats.wil =
      new Decimal(5000);

    useGameStore
      .getState()
      .sync(state);

    const before =
      useGameStore
        .getState()
        .factions.infamy;

    useGameStore
      .getState()
      .challengeBoss(
        'wb_sea_king',
      );

    const afterFirst =
      useGameStore
        .getState()
        .factions.infamy;

    useGameStore
      .getState()
      .challengeBoss(
        'wb_sea_king',
      );

    const afterSecond =
      useGameStore
        .getState()
        .factions.infamy;

    expect(
      afterFirst.gt(before),
    ).toBe(true);

    expect(
      afterSecond.eq(
        afterFirst,
      ),
    ).toBe(true);
  });
});