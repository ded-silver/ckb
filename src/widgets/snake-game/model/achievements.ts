import type { GameData } from "./types";

export interface SnakeAchievement {
  id: string;
  name: string;
  description: string;
  condition: (gameData: GameData) => boolean;
  notification?: string;
}

export const SNAKE_ACHIEVEMENTS: SnakeAchievement[] = [
  {
    id: "first_10_points",
    name: "First Steps",
    description: "Score 10 points",
    condition: data => data.score >= 10,
    notification: "Achievement: First Steps - Score 10 points!",
  },
  {
    id: "level_5",
    name: "Rising Star",
    description: "Reach level 5",
    condition: data => data.level >= 5,
    notification: "Achievement: Rising Star - Level 5 reached!",
  },
  {
    id: "obstacles_master",
    name: "Obstacle Master",
    description: "Score 50+ in obstacles mode",
    condition: data => data.config.mode === "obstacles" && data.score >= 50,
    notification: "Achievement: Obstacle Master - 50+ points with obstacles!",
  },
  {
    id: "high_score_100",
    name: "Snake Master",
    description: "Score 100+ points",
    condition: data => data.score >= 100,
    notification: "Achievement: Snake Master - 100+ points!",
  },
];

const ACHIEVEMENTS_STORAGE_KEY = "snake_game_achievements";

function getUnlockedAchievements(): Set<string> {
  const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
  if (!stored) return new Set();
  try {
    return new Set(JSON.parse(stored));
  } catch {
    return new Set();
  }
}

function unlockAchievement(id: string): void {
  const unlocked = getUnlockedAchievements();
  unlocked.add(id);
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(Array.from(unlocked)));
}

export function checkAchievements(
  gameData: GameData,
  onAchievement: (notification: string) => void
): void {
  const unlocked = getUnlockedAchievements();

  SNAKE_ACHIEVEMENTS.forEach(achievement => {
    if (!unlocked.has(achievement.id) && achievement.condition(gameData)) {
      unlockAchievement(achievement.id);
      if (achievement.notification) {
        onAchievement(achievement.notification);
      }
    }
  });
}
