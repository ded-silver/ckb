/**
 * Константы для Snake Game
 */

export const VALID_THEMES = [
  "2077",
  "dolbaeb",
  "matrix",
  "amber",
  "anime",
  "win95",
  "retro",
] as const;

export const DEFAULT_WINDOW_SIZE = { width: 600, height: 500 };
export const MIN_WINDOW_SIZE = { width: 400, height: 400 };
export const MAX_WINDOW_SIZE = { width: 800, height: 800 };

export const WELCOME_MESSAGE: string[] = [
  "Welcome to Snake Game v1.0",
  "Type 'start' to begin playing",
  "Type 'help' for available commands",
];
