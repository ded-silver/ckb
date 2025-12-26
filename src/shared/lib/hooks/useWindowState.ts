import { useState, useEffect, useCallback } from "react";

interface WindowState {
  size: { width: number; height: number };
  position: { x: number; y: number };
}

interface UseWindowStateOptions {
  storageKey: string;
  defaultSize: { width: number; height: number };
  defaultPosition?: { x: number; y: number };
  autoCenter?: boolean;
  onStateChange?: (state: WindowState) => void;
}

/**
 * Хук для управления состоянием окна (размер, позиция) с сохранением в localStorage
 */
export const useWindowState = ({
  storageKey,
  defaultSize,
  defaultPosition,
  autoCenter = true,
  onStateChange,
}: UseWindowStateOptions) => {
  const loadState = useCallback((): WindowState | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.size && parsed.position) {
          return {
            size: parsed.size,
            position: parsed.position,
          };
        }
      }
    } catch (error) {
      console.warn(`Failed to load window state from ${storageKey}:`, error);
    }
    return null;
  }, [storageKey]);

  const [size, setSize] = useState(() => {
    const saved = loadState();
    return saved?.size || defaultSize;
  });

  const [position, setPosition] = useState(() => {
    const saved = loadState();
    if (saved?.position) {
      return saved.position;
    }
    if (defaultPosition) {
      return defaultPosition;
    }
    if (autoCenter) {
      return {
        x: Math.max(0, (window.innerWidth - defaultSize.width) / 2),
        y: Math.max(0, (window.innerHeight - defaultSize.height) / 2),
      };
    }
    return { x: 0, y: 0 };
  });

  const saveState = useCallback(
    (newSize?: { width: number; height: number }, newPosition?: { x: number; y: number }) => {
      try {
        const stateToSave: WindowState = {
          size: newSize || size,
          position: newPosition || position,
        };
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        onStateChange?.(stateToSave);
      } catch (error) {
        console.warn(`Failed to save window state to ${storageKey}:`, error);
      }
    },
    [storageKey, size, position, onStateChange]
  );

  const updateSize = useCallback(
    (newSize: { width: number; height: number }) => {
      const boundedSize = {
        width: Math.min(newSize.width, window.innerWidth - position.x),
        height: Math.min(newSize.height, window.innerHeight - position.y),
      };

      setSize(boundedSize);
      saveState(boundedSize, undefined);
    },
    [position, saveState]
  );

  const updatePosition = useCallback(
    (newPosition: { x: number; y: number }) => {
      const boundedPosition = {
        x: Math.max(0, Math.min(newPosition.x, window.innerWidth - size.width)),
        y: Math.max(0, Math.min(newPosition.y, window.innerHeight - size.height)),
      };

      setPosition(boundedPosition);
      saveState(undefined, boundedPosition);
    },
    [size, saveState]
  );

  useEffect(() => {
    const saved = loadState();
    if (!saved && autoCenter) {
      const centerX = Math.max(0, (window.innerWidth - size.width) / 2);
      const centerY = Math.max(0, (window.innerHeight - size.height) / 2);
      const centeredPosition = { x: centerX, y: centerY };
      setPosition(centeredPosition);
      saveState(undefined, centeredPosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveState();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [size, position, saveState]);

  useEffect(() => {
    return () => {
      saveState();
    };
  }, [saveState]);

  return {
    size,
    position,
    setSize: updateSize,
    setPosition: updatePosition,
    saveState,
  };
};
