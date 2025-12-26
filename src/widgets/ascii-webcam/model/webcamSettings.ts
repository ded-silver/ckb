import type { ASCIIStyle, Resolution } from "./types";

export interface WebcamSettings {
  resolution: Resolution;
  style: ASCIIStyle;
  invert: boolean;
}

const STORAGE_KEY = "ascii_webcam_settings";

const defaultSettings: WebcamSettings = {
  resolution: { width: 80, height: 40 },
  style: "default",
  invert: false,
};

export const loadWebcamSettings = (): WebcamSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        resolution: parsed.resolution || defaultSettings.resolution,
        style: (parsed.style || defaultSettings.style) as ASCIIStyle,
        invert: parsed.invert ?? defaultSettings.invert,
      };
    }
  } catch (e) {
    console.warn("Failed to load webcam settings:", e);
  }
  return { ...defaultSettings };
};

export const saveWebcamSettings = (settings: Partial<WebcamSettings>): void => {
  try {
    const current = loadWebcamSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save webcam settings:", e);
  }
};
