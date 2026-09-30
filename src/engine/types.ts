import Decimal from 'break_eternity.js';

export interface CoreStats {
  str: Decimal;
  agi: Decimal;
  end: Decimal;
  wil: Decimal;
}

export interface FactionReputation {
  pirate: number;
  marine: number;
  revolutionary: number;
  infamy: Decimal;
}

export interface GameState {
  stats: CoreStats;
  factions: FactionReputation;
  stamina: Decimal;
  maxStamina: Decimal;
  lastTick: number;
  chapterProgress: number;
  currentArc: number;
  currentChapter: number;
}