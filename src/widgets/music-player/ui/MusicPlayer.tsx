import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import type { CommandContext } from "@entities/command/types";
import { musicPlayer } from "@features/music/lib/musicPlayer";

import { handleMusicPlayerCommand } from "@features/music/lib/musicPlayerCommands";
import { useDragResize, useTerminalWindow, useAppFocus } from "@shared/lib/hooks";
import { soundGenerator } from "@shared/lib/sounds";
import { playCommandSound } from "@shared/lib/sounds/soundHandler";

import type {
  CommandResult,
  MusicPlayerProps,
  TerminalSize,
  VisualizationMode,
} from "../../../types";
import "./MusicPlayer.css";

export const MusicPlayer = ({ theme, onClose, zIndex = 1000, onFocus }: MusicPlayerProps) => {
  const [playerTheme, setPlayerTheme] = useState(theme);
  const [currentTrack, setCurrentTrack] = useState(musicPlayer.getCurrentTrack());
  const [status, setStatus] = useState(musicPlayer.getStatus());
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [nextTrack, setNextTrack] = useState(musicPlayer.getNextTrack());
  const [shuffle, setShuffle] = useState(musicPlayer.getShuffle());
  const [repeat, setRepeat] = useState(musicPlayer.getRepeat());
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(
    musicPlayer.getVisualizationMode()
  );

  const savedSettings = musicPlayer.getSavedSettings();
  const [position, setPosition] = useState(() => {
    return savedSettings?.windowPosition || { x: 0, y: 0 };
  });
  const [playerSize, setPlayerSize] = useState(() => {
    return savedSettings?.windowSize || { width: 600, height: 400 };
  });

  useEffect(() => {
    const hasSavedPosition =
      savedSettings?.windowPosition !== undefined && savedSettings.windowPosition !== null;

    if (!hasSavedPosition) {
      const centerX = Math.max(0, (window.innerWidth - playerSize.width) / 2);
      const centerY = Math.max(0, (window.innerHeight - playerSize.height) / 2);
      const centeredPosition = { x: centerX, y: centerY };
      setPosition(centeredPosition);
      musicPlayer.saveWindowState(playerSize, centeredPosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      musicPlayer.saveWindowState(playerSize, position);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [position, playerSize]);

  useEffect(() => {
    return () => {
      musicPlayer.saveWindowState(playerSize, position);
    };
  }, [playerSize, position]);

  const { dragHandlers } = useDragResize({
    size: playerSize,
    position,
    onSizeChange: setPlayerSize,
    onPositionChange: setPosition,
    minSize: { width: 400, height: 300 },
    maxSize: { width: 1200, height: 800 },
    onFocus,
  });

  const rawHistoryRef = useRef<string[]>([]);

  const handleCommand = useCallback(
    async (cmd: string): Promise<CommandResult> => {
      const trimmed = cmd.trim();
      if (!trimmed) {
        return { output: [] };
      }

      const parts = trimmed.split(/\s+/);
      const command = parts[0];
      const args = parts.slice(1);

      if (command.toLowerCase() === "close" || command.toLowerCase() === "exit") {
        onClose();
        return { output: [] };
      }

      const context: CommandContext = {
        rawHistory: rawHistoryRef.current,
        theme: playerTheme,
        setThemeCallback: newTheme => {
          setPlayerTheme(newTheme);
        },
        currentSize: playerSize,
        setSizeCallback: (size: TerminalSize) => {
          setPlayerSize(size);
          setPosition(prevPos => {
            let newX = prevPos.x;
            let newY = prevPos.y;

            if (prevPos.x + size.width > window.innerWidth) {
              newX = Math.max(0, window.innerWidth - size.width);
            }

            if (prevPos.y + size.height > window.innerHeight) {
              newY = Math.max(0, window.innerHeight - size.height);
            }

            if (newX < 0) {
              newX = 0;
            }

            if (newY < 0) {
              newY = 0;
            }

            return { x: newX, y: newY };
          });
        },
      };

      const result = await handleMusicPlayerCommand(command, args, context);

      playCommandSound(cmd, result?.isError || false);

      if (result.theme) {
        setPlayerTheme(result.theme);
      }

      return result;
    },
    [playerTheme, playerSize, setPlayerSize, setPosition, onClose]
  );

  const terminal = useTerminalWindow({
    onCommand: handleCommand,
    prompt: "music@player:~$",
    onThemeChange: (newTheme: string) => {
      setPlayerTheme(newTheme as typeof theme);
    },
  });

  useEffect(() => {
    rawHistoryRef.current = terminal.rawCommandHistory;
  }, [terminal.rawCommandHistory]);

  useAppFocus({
    appName: "music",
    onClose,
    onFocus,
  });

  useEffect(() => {
    setPlayerTheme(theme);
  }, [theme]);

  useEffect(() => {
    const updateState = () => {
      setCurrentTrack(musicPlayer.getCurrentTrack());
      setStatus(musicPlayer.getStatus());
      setNextTrack(musicPlayer.getNextTrack());
      setShuffle(musicPlayer.getShuffle());
      setRepeat(musicPlayer.getRepeat());
      setVisualizationMode(musicPlayer.getVisualizationMode());
      const state = musicPlayer.getState();
      setPlaybackPosition(state.position);
      setPlaybackDuration(state.duration);
    };

    const updateTime = () => {
      const state = musicPlayer.getState();
      setPlaybackPosition(state.position);
      setPlaybackDuration(state.duration);
    };

    musicPlayer.on("trackChanged", updateState);
    musicPlayer.on("statusChanged", updateState);
    musicPlayer.on("playlistChanged", updateState);
    musicPlayer.on("shuffleChanged", updateState);
    musicPlayer.on("repeatChanged", updateState);
    musicPlayer.on("visualizationModeChanged", updateState);
    musicPlayer.on("timeUpdate", updateTime);
    musicPlayer.on("trackLoaded", updateState);

    return () => {
      musicPlayer.off("trackChanged", updateState);
      musicPlayer.off("statusChanged", updateState);
      musicPlayer.off("playlistChanged", updateState);
      musicPlayer.off("shuffleChanged", updateState);
      musicPlayer.off("repeatChanged", updateState);
      musicPlayer.off("visualizationModeChanged", updateState);
      musicPlayer.off("timeUpdate", updateTime);
      musicPlayer.off("trackLoaded", updateState);
    };
  }, []);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const animate = () => {
      const data = musicPlayer.getFrequencyData();
      if (data) {
        setFrequencyData(data);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (status === "playing") {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setFrequencyData(null);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status]);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const NUM_BARS = useMemo(() => {
    const availableWidth = playerSize.width - 34;
    const charWidth = 6.0;
    const bars = Math.floor(availableWidth / charWidth);
    return Math.max(15, Math.min(200, bars));
  }, [playerSize.width]);

  // Визуализация столбиков (режим bars)
  const renderBars = () => {
    const MAX_HEIGHT = 12;

    const bars: string[] = [];

    if (!frequencyData || status !== "playing") {
      for (let row = MAX_HEIGHT - 1; row >= 0; row--) {
        bars.push(" ".repeat(NUM_BARS));
      }
      return (
        <div className="visualization-container">
          <div className="visualization" ref={visualizationRef}>
            <pre className="visualization-content">{bars.join("\n")}</pre>
          </div>
          <div className="visualization-time">
            {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
          </div>
          {nextTrack && (
            <div className="visualization-next">
              next: {nextTrack.title} - {nextTrack.artist}
            </div>
          )}
        </div>
      );
    }

    const dataLength = frequencyData.length;
    const step = Math.floor(dataLength / NUM_BARS) || 1;
    const normalizedData: number[] = [];

    for (let i = 0; i < NUM_BARS; i++) {
      let sum = 0;
      const start = i * step;
      const end = Math.min(start + step, dataLength);
      for (let j = start; j < end; j++) {
        sum += frequencyData[j];
      }
      const avg = sum / (end - start || 1);
      const normalized = Math.min(Math.floor((avg / 255) * MAX_HEIGHT * 1.2), MAX_HEIGHT);
      normalizedData.push(normalized);
    }

    for (let row = MAX_HEIGHT - 1; row >= 0; row--) {
      const line = normalizedData
        .map(height => {
          if (height > row) {
            const relativeHeight = height - row;
            const heightPercent = relativeHeight / height;

            // Градиент от верха к низу
            if (heightPercent >= 0.85) {
              return "█"; // Полный блок для верха
            } else if (heightPercent >= 0.7) {
              return "▓"; // Темный блок
            } else if (heightPercent >= 0.55) {
              return "▒"; // Средний блок
            } else if (heightPercent >= 0.4) {
              return "░"; // Светлый блок
            } else if (heightPercent >= 0.25) {
              return "▄"; // Нижняя половина блока
            } else {
              return "▁"; // Маленький блок внизу
            }
          }
          return " ";
        })
        .join("");
      bars.push(line);
    }

    return (
      <div className="visualization-container">
        <div className="visualization" ref={visualizationRef}>
          <pre className="visualization-content">{bars.join("\n")}</pre>
        </div>
        <div className="visualization-time">
          {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
        </div>
        {nextTrack && (
          <div className="visualization-next">
            next: {nextTrack.title} - {nextTrack.artist}
          </div>
        )}
      </div>
    );
  };

  // Визуализация волн (режим waves)
  const renderWaves = () => {
    const MAX_HEIGHT = 12;
    const NUM_WAVES = NUM_BARS;

    if (!frequencyData || status !== "playing") {
      const emptyWaves = Array(MAX_HEIGHT)
        .fill(0)
        .map(() => "─".repeat(NUM_WAVES));
      return (
        <div className="visualization-container">
          <div className="visualization" ref={visualizationRef}>
            <pre className="visualization-content">{emptyWaves.join("\n")}</pre>
          </div>
          <div className="visualization-time">
            {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
          </div>
          {nextTrack && (
            <div className="visualization-next">
              next: {nextTrack.title} - {nextTrack.artist}
            </div>
          )}
        </div>
      );
    }

    const dataLength = frequencyData.length;
    const step = Math.floor(dataLength / NUM_WAVES) || 1;
    const normalizedData: number[] = [];

    for (let i = 0; i < NUM_WAVES; i++) {
      let sum = 0;
      const start = i * step;
      const end = Math.min(start + step, dataLength);
      for (let j = start; j < end; j++) {
        sum += frequencyData[j];
      }
      const avg = sum / (end - start || 1);
      const normalized = Math.min(Math.floor((avg / 255) * MAX_HEIGHT * 1.2), MAX_HEIGHT);
      normalizedData.push(normalized);
    }

    const waves: string[] = [];
    for (let row = 0; row < MAX_HEIGHT; row++) {
      const line = normalizedData
        .map(height => {
          const wavePosition = Math.floor((height / MAX_HEIGHT) * MAX_HEIGHT);
          const distance = Math.abs(wavePosition - row);

          if (distance === 0) {
            return "█"; // Пик волны
          } else if (distance === 1) {
            return "▓"; // Близко к пику
          } else if (distance === 2) {
            return "▒"; // Средняя высота
          } else if (distance === 3) {
            return "░"; // Низкая высота
          } else if (distance <= 5 && height > 0) {
            return "·"; // Очень низкая
          }
          return "─"; // Базовая линия
        })
        .join("");
      waves.push(line);
    }

    return (
      <div className="visualization-container">
        <div className="visualization" ref={visualizationRef}>
          <pre className="visualization-content">{waves.join("\n")}</pre>
        </div>
        <div className="visualization-time">
          {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
        </div>
        {nextTrack && (
          <div className="visualization-next">
            next: {nextTrack.title} - {nextTrack.artist}
          </div>
        )}
      </div>
    );
  };

  // Визуализация спектра (режим spectrum)
  const renderSpectrum = () => {
    const MAX_HEIGHT = 12;
    const NUM_POINTS = NUM_BARS;

    if (!frequencyData || status !== "playing") {
      const emptySpectrum = " ".repeat(NUM_POINTS);
      return (
        <div className="visualization-container">
          <div className="visualization" ref={visualizationRef}>
            <pre className="visualization-content">
              {Array(MAX_HEIGHT)
                .fill(0)
                .map(() => emptySpectrum)
                .join("\n")}
            </pre>
          </div>
          <div className="visualization-time">
            {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
          </div>
          {nextTrack && (
            <div className="visualization-next">
              next: {nextTrack.title} - {nextTrack.artist}
            </div>
          )}
        </div>
      );
    }

    const dataLength = frequencyData.length;
    const step = Math.floor(dataLength / NUM_POINTS) || 1;
    const normalizedData: number[] = [];

    for (let i = 0; i < NUM_POINTS; i++) {
      let sum = 0;
      const start = i * step;
      const end = Math.min(start + step, dataLength);
      for (let j = start; j < end; j++) {
        sum += frequencyData[j];
      }
      const avg = sum / (end - start || 1);
      const normalized = Math.min(Math.floor((avg / 255) * MAX_HEIGHT * 1.2), MAX_HEIGHT);
      normalizedData.push(normalized);
    }

    const spectrum: string[] = [];

    const maxHeight = Math.max(...normalizedData, 1);

    for (let row = MAX_HEIGHT - 1; row >= 0; row--) {
      const line = normalizedData
        .map((height, index) => {
          const normalizedHeight = (height / maxHeight) * MAX_HEIGHT;
          const rowBottom = row;
          const rowTop = row + 1;

          if (normalizedHeight > rowBottom) {
            const fillRatio = Math.min(1, normalizedHeight - rowBottom);

            if (fillRatio >= 0.95) {
              return "█"; // Полностью заполнено
            } else if (fillRatio >= 0.8) {
              return "▉"; // Почти полностью
            } else if (fillRatio >= 0.65) {
              return "▊"; // Большая часть
            } else if (fillRatio >= 0.5) {
              return "▋"; // Половина
            } else if (fillRatio >= 0.35) {
              return "▌"; // Меньше половины
            } else if (fillRatio >= 0.2) {
              return "▍"; // Малая часть
            } else if (fillRatio >= 0.1) {
              return "▎"; // Очень малая часть
            } else {
              return "▏"; // Минимальная часть
            }
          }

          const prevHeight = index > 0 ? (normalizedData[index - 1] / maxHeight) * MAX_HEIGHT : 0;
          const nextHeight =
            index < normalizedData.length - 1
              ? (normalizedData[index + 1] / maxHeight) * MAX_HEIGHT
              : 0;

          if (
            (prevHeight > rowBottom && prevHeight <= rowTop) ||
            (nextHeight > rowBottom && nextHeight <= rowTop)
          ) {
            const between =
              (prevHeight > rowBottom && nextHeight <= rowBottom) ||
              (prevHeight <= rowBottom && nextHeight > rowBottom);
            return between ? "·" : " ";
          }

          return " ";
        })
        .join("");
      spectrum.push(line);
    }

    return (
      <div className="visualization-container">
        <div className="visualization" ref={visualizationRef}>
          <pre className="visualization-content">{spectrum.join("\n")}</pre>
        </div>
        <div className="visualization-time">
          {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
        </div>
        {nextTrack && (
          <div className="visualization-next">
            next: {nextTrack.title} - {nextTrack.artist}
          </div>
        )}
      </div>
    );
  };

  const renderVisualization = () => {
    switch (visualizationMode) {
      case "bars":
        return renderBars();
      case "waves":
        return renderWaves();
      case "spectrum":
        return renderSpectrum();
      default:
        return renderBars();
    }
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains("music-player-header") ||
        target.closest(".music-player-header")
      ) {
        dragHandlers.onMouseDown(e);
      }
    },
    [dragHandlers]
  );

  return (
    <div className="music-player-overlay" style={{ zIndex: zIndex }}>
      <div
        className={`music-player theme-${playerTheme} ${terminal.glitchActive ? "glitch" : ""}`}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${playerSize.width}px`,
          height: `${playerSize.height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="music-player-header">
          <span className="music-player-title">
            {currentTrack ? `${currentTrack.title} - ${currentTrack.artist}` : "No track loaded"}
          </span>
          <span className="music-player-status">
            [{status}]{shuffle && " [SHUFFLE]"}
            {repeat !== "off" && ` [REPEAT: ${repeat.toUpperCase()}]`}
          </span>
        </div>

        <div className="music-player-content">
          {renderVisualization()}

          <div
            className="music-player-terminal"
            ref={terminal.terminalRef}
            onClick={terminal.handleTerminalClick}
          >
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
    </div>
  );
};
