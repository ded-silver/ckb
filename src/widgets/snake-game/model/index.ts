export * from "./types";
export * from "./achievements";
export * from "./gameConfig";
export * from "./gameLogic";
export * from "./highScores";

export {
  calculateGridSize,
  calculateDifficulty,
  calculateSpeed,
  createGameConfig,
  calculateLevel,
} from "./gameConfig";
export {
  generateRandomPosition,
  generateObstacles,
  createInitialGameData,
  checkWallCollision,
  checkSelfCollision,
  checkObstacleCollision,
  checkFoodCollision,
  getNextHeadPosition,
  updateDirection,
  gameTick,
} from "./gameLogic";
