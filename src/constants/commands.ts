export const ASYNC_COMMANDS = ["ping", "weather"] as const;

export const SUCCESS_COMMANDS = ["mkdir", "rm", "cd"] as const;

export const HACK_COMMANDS = ["hack"] as const;

export const SCAN_COMMANDS = ["scan"] as const;

export const DESTROY_COMMAND = "sudo rm -rf /";

export type AsyncCommand = (typeof ASYNC_COMMANDS)[number];
export type SuccessCommand = (typeof SUCCESS_COMMANDS)[number];
export type HackCommand = (typeof HACK_COMMANDS)[number];
