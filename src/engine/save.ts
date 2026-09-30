import { z } from 'zod';
import Decimal from 'break_eternity.js';
import type { GameState, ActiveExpedition } from './types';
import type { Faction } from '../data/chapters';

const RawDecimalSchema = z.union([
  z.string(),
  z.number(),
  z.record(z.string(), z.unknown()),
]);

const FactionEnumSchema = z.enum([
  'marine',
  'pirate',
  'revolutionary',
]);

const ActiveExpeditionSchema = z.object({
  id: z.string(),
  crewId: z.string(),
  completeAt: z.number(),
});

const HakiSchema = z.object({
  observation: z.number().default(0),
  armament: z.number().default(0),
  conqueror: z.boolean().default(false),
});

const DoubleAgentBackupSchema = z.object({
  pirate: z.number(),
  marine: z.number(),
});

const SaveStateSchema = z
  .object({
    stats: z.object({
      str: RawDecimalSchema,
      agi: RawDecimalSchema,
      end: RawDecimalSchema,
      wil: RawDecimalSchema,
    }),

    factions: z.object({
      pirate: z.number(),
      marine: z.number(),
      revolutionary: z.number(),
      infamy: RawDecimalSchema,
    }),

    stamina: RawDecimalSchema,
    maxStamina: RawDecimalSchema,
    lastTick: z.number(),

    chapterProgress: z.number(),
    currentArc: z.number(),
    currentChapter: z.number(),

    doubleAgentUnlocked: z.boolean(),
    doubleAgentActive: z.boolean(),
    doubleAgentBackup: DoubleAgentBackupSchema.nullable().optional(),
    lockedFactions: z
      .tuple([FactionEnumSchema, FactionEnumSchema])
      .nullable(),

    era: z.number(),
    endings: z.array(z.string()),
    heirlooms: z.array(z.string()),
    hakiMultiplier: RawDecimalSchema,

    isDead: z.boolean(),
    lastEnding: z.string().optional(),

    unlockedCrew: z.array(z.string()).default([]),
    activeExpeditions: z
      .array(ActiveExpeditionSchema)
      .default([]),

    inventory: z
      .record(z.string(), RawDecimalSchema)
      .default({}),

    unlockedSkills: z.array(z.string()).default([]),
    haki: HakiSchema.default({
      observation: 0,
      armament: 0,
      conqueror: false,
    }),

    devilFruit: z.string().nullable().default(null),
    worldFruits: z.array(z.string()).default(['fruit_gum']),
    lockedFruits: z.array(z.string()).default([]),

    highestBossDamage: z
      .record(z.string(), RawDecimalSchema)
      .default({}),

    defeatedBosses: z.array(z.string()).default([]),
    lastEvent: z.string().default('The Log Pose is set. Your voyage begins.'),
  })
  .passthrough();

export const SaveSchema = z.object({
  version: z.number(),
  state: SaveStateSchema,
});

const SAVE_KEY = 'grand_line_v1';
const BACKUP_KEY = 'grand_line_backup';

const decimalFromUnknown = (
  value: unknown,
  fallback = 0,
): Decimal => {
  if (typeof value === 'string' || typeof value === 'number') {
    return new Decimal(value);
  }

  if (typeof value !== 'object' || value === null) {
    return new Decimal(fallback);
  }

  const source = value as Record<string, unknown>;

  const sign = source.sign;
  const layer = source.layer;
  const mag = source.mag;

  if (
    typeof sign === 'number' &&
    typeof layer === 'number' &&
    typeof mag === 'number'
  ) {
    const DecimalConstructor = Decimal as unknown as {
      fromComponents?: (
        sign: number,
        layer: number,
        mag: number,
      ) => Decimal;
    };

    if (DecimalConstructor.fromComponents) {
      return DecimalConstructor.fromComponents(
        sign,
        layer,
        mag,
      );
    }
  }

  const mantissa = source.m;
  const exponent = source.e;
  const legacySign = source.s;

  if (
    typeof mantissa === 'number' &&
    typeof exponent === 'number' &&
    typeof legacySign === 'number'
  ) {
    if (
      exponent > 308 ||
      exponent < -308
    ) {
      return new Decimal(
        `${legacySign < 0 ? '-' : ''}${Math.abs(
          mantissa,
        )}e${exponent}`,
      );
    }

    return new Decimal(
      legacySign * mantissa * 10 ** exponent,
    );
  }

  return new Decimal(fallback);
};

