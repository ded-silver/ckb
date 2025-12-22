import { Theme, CommandResult, TerminalSize, UserInfo } from "../types";
import { THEMES } from "../constants";
import { soundGenerator } from "../utils/sounds";

export const handleHistoryCommand = (
  rawHistory?: string[],
  args?: string[]
): CommandResult => {
  if (!rawHistory || rawHistory.length === 0) {
    return { output: ["No command history", ""] };
  }

  // Поиск в истории
  if (args && args.length > 0) {
    const searchTerm = args.join(" ").toLowerCase();
    const filtered = rawHistory.filter((cmd) =>
      cmd.toLowerCase().includes(searchTerm)
    );
    if (filtered.length === 0) {
      return {
        output: [`No commands found matching: ${searchTerm}`, ""],
      };
    }
    return {
      output: [
        `Command History (filtered by: "${searchTerm}"):`,
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        ...filtered.map((cmd, idx) => `  ${idx + 1}. ${cmd}`),
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `Found: ${filtered.length} command(s)`,
        "",
      ],
    };
  }

  const historyOutput = [
    "Command History:",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ...rawHistory.map((cmd, idx) => `  ${idx + 1}. ${cmd}`),
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `Total: ${rawHistory.length} commands`,
    "",
    "Usage: history [search term] - Filter history",
    "",
  ];
  return { output: historyOutput };
};

export const handleNotifyCommand = (
  args: string[],
  addNotificationCallback?: (message: string) => void
): CommandResult => {
  if (!args || args.length === 0) {
    return { output: ["Usage: notify <message>", ""], isError: true };
  }
  const message = args.join(" ");
  if (addNotificationCallback) {
    addNotificationCallback(message);
  }
  return {
    output: [`Notification sent: ${message}`, ""],
  };
};

export const handleThemeCommand = (
  args: string[],
  currentTheme?: string,
  setThemeCallback?: (theme: Theme) => void
): CommandResult => {
  if (!args || args.length === 0) {
    return {
      output: [
        "Current theme: " + (currentTheme || "2077"),
        "Available themes:",
        "  2077     - Cyberpunk 2077 (red neon)",
        "  dolbaeb  - White theme",
        "  matrix   - Matrix (green)",
        "  amber    - Amber/orange theme",
        "  anime    - Kawaii pink anime theme (≧∇≦)",
        "  win95    - Windows 95 classic theme",
        "  retro    - Retro 80s synthwave theme (neon pink/cyan)",
        "Usage: theme <2077|dolbaeb|matrix|amber|anime|win95|retro>",
        "",
      ],
    };
  }
  const newTheme = args[0].toLowerCase();
  if (THEMES.includes(newTheme as Theme)) {
    if (setThemeCallback) {
      setThemeCallback(newTheme as Theme);
    }
    return {
      output: [`Theme changed to: ${newTheme}`, ""],
      theme: newTheme as Theme,
    };
  }
  return {
    output: [
      `Invalid theme: ${newTheme}`,
      `Available: ${THEMES.join(", ")}`,
      "",
    ],
    isError: true,
  };
};

export const handleSizeCommand = (
  args: string[],
  currentSize?: TerminalSize,
  setSizeCallback?: (size: TerminalSize) => void
): CommandResult => {
  if (!args || args.length === 0) {
    return {
      output: [
        `Current terminal size: ${currentSize?.width || 800}x${
          currentSize?.height || 600
        }`,
        "",
        "Usage: size <width> <height>",
        "       size reset - Reset to default (800x600)",
        "",
        "Examples:",
        "  size 1000 700  - Set to 1000x700",
        "  size 600 400   - Set to 600x400",
        "  size reset     - Reset to default",
        "",
        "Note: Minimum size is 400x300, maximum is 2000x1500",
        "",
      ],
    };
  }

  if (args[0].toLowerCase() === "reset") {
    const defaultSize: TerminalSize = { width: 800, height: 600 };
    if (setSizeCallback) {
      setSizeCallback(defaultSize);
    }
    return {
      output: [`Terminal size reset to default: 800x600`, ""],
    };
  }

  if (args.length < 2) {
    return {
      output: ["Usage: size <width> <height>", "Example: size 1000 700", ""],
      isError: true,
    };
  }

  const width = parseInt(args[0]);
  const height = parseInt(args[1]);

  if (isNaN(width) || isNaN(height)) {
    return {
      output: [
        "Error: Width and height must be numbers",
        "Usage: size <width> <height>",
        "",
      ],
      isError: true,
    };
  }

  const minWidth = 400;
  const minHeight = 300;
  const maxWidth = 2000;
  const maxHeight = 1500;

  if (width < minWidth || height < minHeight) {
    return {
      output: [`Error: Minimum size is ${minWidth}x${minHeight}`, ""],
      isError: true,
    };
  }

  if (width > maxWidth || height > maxHeight) {
    return {
      output: [`Error: Maximum size is ${maxWidth}x${maxHeight}`, ""],
      isError: true,
    };
  }

  const newSize: TerminalSize = { width, height };
  if (setSizeCallback) {
    setSizeCallback(newSize);
  }
  return {
    output: [`Terminal size changed to: ${width}x${height}`, ""],
  };
};

