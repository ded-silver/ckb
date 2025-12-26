import { DEFAULT_THEME, THEMES } from "@shared/config";
import { storageManager } from "@shared/lib/storage";

import type { Theme } from "../types";

const THEME_STORAGE_KEY = "cyberpunk_theme";

export const loadTheme = (): Theme => {
  const savedTheme = storageManager.get<string>(THEME_STORAGE_KEY);
  if (savedTheme && THEMES.includes(savedTheme as Theme)) {
    return savedTheme as Theme;
  }
  return DEFAULT_THEME;
};

export const saveTheme = (theme: Theme): void => {
  storageManager.set(THEME_STORAGE_KEY, theme);
};