const hydrateState = (
  raw: z.infer<typeof SaveStateSchema>,
): GameState => {
  const inventory: Record<string, Decimal> = {};

  for (const [itemId, amount] of Object.entries(
    raw.inventory,
  )) {
    inventory[itemId] = decimalFromUnknown(amount);
  }

  const highestBossDamage: Record<
    string,
    Decimal
  > = {};

  for (const [bossId, damage] of Object.entries(
    raw.highestBossDamage,
  )) {
    highestBossDamage[bossId] =
      decimalFromUnknown(damage);
  }

  const lastTick =
    Number.isFinite(raw.lastTick)
      ? Math.min(raw.lastTick, Date.now())
      : Date.now();

  const lockedFactions = raw.lockedFactions
    ? ([...raw.lockedFactions] as [Faction, Faction])
    : null;

  return {
    stats: {
      str: decimalFromUnknown(raw.stats.str, 10),
      agi: decimalFromUnknown(raw.stats.agi, 10),
      end: decimalFromUnknown(raw.stats.end, 10),
      wil: decimalFromUnknown(raw.stats.wil, 10),
    },

    factions: {
      pirate: raw.factions.pirate,
      marine: raw.factions.marine,
      revolutionary: raw.factions.revolutionary,
      infamy: decimalFromUnknown(
        raw.factions.infamy,
      ),
    },

    stamina: decimalFromUnknown(raw.stamina, 100),
    maxStamina: decimalFromUnknown(
      raw.maxStamina,
      100,
    ),
    lastTick,

    chapterProgress: raw.chapterProgress,
    currentArc: raw.currentArc,
    currentChapter: raw.currentChapter,

    doubleAgentUnlocked:
      raw.doubleAgentUnlocked,
    doubleAgentActive:
      raw.doubleAgentActive,
    doubleAgentBackup:
      raw.doubleAgentBackup
        ? {
            pirate: raw.doubleAgentBackup.pirate,
            marine: raw.doubleAgentBackup.marine,
          }
        : null,
    lockedFactions,

    era: raw.era,
    endings: [...raw.endings],
    heirlooms: [...raw.heirlooms],
    hakiMultiplier: decimalFromUnknown(
      raw.hakiMultiplier,
    ),

    isDead: raw.isDead,
    lastEnding: raw.lastEnding,

    unlockedCrew: [...raw.unlockedCrew],
    activeExpeditions:
      raw.activeExpeditions.map(
        (
          expedition: ActiveExpedition,
        ) => ({
          id: expedition.id,
          crewId: expedition.crewId,
          completeAt: expedition.completeAt,
        }),
      ),

    inventory,

    unlockedSkills: [...raw.unlockedSkills],
    haki: {
      observation: raw.haki.observation,
      armament: raw.haki.armament,
      conqueror: raw.haki.conqueror,
    },

    devilFruit: raw.devilFruit,
    worldFruits: [...raw.worldFruits],
    lockedFruits: [...raw.lockedFruits],

    highestBossDamage,
    defeatedBosses: [
      ...raw.defeatedBosses,
    ],

    lastEvent: raw.lastEvent,
  };
};

