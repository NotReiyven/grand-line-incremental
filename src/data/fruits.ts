export interface DevilFruit {
  id: string;
  name: string;
  description: string;
  multiplier: number;
}

export const fruits: DevilFruit[] = [
  { id: 'fruit_gum', name: 'Gum-Gum Fruit', description: 'Body becomes rubber. Blunt damage is nullified.', multiplier: 1.5 },
  { id: 'fruit_chop', name: 'Chop-Chop Fruit', description: 'Body can split into floating pieces. Immune to cuts.', multiplier: 1.2 },
  { id: 'fruit_smoke', name: 'Smoke-Smoke Fruit', description: 'Logia class. Intangible smoke.', multiplier: 2.0 },
];