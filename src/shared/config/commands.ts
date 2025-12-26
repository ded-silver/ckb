export const ASYNC_COMMANDS = ["ping", "weather"] as const;

export const SUCCESS_COMMANDS = ["mkdir", "rm", "cd"] as const;

export const HACK_COMMANDS = ["hack"] as const;

export const SCAN_COMMANDS = ["scan"] as const;

export const FILE_READ_COMMANDS = ["cat", "head", "tail", "less"] as const;

export const DESTROY_COMMAND = "sudo rm -rf /";

export type AsyncCommand = (typeof ASYNC_COMMANDS)[number];
export type SuccessCommand = (typeof SUCCESS_COMMANDS)[number];
export type HackCommand = (typeof HACK_COMMANDS)[number];

export const AVAILABLE_COMMANDS = [
  "help",
  "clear",
  "whoami",
  "date",
  "system",
  "matrix",
  "hack",
  "scan",
  "connect",
  "ls",
  "cat",
  "echo",
  "about",
  "exit",
  "history",
  "pwd",
  "cd",
  "mkdir",
  "rm",
  "ping",
  "crypto",
  "weather",
  "quote",
  "konami",
  "sudo",
  "hacktheworld",
  "easteregg",
] as const;

// Специальные команды, не входящие в AVAILABLE_COMMANDS
export const SPECIAL_COMMANDS = [
  "notify",
  "theme",
  "size",
  "su",
  "user",
  "config",
  "missions",
  "quest",
  "status",
  "crack",
  "antivirus",
  "cure",
] as const;

// Команды музыкального плеера
export const MUSIC_PLAYER_COMMANDS = [
  "play",
  "stop",
  "pause",
  "next",
  "prev",
  "list",
  "info",
  "volume",
  "shuffle",
  "repeat",
  "search",
  "seek",
  "reload",
  "stats",
  "jump",
  "visualization",
  "close",
] as const;

// Объединенный тип всех известных команд
export type CommandName =
  | (typeof AVAILABLE_COMMANDS)[number]
  | (typeof SPECIAL_COMMANDS)[number]
  | (typeof MUSIC_PLAYER_COMMANDS)[number]
  | (typeof FILE_READ_COMMANDS)[number];
