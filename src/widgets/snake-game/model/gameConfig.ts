/**
 * Конфигурация игры и вычисление параметров
 */

import type { Difficulty, GameConfig, GameMode } from "./types";

export type { GameConfig } from "./types";

/**
 * Вычисление размера поля на основе размера окна
 */
export function calculateGridSize(windowWidth: number, windowHeight: number): number {
  const padding = 120;
  const minCellSize = 12;
  const maxCellSize = 20;

  const availableWidth = windowWidth - padding;
  const availableHeight = windowHeight - padding;

  const optimalCellSize = Math.min(
    Math.floor(availableWidth / 20),
    Math.floor(availableHeight / 20),
    maxCellSize
  );

  const finalCellSize = Math.max(optimalCellSize, minCellSize);
  const gridSize = Math.floor(Math.min(availableWidth, availableHeight) / finalCellSize);

  return Math.max(10, Math.min(gridSize, 30));
}

/**
 * Вычисление сложности на основе размера поля
 */
export function calculateDifficulty(gridSize: number): Difficulty {
  if (gridSize <= 12) return "hard";
  if (gridSize <= 18) return "medium";
  return "easy";
}

/**
 * Вычисление скорости на основе сложности и уровня
 */
export function calculateSpeed(difficulty: Difficulty, level: number): number {
  const baseSpeed: Record<Difficulty, number> = {
    easy: 200,
    medium: 150,
    hard: 100,
    custom: 150,
  };

  const levelMultiplier = Math.max(0.7, 1 - level * 0.05);
  return Math.floor(baseSpeed[difficulty] * levelMultiplier);
}

/**
 * Создание начальной конфигурации игры
 */
export function createGameConfig(
  windowWidth: number,
  windowHeight: number,
  difficulty?: Difficulty,
  mode: GameMode = "classic",
  customGridSize?: number
): GameConfig {
  const gridSize = customGridSize || calculateGridSize(windowWidth, windowHeight);
  const finalDifficulty = difficulty || calculateDifficulty(gridSize);
  const cellSize = Math.floor(Math.min(windowWidth - 120, windowHeight - 120) / gridSize);

  return {
    gridSize,
    cellSize: Math.max(10, Math.min(cellSize, 20)),
    speed: calculateSpeed(finalDifficulty, 1),
    difficulty: finalDifficulty,
    mode,
    obstacles: mode === "obstacles",
  };
}

/**
 * Вычисление уровня на основе счета
 */
export function calculateLevel(score: number): number {
  return Math.floor(score / 10) + 1;
}
