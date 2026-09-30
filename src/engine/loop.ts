import type { GameState } from './types';
import Decimal from 'break_eternity.js';
import { saveGame } from './save';
import { fruits } from '../data/fruits';

export const TICK_RATE = 10;
export const MS_PER_TICK = 1000 / TICK_RATE;
export const MAX_OFFLINE_SECONDS = 1209600; 

let accumulator = 0;
let lastTime = performance.now();
let running = false;
let animationFrameId: number;
let saveIntervalId: number;

type SyncCallback = (state: GameState) => void;
let onSync: SyncCallback | null = null;
let currentState: GameState;

export const initEngine = (initialState: GameState, syncCallback: SyncCallback) => {
  currentState = initialState;
  onSync = syncCallback;
  const now = Date.now();
  const offlineSeconds = Math.min((now - currentState.lastTick) / 1000, MAX_OFFLINE_SECONDS);
  if (offlineSeconds > 0) catchUpOffline(offlineSeconds);
  currentState.lastTick = now;
  lastTime = performance.now();
};

const catchUpOffline = (seconds: number) => {
  if (currentState.isDead) return;
  currentState.stamina = Decimal.min(currentState.stamina.plus(seconds), currentState.maxStamina);
  
  const hakiMult = currentState.hakiMultiplier.plus(1);
  const paranoiaMult = currentState.doubleAgentActive ? 0.5 : 1;
  let fruitMult = 1;
  
  if (currentState.devilFruit) {
    const activeFruit = fruits.find(f => f.id === currentState.devilFruit);
    if (activeFruit) fruitMult = activeFruit.multiplier;
  }
  
  const passiveGain = new Decimal(seconds * 0.01 * paranoiaMult).times(hakiMult).times(fruitMult);
  
  currentState.stats.str = currentState.stats.str.plus(passiveGain);
  currentState.stats.agi = currentState.stats.agi.plus(passiveGain);
  currentState.stats.end = currentState.stats.end.plus(passiveGain);
  currentState.stats.wil = currentState.stats.wil.plus(passiveGain);

  const decayAmount = Math.floor(seconds / 3600);
  if (decayAmount > 0 && !currentState.doubleAgentActive) {
    currentState.factions.marine = applyDecay(currentState.factions.marine, decayAmount);
    currentState.factions.pirate = applyDecay(currentState.factions.pirate, decayAmount);
    currentState.factions.revolutionary = applyDecay(currentState.factions.revolutionary, decayAmount);
  }
};

const applyDecay = (val: number, decay: number): number => {
  if (val > 0) return Math.max(0, val - decay);
  if (val < 0) return Math.min(0, val + decay);
  return 0;
};

const tick = () => {
  if (currentState.isDead) return;
  currentState.stamina = Decimal.min(currentState.stamina.plus(0.1), currentState.maxStamina);
  
  const hakiMult = currentState.hakiMultiplier.plus(1);
  const paranoiaMult = currentState.doubleAgentActive ? 0.5 : 1;
  let fruitMult = 1;

  if (currentState.devilFruit) {
    const activeFruit = fruits.find(f => f.id === currentState.devilFruit);
    if (activeFruit) fruitMult = activeFruit.multiplier;
  }
  
  const passiveGain = new Decimal(0.01 * paranoiaMult).times(hakiMult).times(fruitMult);
  
  currentState.stats.str = currentState.stats.str.plus(passiveGain);
  currentState.stats.agi = currentState.stats.agi.plus(passiveGain);
  currentState.stats.end = currentState.stats.end.plus(passiveGain);
  currentState.stats.wil = currentState.stats.wil.plus(passiveGain);
};

const update = (time: number) => {
  if (!running) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  accumulator += deltaTime;
  
  let ticked = false;
  while (accumulator >= MS_PER_TICK) {
    tick();
    accumulator -= MS_PER_TICK;
    ticked = true;
  }
  
  if (ticked && onSync) {
    currentState.lastTick = Date.now();
    onSync(currentState);
  }
  animationFrameId = requestAnimationFrame(update);
};

export const startEngine = () => {
  if (running) return;
  running = true;
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(update);
  saveIntervalId = window.setInterval(() => {
    saveGame(currentState, 'grand_line_v1');
    saveGame(currentState, 'grand_line_backup');
  }, 60000);
};

export const stopEngine = () => {
  running = false;
  cancelAnimationFrame(animationFrameId);
  clearInterval(saveIntervalId);
};

export const dispatchCommand = (action: (state: GameState) => void) => {
  if (currentState.isDead && action.name !== 'inheritWillAction') return;
  action(currentState);
  if (currentState.factions.infamy.gte(100000) && !currentState.doubleAgentUnlocked) {
    currentState.doubleAgentUnlocked = true;
  }
  if (onSync) onSync(currentState);
};