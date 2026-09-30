export type Faction = 'marine' | 'pirate' | 'revolutionary';

export interface Requirement { stat: 'str' | 'agi' | 'end' | 'wil'; value: number; }

export interface PowerCheck {
  stat: 'str' | 'agi' | 'end' | 'wil';
  value: number;
  successChapterId?: number;
  successEndingId?: string;
  failEndingId?: string;
}

export interface Choice {
  id: string; text: string;
  factionDeltas: { faction: Faction; delta: number }[];
  infamyDelta?: number;
  nextChapterId?: number;
  requirement?: Requirement;
  powerCheck?: PowerCheck;
  endingId?: string;
  crewUnlock?: string;
}

export interface Chapter {
  id: number; arc: number; title: string; description: string; speaker?: string; voiceLine?: string; choices: Choice[];
}

export const chapters: Chapter[] = [
  {
    id: 1, arc: 1, title: 'The Tumultuous First Day',
    description: 'You wake up on a dock smelling of fish and cheap ale. A marine patrol is hassling a merchant.',
    choices: [
      { id: 'c1_pirate', text: 'Intervene against the patrol', factionDeltas: [{ faction: 'pirate', delta: 5 }, { faction: 'marine', delta: -5 }], infamyDelta: 10, nextChapterId: 2 },
      { id: 'c1_marine', text: 'Report a bounty to the patrol', factionDeltas: [{ faction: 'marine', delta: 5 }, { faction: 'pirate', delta: -5 }], nextChapterId: 2 }
    ]
  },
  {
    id: 2, arc: 1, title: 'Securing a Vessel',
    description: 'You cannot swim to the Grand Line. A small caravel is moored nearby.',
    choices: [
      { id: 'c2_steal', text: 'Steal the caravel', factionDeltas: [{ faction: 'pirate', delta: 10 }], infamyDelta: 50, nextChapterId: 3 },
      { id: 'c2_work', text: 'Work to buy passage (Req: 15 STR)', requirement: { stat: 'str', value: 15 }, factionDeltas: [{ faction: 'marine', delta: 2 }], nextChapterId: 3 }
    ]
  },
  {
    id: 3, arc: 1, title: 'The Open Sea',
    description: 'The wind catches the sails. Survival requires strength.',
    choices: [
      { id: 'c3_train', text: 'Drill on the deck (Req: 25 AGI)', requirement: { stat: 'agi', value: 25 }, factionDeltas: [], nextChapterId: 4 }
    ]
  },
  {
    id: 4, arc: 1, title: 'Pirate Hunter Ambush',
    description: 'A mercenary ship flanks you during a squall. The bounty hunter aboard looks strong.',
    choices: [
      { id: 'c4_fight', text: 'Beat him and force him to join', factionDeltas: [{ faction: 'pirate', delta: 5 }], infamyDelta: 20, crewUnlock: 'c_hunter', nextChapterId: 5 }
    ]
  },
  {
    id: 5, arc: 1, title: 'The Floating Restaurant',
    description: 'Hunger sets in. A ship shaped like a fish serves both lawmen and outlaws.',
    choices: [
      { id: 'c5_eat', text: 'Pay for a meal', factionDeltas: [], nextChapterId: 6 },
      { id: 'c5_dine', text: 'Dine and dash', factionDeltas: [{ faction: 'pirate', delta: 5 }], infamyDelta: 10, nextChapterId: 6 }
    ]
  },
  {
    id: 6, arc: 1, title: 'Betrayal at Sea',
    description: 'A supposed ally sells your coordinates to the Marines.',
    choices: [
      { id: 'c6_escape', text: 'Outrun the fleet (Req: 50 AGI)', requirement: { stat: 'agi', value: 50 }, factionDeltas: [{ faction: 'marine', delta: -10 }], nextChapterId: 7 }
    ]
  },
  {
    id: 7, arc: 1, title: 'The Warlord\'s Shadow',
    description: 'You cross into territory claimed by a Warlord of the Sea.',
    choices: [
      { id: 'c7_pay', text: 'Pay the toll (Req: 60 END)', requirement: { stat: 'end', value: 60 }, factionDeltas: [{ faction: 'pirate', delta: 10 }], nextChapterId: 8 }
    ]
  },
  {
    id: 8, arc: 1, title: 'The Marine Blockade',
    description: 'A blockade blocks the route to the final island of East Blue.',
    choices: [
      { id: 'c8_smash', text: 'Smash through (Req: 80 STR)', requirement: { stat: 'str', value: 80 }, factionDeltas: [{ faction: 'marine', delta: -20 }], infamyDelta: 100, nextChapterId: 9 }
    ]
  },
  {
    id: 9, arc: 1, title: 'Arrival at Loguetown',
    description: 'The town of the beginning and the end. The execution platform looms.',
    speaker: 'Captain "Ironjaw"', voiceLine: 'Law, chaos, or freedom. Make your choice.',
    choices: [
      { id: 'c9_plaza', text: 'Enter the plaza (Req: 100 WIL)', requirement: { stat: 'wil', value: 100 }, factionDeltas: [], nextChapterId: 10 }
    ]
  },
  {
    id: 10, arc: 1, title: 'The Execution Platform',
    description: 'Marines lock down the square. You must break through to reach the Grand Line.',
    choices: [
      {
        id: 'c10_fight_marine', text: 'Break the Marine line by force (Check: 500 STR)',
        factionDeltas: [{ faction: 'pirate', delta: 30 }, { faction: 'marine', delta: -50 }],
        powerCheck: { stat: 'str', value: 500, successChapterId: 11, failEndingId: 'pirate_death' }
      },
      {
        id: 'c10_surrender', text: 'Surrender to Ironjaw. You cannot win this.',
        factionDeltas: [{ faction: 'marine', delta: 10 }],
        endingId: 'pirate_capture'
      }
    ]
  },
  {
    id: 11, arc: 2, title: 'Entering Paradise',
    description: 'Reverse Mountain is behind you. The air feels heavier here. Welcome to the Grand Line.',
    choices: []
  }
];