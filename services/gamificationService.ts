
import { Achievement, UserProfile } from "../types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-bud',
    title: 'Primeiro Broto',
    description: 'Adicionou sua primeira planta ao jardim.',
    icon: 'Sprout',
    color: 'bg-emerald-500'
  },
  {
    id: 'urban-jungle',
    title: 'Selva Urbana',
    description: 'Tem 3 ou mais plantas no jardim.',
    icon: 'Trees',
    color: 'bg-green-600'
  },
  {
    id: 'botanist',
    title: 'Botânico Experiente',
    description: 'Tem 5 ou mais plantas no jardim.',
    icon: 'Flower2',
    color: 'bg-pink-500'
  },
  {
    id: 'water-guardian',
    title: 'Guardião da Água',
    description: 'Realizou a primeira rega.',
    icon: 'Droplets',
    color: 'bg-blue-500'
  }
];

export type ActionType = 'PLANT_ADDED' | 'WATERED';

/**
 * Checks if any new achievements are unlocked based on the user's state and action.
 * Returns the list of NEWLY unlocked achievements.
 */
export const checkNewAchievements = (user: UserProfile, action: ActionType): Achievement[] => {
  const newUnlocks: Achievement[] = [];
  const currentIds = new Set(user.unlockedAchievements || []);

  // 1. Check "First Bud"
  if (action === 'PLANT_ADDED' && user.plants.length >= 1 && !currentIds.has('first-bud')) {
    const badge = ACHIEVEMENTS.find(a => a.id === 'first-bud');
    if (badge) newUnlocks.push(badge);
  }

  // 2. Check "Urban Jungle"
  if (action === 'PLANT_ADDED' && user.plants.length >= 3 && !currentIds.has('urban-jungle')) {
    const badge = ACHIEVEMENTS.find(a => a.id === 'urban-jungle');
    if (badge) newUnlocks.push(badge);
  }

  // 3. Check "Botanist"
  if (action === 'PLANT_ADDED' && user.plants.length >= 5 && !currentIds.has('botanist')) {
    const badge = ACHIEVEMENTS.find(a => a.id === 'botanist');
    if (badge) newUnlocks.push(badge);
  }

  // 4. Check "Water Guardian"
  // Note: Since we don't track total waters in history yet, we assume if they water once and don't have the badge, they get it.
  if (action === 'WATERED' && !currentIds.has('water-guardian')) {
    const badge = ACHIEVEMENTS.find(a => a.id === 'water-guardian');
    if (badge) newUnlocks.push(badge);
  }

  return newUnlocks;
};
