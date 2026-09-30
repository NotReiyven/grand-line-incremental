export interface CrewMember {
  id: string;
  name: string;
  title: string;
  description: string;
  passiveMultiplier: { stat: 'str' | 'agi' | 'end' | 'wil'; value: number };
}

export const crewList: CrewMember[] = [
  {
    id: 'c_hunter',
    name: 'Zane',
    title: 'The Pirate Hunter',
    description: 'A three-sword wielding maniac with zero sense of direction.',
    passiveMultiplier: { stat: 'str', value: 0.1 } // +10% STR gain
  },
  {
    id: 'c_nav',
    name: 'Nami',
    title: 'Cat Burglar',
    description: 'Maps the seas and steals your wallet.',
    passiveMultiplier: { stat: 'agi', value: 0.1 }
  }
];