import { fileSystemCommands } from "@features/file-system/commands";
import { gamesCommands } from "@features/games/commands";
import { musicCommands } from "@features/music/commands";
import { networkCommands } from "@features/network/commands";
import { baseCommands } from "@features/system/commands";
import { utilityCommands } from "@features/utils/commands";

export const allCommands = {
  ...baseCommands,
  ...fileSystemCommands,
  ...networkCommands,
  ...utilityCommands,
  ...musicCommands,
  ...gamesCommands,
};
