import { getFileSystem, getCurrentDirectory } from "@entities/file/model";
import { openMusicPlayer } from "@features/music/lib/musicPlayerManager";
import { applicationManager } from "@shared/lib/applicationManager";
import { resolveRelativePath } from "@shared/lib/pathResolver";

import type { CommandResult } from "../../../types";

export const handleOpenCommand = (args: string[]): CommandResult | null => {
  if (args.length === 0) return null;

  const fileName = args[0];

  if (
    fileName === "player.exe" ||
    fileName === "./player.exe" ||
    fileName === "music/player.exe" ||
    fileName === "./music/player.exe" ||
    fileName.endsWith("/player.exe")
  ) {
    openMusicPlayer();
    return {
      output: ["Opening music player...", ""],
    };
  }

  if (
    fileName === "mail.exe" ||
    fileName === "./mail.exe" ||
    fileName === "mail/mail.exe" ||
    fileName === "./mail/mail.exe" ||
    fileName.endsWith("/mail.exe")
  ) {
    applicationManager.openApp("email");
    return {
      output: ["Opening mail client...", ""],
    };
  }

  if (
    fileName === "snake.exe" ||
    fileName === "./snake.exe" ||
    fileName === "games/snake/snake.exe" ||
    fileName === "./games/snake/snake.exe" ||
    fileName === "games/snake.exe" ||
    fileName === "./games/snake.exe" ||
    fileName.endsWith("/snake.exe")
  ) {
    applicationManager.openApp("snake");
    return {
      output: ["Opening Snake Game...", ""],
    };
  }

  const currentDir = getCurrentDirectory();
  const fs = getFileSystem();

  let resolvedPath = fileName;
  if (!fileName.startsWith("/")) {
    const parts = fileName.split("/");
    resolvedPath = currentDir;
    for (const part of parts) {
      if (part === "..") {
        const pathParts = resolvedPath.split("/").filter(p => p);
        if (pathParts.length > 1) {
          pathParts.pop();
          resolvedPath = "/" + pathParts.join("/");
        } else {
          resolvedPath = "/";
        }
      } else if (part === "." || part === "") {
        continue;
      } else {
        resolvedPath = resolvedPath === "/" ? `/${part}` : `${resolvedPath}/${part}`;
      }
    }
  }

  if (fs[resolvedPath] && fs[resolvedPath].type === "file") {
    if (resolvedPath.endsWith(".exe")) {
      if (resolvedPath.includes("player.exe")) {
        openMusicPlayer();
        return {
          output: ["Opening music player...", ""],
        };
      }
      if (resolvedPath.includes("mail.exe")) {
        applicationManager.openApp("email");
        return {
          output: ["Opening mail client...", ""],
        };
      }
      if (resolvedPath.includes("snake.exe")) {
        applicationManager.openApp("snake");
        return {
          output: ["Opening Snake Game...", ""],
        };
      }
      return {
        output: [`Executing: ${fileName}`, "This executable is not yet implemented.", ""],
      };
    }
  }

  return {
    output: [`Cannot open: ${fileName}`, "Unknown application", ""],
    isError: true,
  };
};

export const handleDotSlashCommand = (command: string): CommandResult | null => {
  if (!command.startsWith("./")) return null;

  const filePath = command.substring(2);

  if (
    filePath === "player.exe" ||
    filePath === "music/player.exe" ||
    filePath.endsWith("/player.exe")
  ) {
    openMusicPlayer();
    return {
      output: ["Opening music player...", ""],
    };
  }

  if (
    filePath === "mail.exe" ||
    filePath === "mail/mail.exe" ||
    filePath === "./mail/mail.exe" ||
    filePath.endsWith("/mail.exe")
  ) {
    applicationManager.openApp("email");
    return {
      output: ["Opening mail client...", ""],
    };
  }

  if (
    filePath === "snake.exe" ||
    filePath === "games/snake/snake.exe" ||
    filePath === "games/snake.exe" ||
    filePath.endsWith("/snake.exe")
  ) {
    applicationManager.openApp("snake");
    return {
      output: ["Opening Snake Game...", ""],
    };
  }

  const currentDir = getCurrentDirectory();
  const fs = getFileSystem();

  const resolvedPath = resolveRelativePath(filePath, currentDir);

  if (fs[resolvedPath] && fs[resolvedPath].type === "file") {
    const file = fs[resolvedPath];
    if (filePath.endsWith(".exe") || resolvedPath.endsWith(".exe")) {
      if (filePath.includes("player.exe") || resolvedPath.includes("player.exe")) {
        openMusicPlayer();
        return {
          output: ["Opening music player...", ""],
        };
      }
      if (filePath.includes("mail.exe") || resolvedPath.includes("mail.exe")) {
        applicationManager.openApp("email");
        return {
          output: ["Opening mail client...", ""],
        };
      }
      if (filePath.includes("snake.exe") || resolvedPath.includes("snake.exe")) {
        applicationManager.openApp("snake");
        return {
          output: ["Opening Snake Game...", ""],
        };
      }
      return {
        output: [`Executing: ${filePath}`, "This executable is not yet implemented.", ""],
      };
    }
    return {
      output: file.content ? file.content.split("\n") : [""],
    };
  }

  return {
    output: [`File not found: ${filePath}`, ""],
    isError: true,
  };
};
