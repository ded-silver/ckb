import { handleMailCommand } from "@features/email/commands";
import { gamesCommands } from "@features/games/commands";
import { missionsCommands } from "@features/missions/commands";
import { statusCommand } from "@features/missions/commands/status";
import { crackCommand } from "@features/network/commands/crack";
import { secretCommands } from "@features/secrets/commands";
import {
  handleHistoryCommand,
  handleNotifyCommand,
  handleThemeCommand,
  handleConfigCommand,
  handleSizeCommand,
  handleSuCommand,
  handleAntivirusCommand,
  handleCureCommand,
} from "@features/system/commands/special";

import { allCommands } from "../../../commands";
import type { CommandHandler } from "../types";

const specialHandlers: Record<string, CommandHandler> = {
  history: (args, context) => Promise.resolve(handleHistoryCommand(context.rawHistory, args)),
  notify: (args, context) =>
    Promise.resolve(handleNotifyCommand(args, context.addNotificationCallback)),
  theme: (args, context) =>
    Promise.resolve(handleThemeCommand(args, context.theme, context.setThemeCallback)),
  size: (args, context) =>
    Promise.resolve(handleSizeCommand(args, context.currentSize, context.setSizeCallback)),
  su: (args, context) =>
    Promise.resolve(handleSuCommand(args, context.currentUserInfo, context.setUserInfoCallback)),
  user: (args, context) =>
    Promise.resolve(handleSuCommand(args, context.currentUserInfo, context.setUserInfoCallback)),
  config: (_args, context) => Promise.resolve(handleConfigCommand(context.theme)),
  missions: args => {
    const result = missionsCommands.missions(args);
    return Promise.resolve({ output: Array.isArray(result) ? result : [] });
  },
  quest: args => {
    const result = missionsCommands.missions(args);
    return Promise.resolve({ output: Array.isArray(result) ? result : [] });
  },
  status: args => {
    const result = statusCommand(args);
    return Promise.resolve({ output: Array.isArray(result) ? result : [] });
  },
  crack: args => {
    const result = crackCommand(args);
    return Promise.resolve({ output: Array.isArray(result) ? result : [] });
  },
  antivirus: args => {
    return Promise.resolve(handleAntivirusCommand(args));
  },
  cure: () => {
    return Promise.resolve(handleCureCommand());
  },
  mail: args => {
    return handleMailCommand([...args]);
  },
  email: args => {
    return handleMailCommand([...args]);
  },
  games: async args => {
    if (!args || args.length === 0) {
      return {
        output: [
          "Usage: games <game> [options]",
          "",
          "Available games:",
          "  snake          - Snake game",
          "",
          "Examples:",
          "  games snake           - Start snake game",
          "  games snake --scores  - Show high scores",
          "",
        ],
      };
    }

    const game = args[0].toLowerCase();
    if (gamesCommands[`games ${game}`]) {
      const result = await gamesCommands[`games ${game}`](args.slice(1));
      return {
        output: Array.isArray(result) ? result : [],
      };
    }

    return {
      output: [`Unknown game: ${game}`, 'Type "games" for available games', ""],
      isError: true,
    };
  },
};

export const getCommandHandler = (command: string): CommandHandler | null => {
  const lowerCommand = command.toLowerCase();

  if (specialHandlers[lowerCommand]) {
    return specialHandlers[lowerCommand];
  }

  if (secretCommands[lowerCommand]) {
    return async args => {
      const result = await secretCommands[lowerCommand](args);
      return { output: Array.isArray(result) ? result : [] };
    };
  }

  if (allCommands[lowerCommand]) {
    return async args => {
      const result = allCommands[lowerCommand](args);
      const output = await Promise.resolve(result);
      return {
        output: Array.isArray(output) ? output : [],
        isAnimated: lowerCommand === "hack" || lowerCommand === "scan",
      };
    };
  }

  return null;
};

export const getFilteredCommandHandler = (
  allowedCommands: string[]
): ((command: string) => CommandHandler | null) => {
  return (command: string) => {
    const lowerCommand = command.toLowerCase();

    if (!allowedCommands.includes(lowerCommand)) {
      return null;
    }

    return getCommandHandler(lowerCommand);
  };
};
