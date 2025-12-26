/**
 * Типы для Snake Game
 */

export type Direction = "up" | "down" | "left" | "right";

export type GameState = "menu" | "playing" | "paused" | "gameover";

export type Difficulty = "easy" | "medium" | "hard" | "custom";

export type GameMode = "classic" | "obstacles";

export interface Position {
  x: number;
  y: number;
}

export interface GameConfig {
  gridSize: number;
  cellSize: number;
  speed: number;
  difficulty: Difficulty;
  mode: GameMode;
  obstacles: boolean;
}

export interface Snake {
  body: Position[];
  direction: Direction;
  nextDirection: Direction;
}

export interface GameData {
  snake: Snake;
  food: Position;
  obstacles: Position[];
  score: number;
  level: number;
  config: GameConfig;
}

export interface HighScore {
  score: number;
  level: number;
  difficulty: Difficulty;
  mode: GameMode;
  gridSize: number;
  date: number;
}

export interface GameStartConfig {
  difficulty?: Difficulty;
  mode?: GameMode;
  gridSize?: number;
}
