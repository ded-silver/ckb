import { useEffect } from "react";

import type { AppName } from "../applicationManager";
import { inputManager } from "../inputManager";

interface UseAppFocusOptions {
  appName: AppName;
  onClose: () => void;
  onFocus?: () => void;
  enabled?: boolean;
}

/**
 * Хук для управления фокусом приложения и интеграции с InputManager
 * Обрабатывает ESC для закрытия и управление фокусом
 */
export const useAppFocus = ({ appName, onClose, onFocus, enabled = true }: UseAppFocusOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent): boolean => {
      if (e.key === "Escape") {
        onClose();
        return true; // Event handled
      }
      return false;
    };

    inputManager.captureKeys(appName, handleKeyDown);
    inputManager.setFocus(appName);

    return () => {
      inputManager.releaseKeys(appName);
      inputManager.releaseFocus();
    };
  }, [appName, onClose, enabled]);

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
    inputManager.setFocus(appName);
  };

  return {
    handleFocus,
  };
};
