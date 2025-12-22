import { useEffect, useRef } from "react";

export const useCursor = (
  currentCommand: string,
  isTypingOutput: boolean,
  inputRef: React.RefObject<HTMLInputElement>
) => {
  const cursorRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const updateCursorPosition = () => {
    if (
      !inputRef.current ||
      !cursorRef.current ||
      !measureRef.current ||
      isTypingOutput
    ) {
      return;
    }

    const input = inputRef.current;
    const cursor = cursorRef.current;
    const measure = measureRef.current;

    const styles = window.getComputedStyle(input);
    measure.style.font = styles.font;
    measure.style.fontSize = styles.fontSize;
    measure.style.fontFamily = styles.fontFamily;
    measure.style.fontWeight = styles.fontWeight;
    measure.style.letterSpacing = styles.letterSpacing;

    const cursorPosition = input.selectionStart || currentCommand.length;
    const textBeforeCursor = currentCommand.substring(0, cursorPosition);

    measure.textContent = textBeforeCursor;
    const textWidth = measure.offsetWidth;

    cursor.style.left = `${textWidth}px`;
  };

  useEffect(() => {
    updateCursorPosition();
  }, [currentCommand, isTypingOutput]);

  return {
    cursorRef,
    measureRef,
    updateCursorPosition,
  };
};
