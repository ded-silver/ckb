import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import { useWindowState, useDragResize, useTerminalWindow, useAppFocus } from "@shared/lib/hooks";
import { inputManager } from "@shared/lib/inputManager";
import { soundGenerator } from "@shared/lib/sounds";
import { playCommandSound } from "@shared/lib/sounds/soundHandler";

import type { CommandResult, Theme } from "../../../types";
import {
  checkAchievements,
  createGameConfig,
  createInitialGameData,
  gameTick,
  type Direction,
  type GameData,
  type GameMode,
  type GameState,
} from "../model";
import {
  handleHelp,
  handlePause,
  handleResume,
  handleRestart,
  handleScores,
  handleSize,
  handleStart,
  handleTheme,
} from "./commandHandlers";
import {
  DEFAULT_WINDOW_SIZE,
  MAX_WINDOW_SIZE,
  MIN_WINDOW_SIZE,
  WELCOME_MESSAGE,
} from "./constants";
import { renderGameField } from "./renderGameField";
import { addHighScore } from "../model/highScores";
import "./SnakeGame.css";

interface SnakeGameProps {
  theme: Theme;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export const SnakeGame = ({ theme, onClose, zIndex = 1000, onFocus }: SnakeGameProps) => {
  const [gameTheme, setGameTheme] = useState(theme);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  const { size, position, setSize, setPosition } = useWindowState({
    storageKey: "snake_game_window_state",
    defaultSize: DEFAULT_WINDOW_SIZE,
    autoCenter: true,
  });

  const { dragHandlers } = useDragResize({
    size,
    position,
    onSizeChange: setSize,
    onPositionChange: setPosition,
    minSize: MIN_WINDOW_SIZE,
    maxSize: MAX_WINDOW_SIZE,
    onFocus,
  });

  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current !== null) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  const startGameLoop = useCallback(
    (data: GameData) => {
      stopGameLoop();
      gameLoopRef.current = window.setInterval(() => {
        setGameData(prev => {
          if (!prev) return null;
          const result = gameTick(prev);
          if (result.gameOver) {
            stopGameLoop();
            setGameState("gameover");
            addHighScore({
              score: prev.score,
              level: prev.level,
              difficulty: prev.config.difficulty,
              mode: prev.config.mode,
              gridSize: prev.config.gridSize,
              date: Date.now(),
            });
            return prev;
          }
          return result.gameData;
        });
      }, data.config.speed) as unknown as number;
    },
    [stopGameLoop]
  );

  const startGame = useCallback(
    (mode: GameMode) => {
      const config = createGameConfig(size.width, size.height, undefined, mode);
      const initialData = createInitialGameData(config);
      setGameData(initialData);
      setGameState("playing");
      startGameLoop(initialData);
    },
    [size.width, size.height, startGameLoop]
  );

  const pauseGame = useCallback(() => {
    stopGameLoop();
    setGameState("paused");
  }, [stopGameLoop]);

  const resumeGame = useCallback(() => {
    if (gameData) {
      setGameState("playing");
      startGameLoop(gameData);
    }
  }, [gameData, startGameLoop]);

  const restartGame = useCallback(() => {
    if (gameData) {
      const config = gameData.config;
      const initialData = createInitialGameData(config);
      setGameData(initialData);
      setGameState("playing");
      startGameLoop(initialData);
    }
  }, [gameData, startGameLoop]);

  const handleCommand = useCallback(
    async (cmd: string): Promise<CommandResult> => {
      const trimmed = cmd.trim();
      if (!trimmed) {
        return { output: [] };
      }

      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();

      if (command === "close" || command === "exit") {
        stopGameLoop();
        onClose();
        return { output: [] };
      }

      const context = {
        gameState,
        gameData,
        size,
        setSize,
        gameTheme,
        setGameTheme,
        onClose,
        startGame,
        pauseGame,
        resumeGame,
        restartGame,
      };

      switch (command) {
        case "start":
        case "play":
          return handleStart(parts, context);
        case "pause":
          return handlePause(context);
        case "resume":
          return handleResume(context);
        case "restart":
          return handleRestart(context);
        case "scores":
        case "highscores":
          return handleScores();
        case "size":
          return handleSize(parts, context);
        case "theme":
          return handleTheme(parts, context);
        case "help":
        case "?":
          return handleHelp();
        default:
          playCommandSound(cmd, true);
          return {
            output: [`Unknown command: ${command}`, 'Type "help" for available commands', ""],
            isError: true,
          };
      }
    },
    [
      gameState,
      gameData,
      size,
      setSize,
      gameTheme,
      setGameTheme,
      onClose,
      startGame,
      pauseGame,
      resumeGame,
      restartGame,
      stopGameLoop,
    ]
  );

  const terminal = useTerminalWindow({
    onCommand: handleCommand,
    prompt: "snake@game:~$",
    welcomeMessage: WELCOME_MESSAGE,
    onThemeChange: (newTheme: string) => {
      setGameTheme(newTheme as Theme);
    },
  });

  useAppFocus({
    appName: "snake",
    onClose,
    onFocus,
  });

