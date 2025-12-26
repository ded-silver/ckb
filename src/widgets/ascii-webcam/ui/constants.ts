export const MAX_RESOLUTION = { width: 200, height: 100 };
export const MIN_RESOLUTION = { width: 20, height: 10 };
export const DEFAULT_RESOLUTION = { width: 80, height: 40 };

export const THROTTLE_THRESHOLD = 5000;
export const FRAME_SKIP_RATIO = 2;

export const ASCII_STYLES = ["default", "dense", "simple", "blocks"] as const;
export type ASCIIStyle = (typeof ASCII_STYLES)[number];

export const WINDOW_MIN_SIZE = { width: 400, height: 300 };
export const WINDOW_MAX_SIZE = { width: 1400, height: 1000 };
export const WINDOW_DEFAULT_SIZE = { width: 900, height: 700 };

export const VALID_THEMES = [
  "2077",
  "dolbaeb",
  "matrix",
  "amber",
  "anime",
  "win95",
  "retro",
] as const;
export type ValidTheme = (typeof VALID_THEMES)[number];