export const handleSuCommand = (
  args: string[],
  currentUserInfo?: UserInfo,
  setUserInfoCallback?: (userInfo: UserInfo) => void
): CommandResult => {
  if (!args || args.length === 0) {
    return {
      output: [
        `Current user: ${currentUserInfo?.username || "user"}@${
          currentUserInfo?.hostname || "cyberpunk"
        }`,
        "",
        "Usage: su <username> [hostname]",
        "       su reset - Reset to default (user@cyberpunk)",
        "",
        "Examples:",
        "  su root              - Change to root@cyberpunk",
        "  su admin             - Change to admin@cyberpunk",
        "  su hacker matrix     - Change to hacker@matrix",
        "  su neo matrix        - Change to neo@matrix",
        "  su reset             - Reset to user@cyberpunk",
        "",
      ],
    };
  }

  if (args[0].toLowerCase() === "reset") {
    const defaultUserInfo: UserInfo = {
      username: "user",
      hostname: "cyberpunk",
    };
    if (setUserInfoCallback) {
      setUserInfoCallback(defaultUserInfo);
    }
    return {
      output: [`User reset to default: user@cyberpunk`, ""],
    };
  }

  const newUsername = args[0];
  const newHostname = args[1] || currentUserInfo?.hostname || "cyberpunk";

  // Валидация имени пользователя и хоста
  if (newUsername.length < 1 || newUsername.length > 20) {
    return {
      output: ["Error: Username must be between 1 and 20 characters", ""],
      isError: true,
    };
  }

  if (newHostname.length < 1 || newHostname.length > 30) {
    return {
      output: ["Error: Hostname must be between 1 and 30 characters", ""],
      isError: true,
    };
  }

  // Проверка на допустимые символы
  if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
    return {
      output: [
        "Error: Username can only contain letters, numbers, underscores, and hyphens",
        "",
      ],
      isError: true,
    };
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(newHostname)) {
    return {
      output: [
        "Error: Hostname can only contain letters, numbers, dots, underscores, and hyphens",
        "",
      ],
      isError: true,
    };
  }

  const newUserInfo: UserInfo = {
    username: newUsername,
    hostname: newHostname,
  };
  if (setUserInfoCallback) {
    setUserInfoCallback(newUserInfo);
  }
  return {
    output: [`Switched to: ${newUsername}@${newHostname}`, ""],
  };
};

export const handleConfigCommand = (
  currentTheme?: string,
  currentSize?: TerminalSize,
  currentUserInfo?: UserInfo
): CommandResult => {
  return {
    output: [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "TERMINAL CONFIGURATION",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `Theme: ${currentTheme || "2077"}`,
      `Size: ${currentSize?.width || 800}x${currentSize?.height || 600}`,
      `User: ${currentUserInfo?.username || "user"}@${
        currentUserInfo?.hostname || "cyberpunk"
      }`,
      `Sounds: ${soundGenerator.isEnabled() ? "enabled" : "disabled"}`,
      `Matrix Rain: enabled`,
      `CRT Effects: enabled`,
      "",
      "To change settings:",
      "  theme <2077|dolbaeb|matrix|amber|anime|win95|retro> - Change color theme",
      "  size <width> <height> - Change terminal size",
      "  size reset - Reset size to default",
      "  su <username> [hostname] - Change user",
      "  su reset - Reset user to default",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ],
  };
};
