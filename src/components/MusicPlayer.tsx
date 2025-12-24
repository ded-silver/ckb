import { useState, useEffect, useRef, useMemo } from "react";
import { MusicPlayerProps, TerminalSize, VisualizationMode } from "../types";
import { musicPlayer } from "../utils/musicPlayer";
import { useCursor } from "../hooks/useCursor";
import { soundGenerator } from "../utils/sounds";
import { playCommandSound } from "../utils/soundHandler";
import { handleMusicPlayerCommand } from "../utils/musicPlayerCommands";
import { CommandContext } from "../utils/commandRegistry";
import "./MusicPlayer.css";

export const MusicPlayer = ({ theme, onClose }: MusicPlayerProps) => {
  const [playerTheme, setPlayerTheme] = useState(theme);
  const [currentTrack, setCurrentTrack] = useState(
    musicPlayer.getCurrentTrack()
  );
  const [status, setStatus] = useState(musicPlayer.getStatus());
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [nextTrack, setNextTrack] = useState(musicPlayer.getNextTrack());
  const [shuffle, setShuffle] = useState(musicPlayer.getShuffle());
  const [repeat, setRepeat] = useState(musicPlayer.getRepeat());
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(
    musicPlayer.getVisualizationMode()
  );
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<
    Array<{ command: string; output: string[]; isError?: boolean }>
  >([]);
  const [rawCommandHistory, setRawCommandHistory] = useState<string[]>([]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const [tempCommand, setTempCommand] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  const [isTypingOutput, setIsTypingOutput] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const savedSettings = musicPlayer.getSavedSettings();
  const [position, setPosition] = useState(() => {
    return savedSettings?.windowPosition || { x: 0, y: 0 };
  });
  const [playerSize, setPlayerSize] = useState(() => {
    return savedSettings?.windowSize || { width: 600, height: 400 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const playerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const currentCommandRef = useRef<{
    command: string;
    output: string[];
  } | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);

  const { cursorRef, measureRef, updateCursorPosition } = useCursor(
    currentCommand,
    isTypingOutput,
    inputRef
  );

  // Загрузка начальной позиции
  useEffect(() => {
    if (playerRef.current) {
      const hasSavedPosition =
        savedSettings?.windowPosition !== undefined &&
        savedSettings.windowPosition !== null;

      if (!hasSavedPosition) {
        const centerX = Math.max(0, (window.innerWidth - playerSize.width) / 2);
        const centerY = Math.max(
          0,
          (window.innerHeight - playerSize.height) / 2
        );
        setPosition({ x: centerX, y: centerY });
        musicPlayer.saveWindowState(playerSize, { x: centerX, y: centerY });
      }
    }
  }, []);

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

  // Мигание курсора
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Фокус на инпут
  useEffect(() => {
    if (inputRef.current && isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  // Восстановление фокуса после завершения анимации вывода
  useEffect(() => {
    if (!isTypingOutput && inputRef.current) {
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setIsFocused(true);
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isTypingOutput]);

  // Сохранение размера и позиции окна при изменении (с debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      musicPlayer.saveWindowState(playerSize, position);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [position, playerSize]);

  // Сохранение позиции при закрытии плеера
  useEffect(() => {
    return () => {
      musicPlayer.saveWindowState(playerSize, position);
    };
  }, [playerSize, position]);

  // Автопрокрутка терминала
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Анимация визуализации
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

  // Перемещение окна клавиатурой (Ctrl+Alt+Стрелки)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        return;
      }

      if (e.ctrlKey && e.altKey) {
        const step = 10;
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            e.stopPropagation();
            setPosition((prev) => ({ ...prev, y: Math.max(0, prev.y - step) }));
            break;
          case "ArrowDown":
            e.preventDefault();
            e.stopPropagation();
            setPosition((prev) => ({
              ...prev,
              y: Math.min(
                window.innerHeight - playerSize.height,
                prev.y + step
              ),
            }));
            break;
          case "ArrowLeft":
            e.preventDefault();
            e.stopPropagation();
            setPosition((prev) => ({ ...prev, x: Math.max(0, prev.x - step) }));
            break;
          case "ArrowRight":
            e.preventDefault();
            e.stopPropagation();
            setPosition((prev) => ({
              ...prev,
              x: Math.min(window.innerWidth - playerSize.width, prev.x + step),
            }));
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // Перемещение мышью
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.classList.contains("music-player-header") ||
      target.closest(".music-player-header")
    ) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const animateOutput = (output: string[]) => {
    if (output.length === 0) {
      setIsTypingOutput(false);
      return;
    }

    setIsTypingOutput(true);
    let currentIndex = 0;

    const addNextLine = () => {
      if (currentIndex < output.length && currentCommandRef.current) {
        const line = output[currentIndex];
        currentCommandRef.current.output.push(line);

        setCommandHistory((prev) => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          if (lastIndex >= 0 && currentCommandRef.current) {
            newHistory[lastIndex] = {
              ...newHistory[lastIndex],
              output: [...currentCommandRef.current.output],
            };
          }
          return newHistory;
        });

        currentIndex++;
        typingTimeoutRef.current = setTimeout(addNextLine, 40);
      } else {
        setIsTypingOutput(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        currentCommandRef.current = null;
      }
    };

    typingTimeoutRef.current = setTimeout(addNextLine, 50);
  };

  // Обработка команд через новую систему
  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    if (command.toLowerCase() === "close" || command.toLowerCase() === "exit") {
      onClose();
      return;
    }

    if (command.toLowerCase() === "clear") {
      setCommandHistory([]);
      setRawCommandHistory([]);
      setCommandHistoryIndex(-1);
      setTempCommand("");
      return;
    }

    const context: CommandContext = {
      rawHistory: rawCommandHistory,
      theme: playerTheme,
      setThemeCallback: (newTheme) => {
        setPlayerTheme(newTheme);
      },
      currentSize: playerSize,
      setSizeCallback: (size: TerminalSize) => {
        setPlayerSize(size);
        setPosition((prevPos) => {
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

    // Воспроизведение звука команды
    playCommandSound(cmd, result.isError || false);

    // Обработка ошибок - глитч-эффект
    if (result.isError) {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 500);
    }

    // Обработка изменения темы
    if (result.theme) {
      setPlayerTheme(result.theme);
    }

    // Создаем новую запись в истории
    const newEntry = { command: cmd, output: [], isError: result.isError };
    setCommandHistory((prev) => [...prev, newEntry]);
    setRawCommandHistory((prev) => [...prev, cmd]);
    setCommandHistoryIndex(-1);
    setTempCommand("");
    setCurrentCommand("");

    currentCommandRef.current = newEntry;

    animateOutput(result.output);
  };

  // Обработка истории команд
  const handleArrowUp = () => {
    if (rawCommandHistory.length === 0) return;

    if (commandHistoryIndex === -1) {
      setTempCommand(currentCommand);
    }

    const newIndex =
      commandHistoryIndex < rawCommandHistory.length - 1
        ? commandHistoryIndex + 1
        : rawCommandHistory.length - 1;
    setCommandHistoryIndex(newIndex);
    setCurrentCommand(
      rawCommandHistory[rawCommandHistory.length - 1 - newIndex]
    );
  };

  const handleArrowDown = () => {
    if (commandHistoryIndex === -1) return;

    if (commandHistoryIndex === 0) {
      setCommandHistoryIndex(-1);
      setCurrentCommand(tempCommand);
      setTempCommand("");
    } else {
      const newIndex = commandHistoryIndex - 1;
      setCommandHistoryIndex(newIndex);
      setCurrentCommand(
        rawCommandHistory[rawCommandHistory.length - 1 - newIndex]
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentCommand);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Обработка стрелок для истории команд
    if (e.key === "ArrowUp") {
      if (!(e.ctrlKey && e.altKey)) {
        e.preventDefault();
        e.stopPropagation();
        handleArrowUp();
        setTimeout(updateCursorPosition, 0);
        return;
      }
    } else if (e.key === "ArrowDown") {
      if (!(e.ctrlKey && e.altKey)) {
        e.preventDefault();
        e.stopPropagation();
        handleArrowDown();
        setTimeout(updateCursorPosition, 0);
        return;
      }
    } else {
      setTimeout(updateCursorPosition, 0);
    }

    if (e.key === "Escape") {
      onClose();
    }
  };

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
      const normalized = Math.min(
        Math.floor((avg / 255) * MAX_HEIGHT * 1.2),
        MAX_HEIGHT
      );
      normalizedData.push(normalized);
    }

    for (let row = MAX_HEIGHT - 1; row >= 0; row--) {
      const line = normalizedData
        .map((height) => {
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
      const normalized = Math.min(
        Math.floor((avg / 255) * MAX_HEIGHT * 1.2),
        MAX_HEIGHT
      );
      normalizedData.push(normalized);
    }

    const waves: string[] = [];
    for (let row = 0; row < MAX_HEIGHT; row++) {
      const line = normalizedData
        .map((height) => {
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
      const normalized = Math.min(
        Math.floor((avg / 255) * MAX_HEIGHT * 1.2),
        MAX_HEIGHT
      );
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

          const prevHeight =
            index > 0
              ? (normalizedData[index - 1] / maxHeight) * MAX_HEIGHT
              : 0;
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

  return (
    <div className="music-player-overlay">
      <div
        ref={playerRef}
        className={`music-player theme-${playerTheme} ${
          glitchActive ? "glitch" : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${playerSize.width}px`,
          height: `${playerSize.height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="music-player-header">
          <span className="music-player-title">
            {currentTrack
              ? `${currentTrack.title} - ${currentTrack.artist}`
              : "No track loaded"}
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
            ref={terminalRef}
            onClick={() => {
              if (inputRef.current && !isTypingOutput) {
                inputRef.current.focus();
                setIsFocused(true);
              }
            }}
          >
            {commandHistory.map((entry, idx) => (
              <div key={idx} className="command-entry">
                <div className="command-line">
                  <span className="prompt">music@player:~$</span>{" "}
                  {entry.command}
                </div>
                {entry.output.map((line, lineIdx) => (
                  <div
                    key={lineIdx}
                    className={`output-line ${entry.isError ? "error" : ""}`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ))}

            <div className="command-input">
              <span className="prompt">music@player:~$</span>
              <div className="input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => {
                    setCurrentCommand(e.target.value);
                    setTimeout(updateCursorPosition, 0);
                    if (e.target.value.length > 0) {
                      soundGenerator.playType();
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  onKeyDown={handleKeyDown}
                  onSelect={() => {
                    setTimeout(updateCursorPosition, 0);
                  }}
                  onClick={() => {
                    setTimeout(updateCursorPosition, 0);
                  }}
                  onFocus={() => {
                    setIsFocused(true);
                    updateCursorPosition();
                  }}
                  onBlur={() => setIsFocused(false)}
                  className="input-field"
                  autoFocus
                  disabled={isTypingOutput}
                />
                <span
                  ref={measureRef}
                  className="text-measure"
                  aria-hidden="true"
                ></span>
                {!isTypingOutput && isFocused && (
                  <span
                    ref={cursorRef}
                    className={`input-cursor ${showCursor ? "visible" : ""}`}
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
