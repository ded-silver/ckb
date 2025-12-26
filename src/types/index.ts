import type { CommandName } from "@shared/config/commands";

export type Theme = "2077" | "dolbaeb" | "matrix" | "amber" | "anime" | "win95" | "retro";

export interface CommandEntry {
  command: CommandName | string;
  output: readonly string[];
  isError?: boolean;
  isAnimated?: boolean;
  progress?: number;
}

export interface CommandResult {
  output: readonly string[];
  isError?: boolean;
  isAnimated?: boolean;
  progress?: number;
  theme?: Theme;
  notification?: string;
  shouldDestroy?: boolean;
  isVirusActive?: boolean;
}

export type CommandFunction = (
  args?: readonly string[]
) => readonly string[] | Promise<readonly string[]>;

export interface TerminalSize {
  readonly width: number;
  readonly height: number;
}

export interface UserInfo {
  readonly username: string;
  readonly hostname: string;
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
  requirements: readonly MissionRequirement[];
  readonly reward: {
    readonly unlockFile?: string;
    readonly unlockCommand?: string;
    readonly unlockSecret?: string;
  };
  nextMission?: string;
}

export interface Secret {
  id: string;
  name: string;
  description: string;
  readonly trigger: {
    readonly type: "command" | "file_read" | "mission_complete" | "combination";
    readonly condition: string | readonly string[];
  };
}

export interface ProgressStats {
  missionsCompleted: number;
  secretsFound: number;
  serversHacked: number;
  filesRead: number;
}

export interface MusicTrack {
  filename: string;
  title: string;
  artist: string;
  duration: number;
  format: "ogg" | "wav" | "mp3";
}

export interface MusicMetadata {
  tracks: readonly MusicTrack[];
}

export type MusicPlayerStatus = "stopped" | "playing" | "paused";
export type RepeatMode = "off" | "one" | "all";
export type ShuffleMode = boolean;
export type VisualizationMode = "bars" | "waves" | "spectrum";

export interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  currentIndex: number;
  playlist: readonly MusicTrack[];
  status: MusicPlayerStatus;
  volume: number;
  position: number;
  duration: number;
  shuffle: ShuffleMode;
  repeat: RepeatMode;
}

export interface MusicPlayerSettings {
  volume: number;
  lastTrack?: string;
  lastPosition?: number;
  shuffle: ShuffleMode;
  repeat: RepeatMode;
  visualizationMode: VisualizationMode;
  readonly windowSize: { readonly width: number; readonly height: number };
  readonly windowPosition: { readonly x: number; readonly y: number };
}

export interface MusicPlayerProps {
  theme: Theme;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}
