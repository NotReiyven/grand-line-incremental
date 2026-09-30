export interface Skill {
  id: string;
  name: string;
  description: string;
  stat: 'str' | 'agi' | 'end' | 'wil';
  threshold: number;
}

export const skills: Skill[] = [
  { id: 'brawling', name: 'Brawling', description: 'Basic hand-to-hand combat fundamentals.', stat: 'str', threshold: 25 },
  { id: 'swordsmanship', name: 'Swordsmanship', description: 'The way of the blade.', stat: 'agi', threshold: 50 },
  { id: 'iron_body', name: 'Iron Body', description: 'Hardening flesh to mitigate damage.', stat: 'end', threshold: 80 },
  { id: 'navigation', name: 'Navigation', description: 'Reading the chaotic weather of the Grand Line.', stat: 'wil', threshold: 40 },
];