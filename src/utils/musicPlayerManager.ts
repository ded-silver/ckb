// Утилита для управления состоянием открытия/закрытия плеера
// Используется для связи между командами терминала и App компонентом

type OpenPlayerCallback = () => void;

let openPlayerCallback: OpenPlayerCallback | null = null;

export const setOpenPlayerCallback = (callback: OpenPlayerCallback | null) => {
  openPlayerCallback = callback;
};

export const openMusicPlayer = (): void => {
  if (openPlayerCallback) {
    openPlayerCallback();
  }
};
