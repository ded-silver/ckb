import { useState, useEffect, useCallback } from "react";

interface UseDragResizeOptions {
  size: { width: number; height: number };
  position: { x: number; y: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  onSizeChange?: (size: { width: number; height: number }) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  enabled?: { drag?: boolean; resize?: boolean };
  onFocus?: () => void;
}

/**
 * Хук для управления drag & resize логикой окна
 */
export const useDragResize = ({
  size,
  position,
  minSize,
  maxSize,
  onSizeChange,
  onPositionChange,
  enabled = { drag: true, resize: true },
  onFocus,
}: UseDragResizeOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!isDragging || !enabled.drag) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.offsetX;
      const newY = e.clientY - dragStart.offsetY;

      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - size.height));

      const newPosition = { x: boundedX, y: boundedY };
      onPositionChange?.(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, size, enabled.drag, onPositionChange]);

  useEffect(() => {
    if (!isResizing || !enabled.resize) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width + deltaX;
      let newHeight = resizeStart.height + deltaY;

      if (minSize) {
        newWidth = Math.max(minSize.width, newWidth);
        newHeight = Math.max(minSize.height, newHeight);
      }

      if (maxSize) {
        newWidth = Math.min(maxSize.width, newWidth);
        newHeight = Math.min(maxSize.height, newHeight);
      }

      newWidth = Math.min(newWidth, window.innerWidth - position.x);
      newHeight = Math.min(newHeight, window.innerHeight - position.y);

      const newSize = { width: newWidth, height: newHeight };
      onSizeChange?.(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeStart, position, minSize, maxSize, enabled.resize, onSizeChange]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled.drag) return;

      if (onFocus) {
        onFocus();
      }

      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        offsetX: e.clientX - position.x,
        offsetY: e.clientY - position.y,
      });
    },
    [enabled.drag, position, onFocus]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled.resize) return;

      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      });
    },
    [enabled.resize, size]
  );

  return {
    isDragging,
    isResizing,
    dragHandlers: {
      onMouseDown: handleDragStart,
    },
    resizeHandlers: {
      onMouseDown: handleResizeStart,
    },
  };
};
