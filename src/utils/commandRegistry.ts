import { CommandResult, Theme, TerminalSize, UserInfo } from "../types";
import { allCommands } from "../commands";
import { secretCommands } from "../commands/secrets";
import { missionsCommands } from "../commands/missions";
import { statusCommand } from "../commands/status";
import { crackCommand } from "../commands/crack";
import {
  handleHistoryCommand,
  handleNotifyCommand,
  handleThemeCommand,
  handleConfigCommand,
  handleSizeCommand,
  handleSuCommand,
  handleAntivirusCommand,
  handleCureCommand,
} from "../commands/special";

export type CommandHandler = (
  args: string[],
  context: CommandContext
) => CommandResult | Promise<CommandResult>;

export interface CommandContext {
  rawHistory?: string[];
  theme?: string;
  setThemeCallback?: (theme: Theme) => void;
  addNotificationCallback?: (message: string) => void;
  currentSize?: TerminalSize;
  setSizeCallback?: (size: TerminalSize) => void;
  currentUserInfo?: UserInfo;
  setUserInfoCallback?: (userInfo: UserInfo) => void;
}

const specialHandlers: Record<string, CommandHandler> = {
  history: (args, context) =>
    Promise.resolve(handleHistoryCommand(context.rawHistory, args)),
  notify: (args, context) =>
    Promise.resolve(handleNotifyCommand(args, context.addNotificationCallback)),
  theme: (args, context) =>
    Promise.resolve(
      handleThemeCommand(args, context.theme, context.setThemeCallback)
    ),
  size: (args, context) =>
    Promise.resolve(
      handleSizeCommand(args, context.currentSize, context.setSizeCallback)
    ),
  su: (args, context) =>
    Promise.resolve(
      handleSuCommand(
        args,
        context.currentUserInfo,
        context.setUserInfoCallback
      )
    ),
  user: (args, context) =>
    Promise.resolve(
      handleSuCommand(
        args,
        context.currentUserInfo,
        context.setUserInfoCallback
      )
    ),
  config: (_args, context) =>
    Promise.resolve(handleConfigCommand(context.theme)),
  missions: (args) => {
    const result = missionsCommands.missions(args);
    return Promise.resolve({ output: Array.isArray(result) ? result : [] });
  },
  quest: (args) => {
    const result = missionsCommands.missions(args);
    return Promise.resolve({ output: Array.isArray(result) ? result : [] });
  },
  status: (args) => {
    const result = statusCommand(args);
    return Promise.resolve({ output: Array.isArray(result) ? result : [] });
  },
  crack: (args) => {
    const result = crackCommand(args);
    return Promise.resolve({ output: Array.isArray(result) ? result : [] });
  },
  antivirus: (args) => {
    return Promise.resolve(handleAntivirusCommand(args));
  },
  cure: () => {
    return Promise.resolve(handleCureCommand());
  },
};

export const getCommandHandler = (command: string): CommandHandler | null => {
  const lowerCommand = command.toLowerCase();

  if (specialHandlers[lowerCommand]) {
    return specialHandlers[lowerCommand];
  }

  if (secretCommands[lowerCommand]) {
    return (args) => {
      const result = secretCommands[lowerCommand](args);
      return Promise.resolve({ output: result });
    };
  }

  if (allCommands[lowerCommand]) {
    return async (args) => {
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

export const getAllCommands = () => allCommands;
