import { applicationManager } from "@shared/lib/applicationManager";

type OpenPlayerCallback = () => void;

let openPlayerCallback: OpenPlayerCallback | null = null;

export const setOpenPlayerCallback = (callback: OpenPlayerCallback | null) => {
  openPlayerCallback = callback;
};

export const openMusicPlayer = (): void => {
  applicationManager.openApp("music");

  if (openPlayerCallback) {
    openPlayerCallback();
  }
};
