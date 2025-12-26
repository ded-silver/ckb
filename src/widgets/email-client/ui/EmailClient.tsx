import { useState, useEffect, useCallback } from "react";

import { handleMailCommand } from "@features/email/commands";
import { emailManager } from "@features/email/lib";
import { useWindowState, useDragResize, useTerminalWindow, useAppFocus } from "@shared/lib/hooks";
import { soundGenerator } from "@shared/lib/sounds";
import { playCommandSound } from "@shared/lib/sounds/soundHandler";

import type { CommandResult, Theme } from "../../../types";
import "./EmailClient.css";

interface EmailClientProps {
  theme: Theme;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
  setSizeCallback?: (size: { width: number; height: number }) => void;
  setThemeCallback?: (theme: Theme) => void;
}

export const EmailClient = ({
  theme,
  onClose,
  zIndex = 1000,
  onFocus,
  setSizeCallback,
  setThemeCallback,
}: EmailClientProps) => {
  const [emailTheme, setEmailTheme] = useState(theme);

  const { size, position, setSize, setPosition } = useWindowState({
    storageKey: "email_client_window_state",
    defaultSize: { width: 700, height: 500 },
    autoCenter: true,
  });

  const { dragHandlers } = useDragResize({
    size,
    position,
    onSizeChange: setSize,
    onPositionChange: setPosition,
    minSize: { width: 400, height: 300 },
    maxSize: { width: 1200, height: 900 },
    onFocus,
  });

  const handleCommand = useCallback(
    async (cmd: string): Promise<CommandResult> => {
      const trimmed = cmd.trim();
      if (!trimmed) {
        return { output: [] };
      }

      const parts = trimmed.split(/\s+/);
      const command = parts[0].toLowerCase();

      if (command === "close" || command === "exit") {
        onClose();
        return { output: [] };
      }

      if (command === "size") {
        if (parts.length === 2 && parts[1].toLowerCase() === "reset") {
          const defaultSize = { width: 700, height: 500 };
          setSize(defaultSize);
          if (setSizeCallback) {
            setSizeCallback(defaultSize);
          }
          playCommandSound(cmd, false);
          return {
            output: [`Window size reset to default: 700x500`, ""],
            isError: false,
          };
        }

        if (parts.length < 3) {
          playCommandSound(cmd, false);
          return {
            output: [
              `Current window size: ${size.width}x${size.height}`,
              "",
              "Usage: size <width> <height>",
              "       size reset - Reset to default (700x500)",
              "",
              "Examples:",
              "  size 800 600  - Set to 800x600",
              "  size 900 650  - Set to 900x650",
              "  size reset    - Reset to default",
              "",
              "Note: Minimum size is 400x300, maximum is 1200x900",
              "",
            ],
            isError: false,
          };
        }

        const width = parseInt(parts[1]);
        const height = parseInt(parts[2]);

        if (isNaN(width) || isNaN(height)) {
          playCommandSound(cmd, true);
          return {
            output: ["Error: Width and height must be numbers", "Usage: size <width> <height>", ""],
            isError: true,
          };
        }

        const minWidth = 400;
        const minHeight = 300;
        const maxWidth = 1200;
        const maxHeight = 900;

        if (width < minWidth || height < minHeight || width > maxWidth || height > maxHeight) {
          playCommandSound(cmd, true);
          return {
            output: [
              `Error: Size must be between ${minWidth}x${minHeight} and ${maxWidth}x${maxHeight}`,
              "",
            ],
            isError: true,
          };
        }

        const newSize = { width, height };
        setSize(newSize);
        if (setSizeCallback) {
          setSizeCallback(newSize);
        }

        playCommandSound(cmd, false);
        return {
          output: [`Window size changed to: ${width}x${height}`, ""],
          isError: false,
        };
      }

      if (command === "theme") {
        const validThemes = ["2077", "dolbaeb", "matrix", "amber", "anime", "win95", "retro"];

        if (parts.length < 2) {
          playCommandSound(cmd, false);
          return {
            output: [
              `Current theme: ${emailTheme}`,
              "Available themes:",
              "  2077     - Cyberpunk 2077 (red neon)",
              "  dolbaeb  - White theme",
              "  matrix   - Matrix (green)",
              "  amber    - Amber/orange theme",
              "  anime    - Kawaii pink anime theme",
              "  win95    - Windows 95 classic theme",
              "  retro    - Retro 80s synthwave theme",
              "Usage: theme <2077|dolbaeb|matrix|amber|anime|win95|retro>",
              "",
            ],
            isError: false,
          };
        }

        const newTheme = parts[1].toLowerCase();
        if (!validThemes.includes(newTheme)) {
          playCommandSound(cmd, true);
          return {
            output: [`Invalid theme: ${newTheme}`, `Available: ${validThemes.join(", ")}`, ""],
            isError: true,
          };
        }

        setEmailTheme(newTheme as Theme);
        if (setThemeCallback) {
          setThemeCallback(newTheme as Theme);
        }

        playCommandSound(cmd, false);
        return {
          output: [`Theme changed to: ${newTheme}`, ""],
          isError: false,
          theme: newTheme as Theme,
        };
      }

      const result = await handleMailCommand(parts);
      playCommandSound(cmd, result.isError || false);

      if (result.theme) {
        setEmailTheme(result.theme);
      }

      return result;
    },
    [size, setSize, emailTheme, setEmailTheme, onClose, setSizeCallback, setThemeCallback]
  );

  const terminal = useTerminalWindow({
    onCommand: handleCommand,
    prompt: "mail@client:~$",
    welcomeMessage: ["Welcome to Mail Client v1.0", "Type 'help' for available commands"],
    onThemeChange: (newTheme: string) => {
      setEmailTheme(newTheme as Theme);
      if (setThemeCallback) {
        setThemeCallback(newTheme as Theme);
      }
    },
  });

  useAppFocus({
    appName: "email",
    onClose,
    onFocus,
  });

  useEffect(() => {
    setEmailTheme(theme);
  }, [theme]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains("email-client-header") ||
        target.closest(".email-client-header")
      ) {
        dragHandlers.onMouseDown(e);
      }
    },
    [dragHandlers]
  );

  const stats = emailManager.getStats();

  return (
    <div
      className={`email-client theme-${emailTheme} ${terminal.glitchActive ? "glitch" : ""}`}
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
      <div className="email-client-header">
        <span className="email-client-title">mail.exe</span>
        <span className="email-client-status">
          Unread: {stats.unread} | Total: {stats.total}
        </span>
      </div>

      <div
        className="email-client-terminal"
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
  );
};
