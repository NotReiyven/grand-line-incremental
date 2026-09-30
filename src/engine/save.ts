import { z } from 'zod';
import Decimal from 'break_eternity.js';
import type { GameState, ActiveExpedition } from './types';
import type { Faction } from '../data/chapters';

type SerializedDecimal = { sign?: number; mag?: number; layer?: number; };

const decimalFromComponents = (sign: number, layer: number, mag: number): Decimal => {
  const DecimalConstructor = Decimal as unknown as {
    fromComponents: (sign: number, layer: number, mag: number) => Decimal;
  };
  return DecimalConstructor.fromComponents(sign, layer, mag);
};

const DecimalSchema = z.union([
  z.string(), z.number(), z.object({ sign: z.number().optional(), mag: z.number().optional(), layer: z.number().optional() })
]).transform((value): Decimal => {
  if (typeof value === 'string' || typeof value === 'number') return new Decimal(value);
  const serialized = value as SerializedDecimal;
  return decimalFromComponents(serialized.sign ?? 0, serialized.layer ?? 0, serialized.mag ?? 0);
});

const CoreStatsSchema = z.object({
  str: DecimalSchema, agi: DecimalSchema, end: DecimalSchema, wil: DecimalSchema,
});

const FactionsSchema = z.object({
  pirate: z.number(), marine: z.number(), revolutionary: z.number(), infamy: DecimalSchema,
});

const FactionEnumSchema = z.enum(['marine', 'pirate', 'revolutionary']);

const ActiveExpeditionSchema = z.object({
  id: z.string(), crewId: z.string(), completeAt: z.number()
});

const HakiSchema = z.object({
  observation: z.number(), armament: z.number(), conqueror: z.boolean()
});

export const SaveSchema = z.object({
  version: z.number(),
  state: z.object({
    stats: CoreStatsSchema,
    factions: FactionsSchema,
    stamina: DecimalSchema,
    maxStamina: DecimalSchema,
    lastTick: z.number(),
    chapterProgress: z.number(),
    currentArc: z.number(),
    currentChapter: z.number(),
    doubleAgentUnlocked: z.boolean(),
    doubleAgentActive: z.boolean(),
    lockedFactions: z.tuple([FactionEnumSchema, FactionEnumSchema]).nullable(),
    era: z.number(),
    endings: z.array(z.string()),
    heirlooms: z.array(z.string()),
    hakiMultiplier: DecimalSchema,
    isDead: z.boolean(),
    lastEnding: z.string().optional(),
    unlockedCrew: z.array(z.string()).default([]),
    activeExpeditions: z.array(ActiveExpeditionSchema).default([]),
    inventory: z.record(z.string(), DecimalSchema).default({}),
    unlockedSkills: z.array(z.string()).default([]),
    haki: HakiSchema.default({ observation: 0, armament: 0, conqueror: false }),
    devilFruit: z.string().nullable().default(null),
    worldFruits: z.array(z.string()).default(['fruit_gum', 'fruit_chop', 'fruit_smoke']),
    lockedFruits: z.array(z.string()).default([]),
    highestBossDamage: z.record(z.string(), DecimalSchema).default({})
  }),
});

const SAVE_KEY = 'grand_line_v1';
const BACKUP_KEY = 'grand_line_backup';

export const createInitialState = (): GameState => ({
  stats: { str: new Decimal(10), agi: new Decimal(10), end: new Decimal(10), wil: new Decimal(10) },
  factions: { pirate: 0, marine: 0, revolutionary: 0, infamy: new Decimal(0) },
  stamina: new Decimal(100), maxStamina: new Decimal(100), lastTick: Date.now(),
  chapterProgress: 0, currentArc: 1, currentChapter: 1,
  doubleAgentUnlocked: false, doubleAgentActive: false, lockedFactions: null,
  era: 1, endings: [], heirlooms: [], hakiMultiplier: new Decimal(0), isDead: false,
  unlockedCrew: [], activeExpeditions: [], inventory: {},
  unlockedSkills: [],
  haki: { observation: 0, armament: 0, conqueror: Math.random() < 0.05 },
  devilFruit: null,
  worldFruits: ['fruit_gum', 'fruit_chop', 'fruit_smoke'],
  lockedFruits: [],
  highestBossDamage: {}
});

export const saveGame = (state: GameState, slot: string = SAVE_KEY): void => {
  const payload = { version: 1, state };
  localStorage.setItem(slot, JSON.stringify(payload));
};

export const loadGame = (): GameState => {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return createInitialState();
  try {
    const validated = SaveSchema.safeParse(JSON.parse(raw));
    if (validated.success) return validated.data.state as GameState;
    localStorage.setItem(`\({SAVE_KEY}_quarantine_\){Date.now()}`, raw);
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      const validatedBackup = SaveSchema.safeParse(JSON.parse(backup));
      if (validatedBackup.success) return validatedBackup.data.state as GameState;
    }
    return createInitialState();
  } catch { return createInitialState(); }
};