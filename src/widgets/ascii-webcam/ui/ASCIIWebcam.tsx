import { useState, useEffect, useRef, useCallback } from "react";

import type { CommandContext } from "@entities/command/types";
import { useWindowState, useDragResize, useTerminalWindow, useAppFocus } from "@shared/lib/hooks";
import { soundGenerator } from "@shared/lib/sounds";
import { playCommandSound } from "@shared/lib/sounds/soundHandler";

import {
  WINDOW_DEFAULT_SIZE,
  WINDOW_MAX_SIZE,
  WINDOW_MIN_SIZE,
  THROTTLE_THRESHOLD,
  FRAME_SKIP_RATIO,
} from "./constants";
import type { Theme, CommandResult, TerminalSize } from "../../../types";
import { handleWebcamCommand } from "../commands/webcamCommands";
import { ASCIIConverter } from "../model/asciiConverter";
import type { ASCIIStyle } from "../model/types";
import { loadWebcamSettings, saveWebcamSettings } from "../model/webcamSettings";
import "./ASCIIWebcam.css";

interface ASCIIWebcamProps {
  theme: Theme;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export const ASCIIWebcam = ({ theme, onClose, zIndex = 1000, onFocus }: ASCIIWebcamProps) => {
  const [webcamTheme, setWebcamTheme] = useState(theme);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asciiOutput, setAsciiOutput] = useState<string>("");

  const savedSettings = loadWebcamSettings();
  const [resolution, setResolution] = useState(savedSettings.resolution);
  const [style, setStyle] = useState<ASCIIStyle>(savedSettings.style);
  const [invert, setInvert] = useState(savedSettings.invert);
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const converterRef = useRef(new ASCIIConverter());
  const animationFrameRef = useRef<number>();

  const { size, position, setSize, setPosition } = useWindowState({
    storageKey: "ascii_webcam_window_state",
    defaultSize: WINDOW_DEFAULT_SIZE,
    autoCenter: true,
  });

  const { dragHandlers } = useDragResize({
    size,
    position,
    onSizeChange: setSize,
    onPositionChange: setPosition,
    minSize: WINDOW_MIN_SIZE,
    maxSize: WINDOW_MAX_SIZE,
    onFocus,
  });

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsStreaming(false);
    setAsciiOutput("");
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        streamRef.current = stream;

        stream.getTracks().forEach(track => {
          track.onended = () => {
            setError(
              "Camera feed terminated. The Wired has lost connection to your visual interface."
            );
            stopWebcam();
          };
        });

        const handleVideoError = () => {
          setError(
            "Video stream corruption detected. Reality interference may be affecting camera feed."
          );
          stopWebcam();
        };

        const handleVideoEnded = () => {
          setError("Video stream ended. Camera device disconnected from the Wired network.");
          stopWebcam();
        };

        video.addEventListener("error", handleVideoError);
        video.addEventListener("ended", handleVideoEnded);

        video.onloadedmetadata = () => {
          setIsStreaming(true);
        };
      }
    } catch (err) {
      let errorMessage =
        "Failed to access camera device. The Wired cannot establish visual connection.";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMessage =
            "Camera access denied. Please grant permission to monitor your visual environment. The Wired needs to see what you see.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMessage =
            "No camera device detected. Check your hardware connection. The Wired cannot find your visual interface.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          errorMessage =
            "Camera device is locked by another process. Another entity in the Wired is watching through this interface.";
        } else if (err.name === "OverconstrainedError") {
          errorMessage =
            "Camera device does not support requested parameters. Hardware limitations detected in visual interface.";
        } else {
          errorMessage = `Camera access error: ${err.message}. The Wired connection has been compromised.`;
        }
      }

      setError(errorMessage);
      setIsStreaming(false);
    }
  }, [stopWebcam]);

  useEffect(() => {
    saveWebcamSettings({ resolution, style, invert });
  }, [resolution, style, invert]);

  useEffect(() => {
    if (!isStreaming) {
      setFps(0);
      frameCountRef.current = 0;
      return;
    }

    const interval = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming || !videoRef.current) return;

    const video = videoRef.current;

    const shouldThrottle = resolution.width * resolution.height > THROTTLE_THRESHOLD;
    let frameSkip = 0;

    const render = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (shouldThrottle) {
          frameSkip++;
          if (frameSkip % FRAME_SKIP_RATIO !== 0) {
            animationFrameRef.current = requestAnimationFrame(render);
            return;
          }
        }

        const ascii = converterRef.current.frameToASCII(
          video,
          resolution.width,
          resolution.height,
          style,
          invert
        );

        setAsciiOutput(ascii);
        frameCountRef.current += 1;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, resolution, style, invert]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

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
        stopWebcam();
        onClose();
        return { output: [] };
      }

      const context: CommandContext = {
        theme: webcamTheme,
        setThemeCallback: newTheme => {
          setWebcamTheme(newTheme as Theme);
        },
        currentSize: size,
        setSizeCallback: (newSize: TerminalSize) => {
          setSize(newSize);
        },
      };

      const state = {
        isStreaming,
        fps,
        resolution,
        style,
        invert,
        size,
      };

      const callbacks = {
        startWebcam,
        stopWebcam,
        setResolution,
        setStyle,
        setInvert,
      };

      const result = await handleWebcamCommand(command, args, context, state, callbacks);

      playCommandSound(cmd, result?.isError || false);

      if (result.theme) {
        setWebcamTheme(result.theme);
      }

      return result;
    },
    [
      resolution,
      style,
      invert,
      size,
      setSize,
      webcamTheme,
      fps,
      isStreaming,
      startWebcam,
      stopWebcam,
      onClose,
    ]
  );

  const terminal = useTerminalWindow({
    onCommand: handleCommand,
    prompt: "webcam@terminal:~$",
    welcomeMessage: [
      "ASCII Webcam v1.0",
      'Type "start" to begin streaming',
      'Type "help" for commands',
      "",
    ],
    onThemeChange: (newTheme: string) => {
      setWebcamTheme(newTheme as Theme);
    },
  });

  useAppFocus({
    appName: "webcam",
    onClose: () => {
      stopWebcam();
      onClose();
    },
    onFocus,
  });

  // Синхронизация темы
  useEffect(() => {
    setWebcamTheme(theme);
  }, [theme]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains("ascii-webcam-header") ||
        target.closest(".ascii-webcam-header")
      ) {
        dragHandlers.onMouseDown(e);
      }
    },
    [dragHandlers]
  );

  return (
    <div
      className={`ascii-webcam theme-${webcamTheme} ${terminal.glitchActive ? "glitch" : ""}`}
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
      <div className="ascii-webcam-header">
        <span className="ascii-webcam-title">webcam.exe</span>
        <span className="ascii-webcam-status">
          {isStreaming ? `● Streaming | ${fps} FPS` : "○ Stopped"} | {resolution.width}x
          {resolution.height} | {style}
        </span>
      </div>

      <div className="ascii-webcam-content">
        {isStreaming ? (
          <div className="ascii-preview-container">
            <div className="ascii-preview">
              <pre className="ascii-output">{asciiOutput}</pre>
            </div>
          </div>
        ) : (
          <div className="ascii-preview-container">
            {error ? (
              <div className="error-message">
                <div className="output-line error">{error}</div>
              </div>
            ) : terminal.commandHistory.length === 0 ? (
              <div className="start-prompt">
                <div className="output-line">Webcam is not active</div>
                <div className="output-line">Type "start" to begin streaming</div>
                <div className="output-line"></div>
              </div>
            ) : null}
          </div>
        )}

        <div
          className="ascii-webcam-terminal"
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

      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
    </div>
  );
};
