export interface Expedition {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  rewards: { itemId: string; baseAmount: number }[];
}

export const expeditions: Expedition[] = [
  {
    id: 'exp_scrap',
    name: 'Scavenge Shipwreck',
    description: 'Send a crew member to strip a sunken hull for parts.',
    durationSeconds: 60,
    rewards: [{ itemId: 'wood', baseAmount: 10 }, { itemId: 'iron', baseAmount: 2 }]
  },
  {
    id: 'exp_hunt',
    name: 'Bounty Hunting',
    description: 'Track down a low-level local bandit.',
    durationSeconds: 300,
    rewards: [{ itemId: 'beri', baseAmount: 500 }]
  }
];