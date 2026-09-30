import { z } from 'zod';
import Decimal from 'break_eternity.js';
import type { GameState } from './types';

type SerializedDecimal = {
  sign?: number;
  mag?: number;
  layer?: number;
};

const decimalFromComponents = (
  sign: number,
  layer: number,
  mag: number,
): Decimal => {
  const DecimalConstructor = Decimal as unknown as {
    fromComponents: (
      sign: number,
      layer: number,
      mag: number,
    ) => Decimal;
  };

  return DecimalConstructor.fromComponents(sign, layer, mag);
};

const DecimalSchema = z
  .union([
    z.string(),
    z.number(),
    z.object({
      sign: z.number().optional(),
      mag: z.number().optional(),
      layer: z.number().optional(),
    }),
  ])
  .transform((value): Decimal => {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Decimal(value);
    }

    const serialized = value as SerializedDecimal;

    return decimalFromComponents(
      serialized.sign ?? 0,
      serialized.layer ?? 0,
      serialized.mag ?? 0,
    );
  });

const CoreStatsSchema = z.object({
  str: DecimalSchema,
  agi: DecimalSchema,
  end: DecimalSchema,
  wil: DecimalSchema,
});

const FactionsSchema = z.object({
  pirate: z.number(),
  marine: z.number(),
  revolutionary: z.number(),
  infamy: DecimalSchema,
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
  }),
});

const SAVE_KEY = 'grand_line_v1';
const BACKUP_KEY = 'grand_line_backup';

export const createInitialState = (): GameState => ({
  stats: {
    str: new Decimal(10),
    agi: new Decimal(10),
    end: new Decimal(10),
    wil: new Decimal(10),
  },
  factions: {
    pirate: 0,
    marine: 0,
    revolutionary: 0,
    infamy: new Decimal(0),
  },
  stamina: new Decimal(100),
  maxStamina: new Decimal(100),
  lastTick: Date.now(),
  chapterProgress: 0,
  currentArc: 1,
  currentChapter: 1,
});

export const saveGame = (
  state: GameState,
  slot: string = SAVE_KEY,
): void => {
  const payload = {
    version: 1,
    state,
  };

  localStorage.setItem(slot, JSON.stringify(payload));
};

export const loadGame = (): GameState => {
  const raw = localStorage.getItem(SAVE_KEY);

  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    const validated = SaveSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data.state as GameState;
    }

    localStorage.setItem(
      `${SAVE_KEY}_quarantine_${Date.now()}`,
      raw,
    );

    const backup = localStorage.getItem(BACKUP_KEY);

    if (backup) {
      const parsedBackup: unknown = JSON.parse(backup);
      const validatedBackup = SaveSchema.safeParse(parsedBackup);

      if (validatedBackup.success) {
        return validatedBackup.data.state as GameState;
      }
    }

    return createInitialState();
  } catch {
    return createInitialState();
  }
};