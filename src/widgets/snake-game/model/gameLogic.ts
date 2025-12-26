/**
 * Основная логика игры Snake
 */

import { calculateLevel, calculateSpeed, type GameConfig } from "./gameConfig";
import type { Direction, GameData, Position } from "./types";

/**
 * Генерация случайной позиции на поле
 */
export function generateRandomPosition(gridSize: number, exclude: Position[] = []): Position {
  const excludeSet = new Set(exclude.map(pos => `${pos.x},${pos.y}`));
  let attempts = 0;
  let position: Position;

  do {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    attempts++;
  } while (excludeSet.has(`${position.x},${position.y}`) && attempts < 100);

  return position;
}

/**
 * Генерация препятствий для режима obstacles
 */
export function generateObstacles(
  gridSize: number,
  count: number,
  exclude: Position[] = []
): Position[] {
  const obstacles: Position[] = [];
  const excludeSet = new Set(exclude.map(pos => `${pos.x},${pos.y}`));

  const obstacleCount = Math.min(count, Math.floor(gridSize * gridSize * 0.1));

  let attempts = 0;
  while (obstacles.length < obstacleCount && attempts < 1000) {
    const newPosition: Position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    const positionKey = `${newPosition.x},${newPosition.y}`;

    if (!excludeSet.has(positionKey)) {
      obstacles.push(newPosition);
      excludeSet.add(positionKey);
    }
    attempts++;
  }

  return obstacles;
}

/**
 * Создание начального состояния игры
 */
export function createInitialGameData(config: GameConfig): GameData {
  const centerX = Math.floor(config.gridSize / 2);
  const centerY = Math.floor(config.gridSize / 2);

  const initialSnake = {
    body: [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ],
    direction: "right" as Direction,
    nextDirection: "right" as Direction,
  };

  const food = generateRandomPosition(config.gridSize, initialSnake.body);

  const obstacles = config.obstacles
    ? generateObstacles(config.gridSize, Math.floor(config.gridSize * 0.5), initialSnake.body)
    : [];

  return {
    snake: initialSnake,
    food,
    obstacles,
    score: 0,
    level: 1,
    config,
  };
}

/**
 * Проверка коллизии с границами
 */
export function checkWallCollision(snake: Position[], gridSize: number): boolean {
  const head = snake[0];
  return head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
}

/**
 * Проверка коллизии с телом змейки
 */
export function checkSelfCollision(snake: Position[]): boolean {
  const head = snake[0];
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

/**
 * Проверка коллизии с препятствиями
 */
export function checkObstacleCollision(head: Position, obstacles: Position[]): boolean {
  return obstacles.some(obs => obs.x === head.x && obs.y === head.y);
}

/**
 * Проверка поедания еды
 */
export function checkFoodCollision(snake: Position[], food: Position): boolean {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
}

/**
 * Вычисление следующей позиции головы
 */
export function getNextHeadPosition(head: Position, direction: Direction): Position {
  switch (direction) {
    case "up":
      return { x: head.x, y: head.y - 1 };
    case "down":
      return { x: head.x, y: head.y + 1 };
    case "left":
      return { x: head.x - 1, y: head.y };
    case "right":
      return { x: head.x + 1, y: head.y };
  }
}

/**
 * Обновление направления змейки
 */
export function updateDirection(currentDirection: Direction, nextDirection: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };

  if (nextDirection === opposites[currentDirection]) {
    return currentDirection;
  }

  return nextDirection;
}

/**
 * Один шаг игры
 */
export function gameTick(gameData: GameData): {
  gameData: GameData;
  gameOver: boolean;
} {
  const { snake, food, obstacles, score, level, config } = gameData;

  const newDirection = updateDirection(snake.direction, snake.nextDirection);

  const newHead = getNextHeadPosition(snake.body[0], newDirection);

  if (checkWallCollision([newHead], config.gridSize)) {
    return { gameData, gameOver: true };
  }

  if (checkSelfCollision([newHead, ...snake.body])) {
    return { gameData, gameOver: true };
  }

  if (checkObstacleCollision(newHead, obstacles)) {
    return { gameData, gameOver: true };
  }

  const ateFood = checkFoodCollision([newHead], food);

  const newBody = [newHead, ...snake.body];
  if (!ateFood) {
    newBody.pop();
  }

  let newFood = food;
  if (ateFood) {
    newFood = generateRandomPosition(config.gridSize, [...newBody, ...obstacles]);
  }

  const newScore = ateFood ? score + 1 : score;
  const newLevel = calculateLevel(newScore);

  const newSpeed = newLevel !== level ? calculateSpeed(config.difficulty, newLevel) : config.speed;

  const updatedConfig: GameConfig = {
    ...config,
    speed: newSpeed,
  };

  const updatedGameData: GameData = {
    snake: {
      body: newBody,
      direction: newDirection,
      nextDirection: newDirection,
    },
    food: newFood,
    obstacles,
    score: newScore,
    level: newLevel,
    config: updatedConfig,
  };

  return { gameData: updatedGameData, gameOver: false };
}
