export type Faction = 'marine' | 'pirate' | 'revolutionary';

export interface Choice {
  id: string;
  text: string;
  factionDeltas: { faction: Faction; delta: number }[];
}

export interface Chapter {
  id: number;
  arc: number;
  title: string;
  description: string;
  choice?: Choice;
}

export const chapters: Chapter[] = [
  {
    id: 1,
    arc: 1,
    title: 'The Tumultuous First Day',
    description: 'You wake up on a dock smelling of fish and cheap ale. A marine patrol is hassling a local merchant. A pirate crew is laughing at them from a tavern window. You have to make a move.',
    choice: {
      id: 'chap1_intervene',
      text: 'Intervene against the patrol',
      factionDeltas: [
        { faction: 'pirate', delta: 5 },
        { faction: 'marine', delta: -5 }
      ]
    }
  }
];