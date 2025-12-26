import type { Resolution } from "../model/types";

/**
 * Вычисляет оптимальное разрешение в формате ASCII на основе ширины контейнера
 */
export const calculateOptimalResolution = (
  containerWidth: number,
  aspectRatio: number = 4 / 3
): Resolution => {
  let optimalWidth = Math.floor((containerWidth - 64) / 8);
  let optimalHeight = Math.floor(optimalWidth / aspectRatio);

  optimalWidth = Math.min(Math.max(optimalWidth, 40), 120);
  optimalHeight = Math.min(Math.max(optimalHeight, 20), 60);

  return { width: optimalWidth, height: optimalHeight };
};
