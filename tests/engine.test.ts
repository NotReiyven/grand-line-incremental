import { describe, it, expect, beforeEach } from 'vitest';
import Decimal from 'break_eternity.js';
import { initEngine, dispatchCommand } from '../src/engine/loop';
import { createInitialState } from '../src/engine/save';
import { GameState } from '../src/engine/types';

describe('Core Engine Simulation', () => {
  let state: GameState;
  
  beforeEach(() => {
    state = createInitialState();
    initEngine(state, (newState) => {
      state = { ...newState };
    });
  });

  it('initializes with default values', () => {
    expect(state.stats.str.eq(10)).toBe(true);
    expect(state.stamina.eq(100)).toBe(true);
  });

  it('consumes stamina and increases stats via dispatch command', () => {
    dispatchCommand((s) => {
      if (s.stamina.gte(10)) {
        s.stamina = s.stamina.minus(10);
        s.stats.str = s.stats.str.plus(1);
      }
    });
    expect(state.stamina.eq(90)).toBe(true);
    expect(state.stats.str.eq(11)).toBe(true);
  });

  it('rejects training if stamina is insufficient', () => {
    dispatchCommand((s) => {
      s.stamina = new Decimal(5); // Drain stamina
    });
    
    dispatchCommand((s) => {
      if (s.stamina.gte(10)) {
        s.stamina = s.stamina.minus(10);
        s.stats.str = s.stats.str.plus(1);
      }
    });
    
    expect(state.stamina.eq(5)).toBe(true);
    expect(state.stats.str.eq(10)).toBe(true);
  });
});