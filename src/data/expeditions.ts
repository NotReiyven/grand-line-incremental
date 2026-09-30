export interface Expedition {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  rewards: {
    itemId: string;
    baseAmount: number;
  }[];
}

export const expeditions: Expedition[] = [
  {
    id: 'exp_scrap',
    name: 'Scavenge Shipwreck',
    description:
      'Strip a sunken hull for parts before the current carries it away.',
    durationSeconds: 60,
    rewards: [
      {
        itemId: 'wood',
        baseAmount: 10,
      },
      {
        itemId: 'iron',
        baseAmount: 2,
      },
    ],
  },

  {
    id: 'exp_hunt',
    name: 'Bounty Hunting',
    description:
      'Track down a local bandit and return with a reward.',
    durationSeconds: 300,
    rewards: [
      {
        itemId: 'beri',
        baseAmount: 500,
      },
      {
        itemId: 'fruit_chop',
        baseAmount: 1,
      },
    ],
  },

  {
    id: 'exp_logue_run',
    name: 'Grand Line Supply Run',
    description:
      'A long route through dangerous waters with a bigger payout.',
    durationSeconds: 900,
    rewards: [
      {
        itemId: 'beri',
        baseAmount: 2500,
      },
      {
        itemId: 'fruit_smoke',
        baseAmount: 1,
      },
    ],
  },
];