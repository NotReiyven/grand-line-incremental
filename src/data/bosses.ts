import Decimal from 'break_eternity.js';

export interface WorldBoss {
  id: string;
  name: string;
  description: string;
  hp: Decimal;
  rewardText: string;
  infamyReward: number;
  requiresChapter: number;
  staminaCost: number;
  rewardItemId?: string;
  rewardItemAmount?: number;
}

export const worldBosses: WorldBoss[] =
  [
    {
      id: 'wb_sea_king',
      name: 'Lord of the Coast',
      description:
        'A massive Sea King terrorizing the local waters. Your first true test of raw power.',
      hp: new Decimal(5000),
      rewardText:
        '+1,000 Infamy and 1 Chop-Chop Fruit',
      infamyReward: 1000,
      requiresChapter: 1,
      staminaCost: 25,
      rewardItemId: 'fruit_chop',
      rewardItemAmount: 1,
    },

    {
      id: 'wb_pacifista',
      name: 'Pacifista Prototype',
      description:
        'A terrifying cyborg weapon. Its armor laughs at ordinary strength.',
      hp: new Decimal(250000),
      rewardText:
        '+10,000 Infamy and 1 Smoke-Smoke Fruit',
      infamyReward: 10000,
      requiresChapter: 11,
      staminaCost: 40,
      rewardItemId: 'fruit_smoke',
      rewardItemAmount: 1,
    },
  ];