  const handleDirectionChange = useCallback((direction: Direction) => {
    setGameData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        snake: {
          ...prev.snake,
          nextDirection: direction,
        },
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      pauseGame();
    } else if (gameState === "paused") {
      resumeGame();
    }
  }, [gameState, pauseGame, resumeGame]);

  useEffect(() => {
    if (gameState !== "playing" || !gameData) return;

    const directionMap: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };

    const handleKey = (e: KeyboardEvent): boolean => {
      if (directionMap[e.key]) {
        handleDirectionChange(directionMap[e.key]);
        return true;
      }

      if (e.key === " ") {
        togglePause();
        return true;
      }

      return false;
    };

    inputManager.captureKeys("snake", handleKey);

    return () => {
      inputManager.releaseKeys("snake");
    };
  }, [gameState, gameData, handleDirectionChange, togglePause]);

  useEffect(() => {
    return () => {
      stopGameLoop();
    };
  }, [stopGameLoop]);

  useEffect(() => {
    setGameTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!gameData || gameState !== "playing") return;

    checkAchievements(gameData, notification => {
      window.dispatchEvent(
        new CustomEvent("snake-achievement", {
          detail: { message: notification },
        })
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData?.score, gameData?.level, gameState]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("snake-game-header") || target.closest(".snake-game-header")) {
        dragHandlers.onMouseDown(e);
      }
    },
    [dragHandlers]
  );

  const gameFieldOutput = useMemo(() => {
    if (!gameData) return [];
    return renderGameField(gameData);
  }, [gameData]);

  return (
    <div
      className={`snake-game theme-${gameTheme} ${terminal.glitchActive ? "glitch" : ""}`}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="snake-game-header">
        <span className="snake-game-title">snake.exe</span>
        {gameData && (
          <span className="snake-game-status">
            Score: {gameData.score} | Level: {gameData.level} |{" "}
            {gameState === "playing" ? "PLAYING" : gameState === "paused" ? "PAUSED" : "MENU"}
          </span>
        )}
      </div>

      <div className="snake-game-content">
        {(gameState === "playing" || gameState === "paused" || gameState === "gameover") &&
          gameData && (
            <div className="game-field-container">
              <div className="game-field" data-state={gameState}>
                <pre className="game-field-content">{gameFieldOutput.join("\n")}</pre>
              </div>
              {gameState === "playing" && (
                <div className="level-progress">
                  <div
                    className="level-progress-bar"
                    style={{
                      width: `${Math.min(((gameData.score % 10) / 10) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
              {gameState === "paused" && (
                <div className="game-field-status">PAUSED - Press SPACE or type 'resume'</div>
              )}
              {gameState === "gameover" && (
                <div className="game-field-status gameover">
                  GAME OVER - Score: {gameData.score} | Level: {gameData.level} | Type 'restart' to
                  play again
                </div>
              )}
            </div>
          )}

        <div
          className="snake-game-terminal"
          ref={terminal.terminalRef}
          onClick={terminal.handleTerminalClick}
        >
          {terminal.commandHistory.length === 0 && terminal.welcomeMessage.length > 0 && (
            <div className="welcome-message">
              {terminal.welcomeMessage.map((line, idx) => (
                <div key={idx} className="output-line">
                  {line}
                </div>
              ))}
              <div className="output-line"></div>
            </div>
          )}

          {terminal.commandHistory.map((entry, idx) => (
            <div key={idx} className="command-entry">
              <div className="command-line">
                <span className="prompt">{terminal.prompt}</span> {entry.command}
              </div>
              {entry.output.map((line, lineIdx) => (
                <div key={lineIdx} className={`output-line ${entry.isError ? "error" : ""}`}>
                  {line}
                </div>
              ))}
            </div>
          ))}

          <div className="command-input">
            <span className="prompt">{terminal.prompt}</span>
            <div className="input-wrapper">
              <input
                ref={terminal.inputRef}
                type="text"
                value={terminal.currentCommand}
                onChange={e => {
                  terminal.setCurrentCommand(e.target.value);
                  setTimeout(terminal.updateCursorPosition, 0);
                  if (e.target.value.length > 0) {
                    soundGenerator.playType();
                  }
                }}
                onKeyPress={terminal.handleKeyPress}
                onKeyDown={terminal.handleKeyDown}
                onSelect={() => {
                  setTimeout(terminal.updateCursorPosition, 0);
                }}
                onClick={() => {
                  setTimeout(terminal.updateCursorPosition, 0);
                }}
                onFocus={() => {
                  terminal.setIsFocused(true);
                  terminal.updateCursorPosition();
                }}
                onBlur={() => terminal.setIsFocused(false)}
                className="input-field"
                autoFocus
                disabled={terminal.isTypingOutput}
              />
              <span ref={terminal.measureRef} className="text-measure" aria-hidden="true"></span>
              {!terminal.isTypingOutput && terminal.isFocused && (
                <span
                  ref={terminal.cursorRef}
                  className={`input-cursor ${terminal.showCursor ? "visible" : ""}`}
                ></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
