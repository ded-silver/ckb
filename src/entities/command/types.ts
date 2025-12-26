import type { CommandResult, Theme, TerminalSize, UserInfo } from "../../types";

export type CommandHandler = (
  args: readonly string[],
  context: CommandContext
) => CommandResult | Promise<CommandResult>;

export interface CommandContext {
  rawHistory?: readonly string[];
  theme?: string;
  setThemeCallback?: (theme: Theme) => void;
  addNotificationCallback?: (message: string) => void;
  currentSize?: TerminalSize;
  setSizeCallback?: (size: TerminalSize) => void;
  currentUserInfo?: UserInfo;
  setUserInfoCallback?: (userInfo: UserInfo) => void;
}
