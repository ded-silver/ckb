/**
 * Управление таблицей рекордов
 */

import type { HighScore } from "./types";

const STORAGE_KEY = "snake_game_high_scores";
const MAX_SCORES = 10;

/**
 * Загрузка рекордов из localStorage
 */
export function loadHighScores(): HighScore[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load high scores:", e);
  }

  return [];
}

/**
 * Сохранение рекордов в localStorage
 */
export function saveHighScores(scores: HighScore[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.warn("Failed to save high scores:", e);
  }
}

/**
 * Добавление нового рекорда
 */
export function addHighScore(score: HighScore): boolean {
  const scores = loadHighScores();

  const isNewRecord = scores.length < MAX_SCORES || scores.some(s => s.score < score.score);

  if (!isNewRecord) {
    return false;
  }

  scores.push({
    ...score,
    date: Date.now(),
  });

  scores.sort((a, b) => b.score - a.score);

  const topScores = scores.slice(0, MAX_SCORES);

  saveHighScores(topScores);
  return true;
}

/**
 * Получение лучшего рекорда
 */
export function getBestScore(): HighScore | null {
  const scores = loadHighScores();
  return scores.length > 0 ? scores[0] : null;
}

/**
 * Получение рекордов для определенной сложности
 */
export function getHighScoresByDifficulty(difficulty: string): HighScore[] {
  const scores = loadHighScores();
  return scores.filter(s => s.difficulty === difficulty);
}
