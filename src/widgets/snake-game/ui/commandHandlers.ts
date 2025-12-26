/**
 * Обработчики команд для Snake Game
 */

import { playCommandSound } from "@shared/lib/sounds/soundHandler";

import type { CommandResult, Theme } from "../../../types";
import { createGameConfig, type GameData, type GameMode, type GameState } from "../model";
import { DEFAULT_WINDOW_SIZE, VALID_THEMES } from "./constants";
import { loadHighScores } from "../model/highScores";

interface CommandHandlersContext {
  gameState: GameState;
  gameData: GameData | null;
  size: { width: number; height: number };
  setSize: (size: { width: number; height: number }) => void;
  gameTheme: Theme;
  setGameTheme: (theme: Theme) => void;
  onClose: () => void;
  startGame: (mode: GameMode) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
}

/**
 * Парсинг режима игры из аргументов команды
 */
function parseGameMode(parts: string[]): GameMode {
  return parts.some(arg => arg.toLowerCase() === "obstacles" || arg.toLowerCase() === "--obstacles")
    ? "obstacles"
    : "classic";
}

/**
 * Обработчик команды start
 */
export function handleStart(parts: string[], context: CommandHandlersContext): CommandResult {
  const { gameState, startGame, size } = context;

  if (gameState === "playing") {
    playCommandSound("start", true);
    return {
      output: ["Game is already running. Use 'pause' to pause.", ""],
      isError: true,
    };
  }

  const gameMode = parseGameMode(parts);
  startGame(gameMode);

  const config = createGameConfig(size.width, size.height, undefined, gameMode);
  playCommandSound("start", false);
  return {
    output: [
      "Game started!",
      `Grid size: ${config.gridSize}x${config.gridSize}`,
      `Difficulty: ${config.difficulty}`,
      `Mode: ${config.mode}${config.obstacles ? " (with obstacles)" : ""}`,
      "Use arrow keys to control the snake.",
      "Commands: pause, resume, restart, scores",
      "",
    ],
  };
}

/**
 * Обработчик команды pause
 */
export function handlePause(context: CommandHandlersContext): CommandResult {
  const { gameState, pauseGame } = context;

  if (gameState !== "playing") {
    playCommandSound("pause", true);
    return {
      output: ["Game is not running. Use 'start' to begin.", ""],
      isError: true,
    };
  }

  pauseGame();
  playCommandSound("pause", false);
  return {
    output: ["Game paused. Use 'resume' to continue.", ""],
  };
}

/**
 * Обработчик команды resume
 */
export function handleResume(context: CommandHandlersContext): CommandResult {
  const { gameState, gameData, resumeGame } = context;

  if (gameState !== "paused") {
    playCommandSound("resume", true);
    return {
      output: ["Game is not paused. Use 'pause' to pause.", ""],
      isError: true,
    };
  }

  if (!gameData) {
    playCommandSound("resume", true);
    return {
      output: ["No game data. Use 'start' to begin.", ""],
      isError: true,
    };
  }

  resumeGame();
  playCommandSound("resume", false);
  return {
    output: ["Game resumed.", ""],
  };
}

/**
 * Обработчик команды restart
 */
export function handleRestart(context: CommandHandlersContext): CommandResult {
  const { gameData, restartGame } = context;

  if (!gameData) {
    playCommandSound("restart", true);
    return {
      output: ["No game to restart. Use 'start' to begin.", ""],
      isError: true,
    };
  }

  restartGame();
  playCommandSound("restart", false);
  return {
    output: ["Game restarted.", ""],
  };
}

/**
 * Обработчик команды scores
 */
export function handleScores(): CommandResult {
  const scores = loadHighScores();
  playCommandSound("scores", false);

  if (scores.length === 0) {
    return {
      output: ["No high scores yet. Play the game to set a record!", ""],
    };
  }

  return {
    output: [
      "HIGH SCORES",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      ...scores.map((hs, i) => {
        const date = new Date(hs.date).toLocaleDateString();
        return `${i + 1}. ${hs.score} points (Level ${hs.level}, ${hs.difficulty}) - ${date}`;
      }),
      "",
    ],
  };
}

/**
 * Обработчик команды size
 */
export function handleSize(parts: string[], context: CommandHandlersContext): CommandResult {
  const { size, setSize } = context;

  if (parts.length === 2 && parts[1].toLowerCase() === "reset") {
    setSize(DEFAULT_WINDOW_SIZE);
    playCommandSound("size", false);
    return {
      output: [
        `Window size reset to default: ${DEFAULT_WINDOW_SIZE.width}x${DEFAULT_WINDOW_SIZE.height}`,
        "",
      ],
      isError: false,
    };
  }

  if (parts.length < 3) {
    playCommandSound("size", false);
    return {
      output: [
        `Current window size: ${size.width}x${size.height}`,
        "",
        "Usage: size <width> <height>",
        `       size reset - Reset to default (${DEFAULT_WINDOW_SIZE.width}x${DEFAULT_WINDOW_SIZE.height})`,
        "",
      ],
      isError: false,
    };
  }

  const width = parseInt(parts[1]);
  const height = parseInt(parts[2]);

  if (isNaN(width) || isNaN(height)) {
    playCommandSound("size", true);
    return {
      output: ["Error: Width and height must be numbers", ""],
      isError: true,
    };
  }

  setSize({ width, height });
  playCommandSound("size", false);
  return {
    output: [`Window size changed to: ${width}x${height}`, ""],
    isError: false,
  };
}

/**
 * Обработчик команды theme
 */
export function handleTheme(parts: string[], context: CommandHandlersContext): CommandResult {
  const { gameTheme, setGameTheme } = context;

  if (parts.length < 2) {
    playCommandSound("theme", false);
    return {
      output: [
        `Current theme: ${gameTheme}`,
        `Available themes: ${VALID_THEMES.join(", ")}`,
        "Usage: theme <name>",
        "",
      ],
      isError: false,
    };
  }

  const newTheme = parts[1].toLowerCase();
  if (!VALID_THEMES.includes(newTheme as (typeof VALID_THEMES)[number])) {
    playCommandSound("theme", true);
    return {
      output: [`Invalid theme: ${newTheme}`, ""],
      isError: true,
    };
  }

  setGameTheme(newTheme as Theme);
  playCommandSound("theme", false);
  return {
    output: [`Theme changed to: ${newTheme}`, ""],
    isError: false,
    theme: newTheme as Theme,
  };
}

/**
 * Обработчик команды help
 */
export function handleHelp(): CommandResult {
  playCommandSound("help", false);
  return {
    output: [
      "SNAKE GAME - COMMANDS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "Game commands:",
      "  start [obstacles]  - Start new game (classic or obstacles mode)",
      "  pause              - Pause current game",
      "  resume             - Resume paused game",
      "  restart            - Restart current game",
      "  scores             - Show high scores",
      "",
      "Game modes:",
      "  classic    - Standard snake game",
      "  obstacles  - Snake game with obstacles",
      "",
      "Control:",
      "  Arrow keys - Control snake direction",
      "  Space      - Pause/Resume (during game)",
      "",
      "General commands:",
      "  size       - Change window size",
      "  theme      - Change theme",
      "  help       - Show this help",
      "  close/exit - Close game",
      "",
    ],
  };
}
