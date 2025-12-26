import type { CommandContext } from "@entities/command/types";
import { getCurrentDirectory } from "@entities/file/model";
import { FILE_READ_COMMANDS } from "@shared/config/commands";
import {
  trackCommandForMissions,
  trackHackCommand,
  trackScanCommand,
  trackConnectCommand,
  trackFileReadCommand,
  getMissionNotification,
} from "@shared/lib/commandTracking";

export const trackMissionProgress = async (
  command: string,
  args: string[],
  output: string[],
  context: CommandContext
): Promise<void> => {
  let missionCompleted: string | null = null;

  if (command === "whoami" && context.currentUserInfo) {
    missionCompleted = trackCommandForMissions(command);
  } else if (command === "hack") {
    missionCompleted = trackHackCommand(args);
  } else if (command === "scan") {
    missionCompleted = trackScanCommand();
  } else if (command === "connect") {
    missionCompleted = trackConnectCommand();
  } else if (
    (FILE_READ_COMMANDS as readonly string[]).includes(command) &&
    args &&
    args.length > 0
  ) {
    const fileName = args.find(arg => !arg.startsWith("-"));
    if (fileName && output && output.length > 0) {
      const hasError = output.some(
        line =>
          line.includes("not found") || line.includes("Usage:") || line.includes("is not a file")
      );

      if (!hasError) {
        const currentDir = getCurrentDirectory();
        missionCompleted = await trackFileReadCommand(fileName, currentDir);
      }
    }
  } else if (command !== "hack" && command !== "scan" && command !== "connect") {
    missionCompleted = trackCommandForMissions(command);
  }

  if (missionCompleted && context.addNotificationCallback) {
    const notification = getMissionNotification(missionCompleted);
    if (notification) {
      context.addNotificationCallback(notification);
    }
  }
};
