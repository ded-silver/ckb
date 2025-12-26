import type { CommandContext } from "@entities/command/types";

import { executeCommand as executeCommandInternal } from "./commandExecutor";
import type { CommandResult, Theme, TerminalSize, UserInfo } from "../../types";

export const executeCommand = async (
  input: string,
  rawHistory?: string[],
  theme?: string,
  setThemeCallback?: (theme: Theme) => void,
  addNotificationCallback?: (message: string) => void,
  currentSize?: TerminalSize,
  setSizeCallback?: (size: TerminalSize) => void,
  currentUserInfo?: UserInfo,
  setUserInfoCallback?: (userInfo: UserInfo) => void
): Promise<CommandResult> => {
  const context: CommandContext = {
    rawHistory,
    theme,
    setThemeCallback,
    addNotificationCallback,
    currentSize,
    setSizeCallback,
    currentUserInfo,
    setUserInfoCallback,
  };

  return executeCommandInternal(input, context);
};
