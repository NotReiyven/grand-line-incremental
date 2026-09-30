import Decimal from 'break_eternity.js';

export interface WorldBoss {
  id: string;
  name: string;
  description: string;
  hp: Decimal;
  rewardText: string;
  infamyReward: number;
}

export const worldBosses: WorldBoss[] = [
  {
    id: 'wb_sea_king',
    name: 'Lord of the Coast',
    description: 'A massive sea king terrorizing the local waters. It tests your raw physical strength before entering the Grand Line.',
    hp: new Decimal(5000),
    rewardText: '+1,000 Infamy',
    infamyReward: 1000
  },
  {
    id: 'wb_pacifista',
    name: 'Pacifista Prototype',
    description: 'A terrifying cyborg weapon of the Marines. You will need Haki or a Devil Fruit to scratch its armor.',
    hp: new Decimal(250000),
    rewardText: '+10,000 Infamy',
    infamyReward: 10000
  }
];