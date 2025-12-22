import { CommandResult, Theme, TerminalSize, UserInfo } from "../types";
import { executeCommand as executeCommandInternal } from "./commandExecutor";
import { CommandContext } from "./commandRegistry";

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

export { getCurrentDirectory } from "./filesystem";