const serializeState = (
  state: GameState,
): Record<string, unknown> => {
  const inventory: Record<string, string> = {};

  for (const [itemId, amount] of Object.entries(
    state.inventory,
  )) {
    inventory[itemId] = amount.toString();
  }

  const highestBossDamage: Record<
    string,
    string
  > = {};

  for (const [bossId, damage] of Object.entries(
    state.highestBossDamage,
  )) {
    highestBossDamage[bossId] =
      damage.toString();
  }

  return {
    stats: {
      str: state.stats.str.toString(),
      agi: state.stats.agi.toString(),
      end: state.stats.end.toString(),
      wil: state.stats.wil.toString(),
    },

    factions: {
      pirate: state.factions.pirate,
      marine: state.factions.marine,
      revolutionary:
        state.factions.revolutionary,
      infamy:
        state.factions.infamy.toString(),
    },

    stamina: state.stamina.toString(),
    maxStamina: state.maxStamina.toString(),
    lastTick: state.lastTick,

    chapterProgress:
      state.chapterProgress,
    currentArc: state.currentArc,
    currentChapter:
      state.currentChapter,

    doubleAgentUnlocked:
      state.doubleAgentUnlocked,
    doubleAgentActive:
      state.doubleAgentActive,
    doubleAgentBackup:
      state.doubleAgentBackup
        ? {
            pirate:
              state.doubleAgentBackup
                .pirate,
            marine:
              state.doubleAgentBackup
                .marine,
          }
        : null,
    lockedFactions:
      state.lockedFactions,

    era: state.era,
    endings: [...state.endings],
    heirlooms: [...state.heirlooms],
    hakiMultiplier:
      state.hakiMultiplier.toString(),

    isDead: state.isDead,
    lastEnding: state.lastEnding,

    unlockedCrew: [
      ...state.unlockedCrew,
    ],
    activeExpeditions:
      state.activeExpeditions.map(
        (expedition) => ({
          id: expedition.id,
          crewId: expedition.crewId,
          completeAt:
            expedition.completeAt,
        }),
      ),

    inventory,

    unlockedSkills: [
      ...state.unlockedSkills,
    ],
    haki: {
      observation:
        state.haki.observation,
      armament:
        state.haki.armament,
      conqueror:
        state.haki.conqueror,
    },

    devilFruit:
      state.devilFruit,
    worldFruits: [
      ...state.worldFruits,
    ],
    lockedFruits: [
      ...state.lockedFruits,
    ],

    highestBossDamage,

    defeatedBosses: [
      ...state.defeatedBosses,
    ],

    lastEvent: state.lastEvent,
  };
};

export const createInitialState =
  (): GameState => ({
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

    doubleAgentUnlocked: false,
    doubleAgentActive: false,
    doubleAgentBackup: null,
    lockedFactions: null,

    era: 1,
    endings: [],
    heirlooms: [],
    hakiMultiplier: new Decimal(0),

    isDead: false,

    unlockedCrew: [],
    activeExpeditions: [],
    inventory: {},

    unlockedSkills: [],

    haki: {
      observation: 0,
      armament: 0,
      conqueror: Math.random() < 0.05,
    },

    devilFruit: null,

    worldFruits: ['fruit_gum'],
    lockedFruits: [],

    highestBossDamage: {},
    defeatedBosses: [],

    lastEvent:
      'The Log Pose is set. Your voyage begins.',
  });

export const saveGame = (
  state: GameState,
  slot: string = SAVE_KEY,
): void => {
  if (
    typeof localStorage ===
    'undefined'
  ) {
    return;
  }

  const payload = {
    version: 2,
    state: serializeState(state),
  };

  try {
    localStorage.setItem(
      slot,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage failures.
  }
};

const tryLoadSlot = (
  slot: string,
): GameState | null => {
  if (
    typeof localStorage ===
    'undefined'
  ) {
    return null;
  }

  const raw = localStorage.getItem(slot);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const validated =
      SaveSchema.safeParse(parsed);

    if (!validated.success) {
      return null;
    }

    return hydrateState(
      validated.data.state,
    );
  } catch {
    return null;
  }
};

export const loadGame = (): GameState => {
  if (
    typeof localStorage ===
    'undefined'
  ) {
    return createInitialState();
  }

  const raw = localStorage.getItem(
    SAVE_KEY,
  );

  if (!raw) {
    return createInitialState();
  }

  const loaded = tryLoadSlot(
    SAVE_KEY,
  );

  if (loaded) {
    return loaded;
  }

  try {
    localStorage.setItem(
      `${SAVE_KEY}_quarantine_${Date.now()}`,
      raw,
    );
  } catch {
    // Ignore quarantine failures.
  }

  const backup = tryLoadSlot(
    BACKUP_KEY,
  );

  return backup ?? createInitialState();
};

export {
  SAVE_KEY,
  BACKUP_KEY,
};