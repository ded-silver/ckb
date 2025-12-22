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
import { getCurrentDirectory } from "./filesystem";
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

  if (command.startsWith("./") && command.includes("virus_prototype")) {
    const virusType = detectVirusType(command, args);
    setVirusState(true, virusType);
    soundGenerator.playVirusInfection();
    return {
      output: getVirusInfectionOutput(virusType),
      isVirusActive: true,
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
