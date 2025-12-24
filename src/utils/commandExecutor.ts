import { CommandResult } from "../types";
import { getCommandHandler, CommandContext } from "./commandRegistry";
import { trackCommandStats } from "./commandStats";
import {
  trackCommandForMissions,
  trackHackCommand,
  trackScanCommand,
  trackConnectCommand,
  trackFileReadCommand,
  getMissionNotification,
} from "./commandTracking";
import { checkSecretTriggers } from "./secrets";
import { getDestroyOutput } from "./destroy";
import {
  checkVirusTrigger,
  setVirusState,
  getVirusState,
  getVirusInfectionOutput,
  checkVirusTimeout,
  clearVirusState,
  detectVirusType,
} from "./virus";
import { soundGenerator } from "./sounds";
import { openMusicPlayer } from "./musicPlayerManager";
import { getFileSystem, getCurrentDirectory } from "./filesystem";

const FILE_READ_COMMANDS = ["cat", "head", "tail", "less"];

export const executeCommand = async (
  input: string,
  context: CommandContext
): Promise<CommandResult> => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return { output: [] };

  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  trackCommandStats(command);

  const virusState = getVirusState();
  if (virusState?.isInfected) {
    if (checkVirusTimeout()) {
      clearVirusState();
      return {
        output: getDestroyOutput(),
        shouldDestroy: true,
      };
    }
  }

  if (
    command === "sudo" &&
    args.length >= 3 &&
    args[0].toLowerCase() === "rm" &&
    args[1].toLowerCase() === "-rf" &&
    args[2] === "/"
  ) {
    return {
      output: getDestroyOutput(),
      shouldDestroy: true,
    };
  }

  // Обработка запуска приложений
  if (command === "open" && args.length > 0) {
    const fileName = args[0];

    // Проверяем различные варианты путей к player.exe
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

    // Проверяем, существует ли файл в файловой системе
    const currentDir = getCurrentDirectory();
    const fs = getFileSystem();

    // Разрешаем путь
    let resolvedPath = fileName;
    if (!fileName.startsWith("/")) {
      // Относительный путь
      const parts = fileName.split("/");
      resolvedPath = currentDir;
      for (const part of parts) {
        if (part === "..") {
          const pathParts = resolvedPath.split("/").filter((p) => p);
          if (pathParts.length > 1) {
            pathParts.pop();
            resolvedPath = "/" + pathParts.join("/");
          } else {
            resolvedPath = "/";
          }
        } else if (part === "." || part === "") {
          continue;
        } else {
          resolvedPath =
            resolvedPath === "/" ? `/${part}` : `${resolvedPath}/${part}`;
        }
      }
    }

    // Проверяем, это .exe файл?
    if (fs[resolvedPath] && fs[resolvedPath].type === "file") {
      if (resolvedPath.endsWith(".exe")) {
        if (resolvedPath.includes("player.exe")) {
          openMusicPlayer();
          return {
            output: ["Opening music player...", ""],
          };
        }
        return {
          output: [
            `Executing: ${fileName}`,
            "This executable is not yet implemented.",
            "",
          ],
        };
      }
    }

    // Можно добавить другие приложения позже
    return {
      output: [`Cannot open: ${fileName}`, "Unknown application", ""],
      isError: true,
    };
  }

  // Обработка запуска через ./
  if (command.startsWith("./")) {
    const filePath = command.substring(2); // Убираем ./

    // Проверяем, это player.exe? (различные варианты путей)
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

    // Проверяем, это virus_prototype?
    if (command.includes("virus_prototype")) {
      const virusType = detectVirusType(command, args);
      setVirusState(true, virusType);
      soundGenerator.playVirusInfection();
      return {
        output: getVirusInfectionOutput(virusType),
        isVirusActive: true,
      };
    }

    // Разрешаем путь относительно текущей директории
    const currentDir = getCurrentDirectory();
    const fs = getFileSystem();

    // Обрабатываем относительный путь
    const parts = filePath.split("/");
    let resolvedPath = currentDir;
    for (const part of parts) {
      if (part === "..") {
        const pathParts = resolvedPath.split("/").filter((p) => p);
        if (pathParts.length > 1) {
          pathParts.pop();
          resolvedPath = "/" + pathParts.join("/");
        } else {
          resolvedPath = "/";
        }
      } else if (part === "." || part === "") {
        continue;
      } else {
        resolvedPath =
          resolvedPath === "/" ? `/${part}` : `${resolvedPath}/${part}`;
      }
    }

    // Проверяем, существует ли файл
    if (fs[resolvedPath] && fs[resolvedPath].type === "file") {
      const file = fs[resolvedPath];
      if (filePath.endsWith(".exe") || resolvedPath.endsWith(".exe")) {
        // Это исполняемый файл
        if (
          filePath.includes("player.exe") ||
          resolvedPath.includes("player.exe")
        ) {
          openMusicPlayer();
          return {
            output: ["Opening music player...", ""],
          };
        }
        return {
          output: [
            `Executing: ${filePath}`,
            "This executable is not yet implemented.",
            "",
          ],
        };
      }
      // Если это не .exe, просто показываем содержимое
      return {
        output: file.content ? file.content.split("\n") : [""],
      };
    }

    return {
      output: [`File not found: ${filePath}`, ""],
      isError: true,
    };
  }

  if (checkVirusTrigger(command, args)) {
    const virusType = detectVirusType(command, args);
    setVirusState(true, virusType);

    if (virusType === "corruption") {
      const { ensureCorruptionDeactivationFile } = await import(
        "./commandTracking"
      );
      ensureCorruptionDeactivationFile();
    }

    soundGenerator.playVirusInfection();
    return {
      output: getVirusInfectionOutput(virusType),
      isVirusActive: true,
    };
  }

  let secretDiscovered = checkSecretTriggers(command, args);
  let missionCompleted: string | null = null;

  const handler = getCommandHandler(command);
  if (!handler) {
    return {
      output: [
        `Command not found: ${command}`,
        'Type "help" for available commands',
        "",
      ],
      isError: true,
    };
  }

  const result = await handler(args, context);
  const output = Array.isArray(result.output) ? result.output : [];

  if (!secretDiscovered) {
    secretDiscovered = checkSecretTriggers(command, args);
  }

  try {
    const contactsModule = await import("./contacts");
    if (contactsModule.shouldSendLainMessage()) {
      contactsModule.markLainMessageSent();
      contactsModule.createLainMessageFile();
    } else if (command !== "sessions" && command !== "disconnect") {
      if (contactsModule.isContactsRead()) {
        contactsModule.incrementCommandsAfterContacts();
      }
    }
  } catch (e) {}

  if (command === "whoami" && context.currentUserInfo) {
    missionCompleted = trackCommandForMissions(command);
  } else if (command === "hack") {
    missionCompleted = trackHackCommand(args);
  } else if (command === "scan") {
    missionCompleted = trackScanCommand();
  } else if (command === "connect") {
    missionCompleted = trackConnectCommand();
  } else if (FILE_READ_COMMANDS.includes(command) && args && args.length > 0) {
    const fileName = args.find((arg) => !arg.startsWith("-"));
    if (fileName && output && output.length > 0) {
      const hasError = output.some(
        (line) =>
          line.includes("not found") ||
          line.includes("Usage:") ||
          line.includes("is not a file")
      );

      if (!hasError) {
        const currentDir = getCurrentDirectory();
        missionCompleted = await trackFileReadCommand(fileName, currentDir);
      }
    }
  } else if (
    command !== "hack" &&
    command !== "scan" &&
    command !== "connect"
  ) {
    missionCompleted = trackCommandForMissions(command);
  }

  if (missionCompleted && context.addNotificationCallback) {
    const notification = getMissionNotification(missionCompleted);
    if (notification) {
      context.addNotificationCallback(notification);
    }
  }

  return {
    ...result,
    output,
  };
};
