/**
 * Функция для рендеринга игрового поля в ASCII
 */

import type { GameData } from "../model/types";

export function renderGameField(gameData: GameData): string[] {
  const { snake, food, obstacles, config } = gameData;
  const grid: string[][] = Array(config.gridSize)
    .fill(null)
    .map(() => Array(config.gridSize).fill(" "));

  obstacles.forEach(obs => {
    if (obs.x >= 0 && obs.x < config.gridSize && obs.y >= 0 && obs.y < config.gridSize) {
      grid[obs.y][obs.x] = "▓";
    }
  });

  if (food.x >= 0 && food.x < config.gridSize && food.y >= 0 && food.y < config.gridSize) {
    grid[food.y][food.x] = "◆";
  }

  snake.body.forEach((segment, index) => {
    if (
      segment.x >= 0 &&
      segment.x < config.gridSize &&
      segment.y >= 0 &&
      segment.y < config.gridSize
    ) {
      if (index === 0) {
        grid[segment.y][segment.x] = "◉";
      } else {
        grid[segment.y][segment.x] = "█";
      }
    }
  });

  const topBorder = "┌" + "─".repeat(config.gridSize) + "┐";
  const bottomBorder = "└" + "─".repeat(config.gridSize) + "┘";

  const output: string[] = [];
  output.push(topBorder);
  grid.forEach(row => {
    output.push("│" + row.join("") + "│");
  });
  output.push(bottomBorder);

  return output;
}
