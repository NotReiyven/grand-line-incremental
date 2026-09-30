import Decimal from 'break_eternity.js';
import type { Faction } from '../data/chapters';

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

export interface ActiveExpedition {
  id: string;
  crewId: string;
  completeAt: number;
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
  doubleAgentUnlocked: boolean;
  doubleAgentActive: boolean;
  lockedFactions: [Faction, Faction] | null;
  era: number;
  endings: string[];
  heirlooms: string[];
  hakiMultiplier: Decimal;
  isDead: boolean;
  lastEnding?: string;
  unlockedCrew: string[];
  activeExpeditions: ActiveExpedition[];
  inventory: Record;
}