export type Theme =
  | "2077"
  | "dolbaeb"
  | "matrix"
  | "amber"
  | "anime"
  | "win95"
  | "retro";

export interface CommandEntry {
  command: string;
  output: string[];
  isError?: boolean;
  isAnimated?: boolean;
  progress?: number;
}

export interface CommandResult {
  output: string[];
  isError?: boolean;
  isAnimated?: boolean;
  progress?: number;
  theme?: Theme;
  notification?: string;
  shouldDestroy?: boolean;
}

export type CommandFunction = (args?: string[]) => string[] | Promise<string[]>;

export interface TerminalSize {
  width: number;
  height: number;
}

export interface UserInfo {
  username: string;
  hostname: string;
}

export interface TerminalProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  size: TerminalSize;
  onSizeChange: (size: TerminalSize) => void;
  userInfo: UserInfo;
  onUserInfoChange: (userInfo: UserInfo) => void;
}

export interface FileSystemNode {
  type: "file" | "dir";
  content?: string;
  contents?: Record<string, FileSystemNode>;
}

export interface OutputLine {
  text: string;
  color?: "success" | "error" | "warning" | "info" | "default";
}

export interface MissionRequirement {
  type: "command" | "file_read" | "hack" | "scan" | "connect";
  target: string;
  count?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  hint: string;
  requirements: MissionRequirement[];
  reward: {
    unlockFile?: string;
    unlockCommand?: string;
    unlockSecret?: string;
  };
  nextMission?: string;
}

export interface Secret {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: "command" | "file_read" | "mission_complete" | "combination";
    condition: string | string[];
  };
}

export interface ProgressStats {
  missionsCompleted: number;
  secretsFound: number;
  serversHacked: number;
  filesRead: number;
}
