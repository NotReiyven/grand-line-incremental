import Decimal from 'break_eternity.js';
import type { GameState } from './types';
type StateListener = (
  state: GameState,
) => void;
type StateMutation = (
  state: GameState,
) => void;
const TICK_INTERVAL_MS = 100;
const STAMINA_PER_TICK =
  new Decimal('0.1');
let engineState:
  GameState | null = null;
let stateListener:
  StateListener | null = null;
let engineTimer:
  number | null = null;
const notify = (): void => {
  if (
    !engineState ||
    !stateListener
  ) {
    return;
  }
  stateListener(
    engineState,
  );
};
const advanceEngine =
  (): void => {
    if (!engineState) {
      return;
    }
    const now = Date.now();
    const elapsedMs = Math.max(
      0,
      now - engineState.lastTick,
    );
    const ticks = Math.floor(
      elapsedMs /
        TICK_INTERVAL_MS,
    );
    if (ticks <= 0) {
      return;
    }
    const staminaGain =
      STAMINA_PER_TICK.times(
        ticks,
      );
    engineState.stamina =
      engineState.stamina.plus(
        staminaGain,
      );
    if (
      engineState.stamina.gt(
        engineState.maxStamina,
      )
    ) {
      engineState.stamina =
        engineState.maxStamina;
    }
    engineState.lastTick +=
      ticks * TICK_INTERVAL_MS;
    notify();
  };
export const initEngine = (
  initialState: GameState,
  listener: StateListener,
): void => {
  stopEngine();
  engineState = initialState;
  stateListener = listener;
  notify();
};
export const dispatchCommand = (
  mutation: StateMutation,
  allowWhenDead = false,
): void => {
  if (!engineState) {
    return;
  }
  if (
    engineState.isDead &&
    !allowWhenDead
  ) {
    return;
  }
  mutation(engineState);
  notify();
};
export const startEngine =
  (): void => {
    if (engineTimer !== null) {
      return;
    }
    engineTimer =
      window.setInterval(
        advanceEngine,
        TICK_INTERVAL_MS,
      );
  };
export const stopEngine =
  (): void => {
    if (engineTimer !== null) {
      window.clearInterval(
        engineTimer,
      );
      engineTimer = null;
    }
  };
