import { useCallback } from "react";
import { CommandEntry, CommandResult } from "../types";
import { updateCommandHistoryEntry } from "../utils/commandHistory";

interface UseOutputAnimationOptions {
  setCommandHistory: React.Dispatch<React.SetStateAction<CommandEntry[]>>;
  setIsTypingOutput: (value: boolean) => void;
  currentCommandRef: React.MutableRefObject<CommandEntry | null>;
  typingTimeoutRef: React.MutableRefObject<number | null>;
}

export const useOutputAnimation = ({
  setCommandHistory,
  setIsTypingOutput,
  currentCommandRef,
  typingTimeoutRef,
}: UseOutputAnimationOptions) => {
  const animateOutput = useCallback(
    (result: CommandResult, isHackCommand: boolean) => {
      if (!currentCommandRef.current) return;

      const totalLines = result.output.length;
      if (isHackCommand && totalLines > 0) {
        currentCommandRef.current.progress = 0;
      }

      setIsTypingOutput(true);
      let currentIndex = 0;

      const addNextLine = () => {
        if (currentIndex < result.output.length && currentCommandRef.current) {
          const line = result.output[currentIndex];
          currentCommandRef.current.output.push(line);

          if (result.isError && currentIndex === 0) {
            currentCommandRef.current.isError = true;
          }

          if (isHackCommand && totalLines > 0) {
            const progress = Math.min(
              Math.floor(((currentIndex + 1) / totalLines) * 100),
              100
            );
            currentCommandRef.current.progress = progress;
          }

          setCommandHistory((prev) =>
            updateCommandHistoryEntry(prev, (entry) => {
              if (entry && currentCommandRef.current) {
                return {
                  ...entry,
                  output: [...currentCommandRef.current.output],
                  isError: currentCommandRef.current.isError,
                  progress: currentCommandRef.current.progress,
                };
              }
              return entry;
            })
          );

          currentIndex++;
          const delay = isHackCommand ? 35 : 40;
          typingTimeoutRef.current = setTimeout(addNextLine, delay);
        } else {
          if (isHackCommand && currentCommandRef.current) {
            currentCommandRef.current.progress = 100;
            setCommandHistory((prev) =>
              updateCommandHistoryEntry(prev, (entry) => {
                if (entry) {
                  return { ...entry, progress: 100 };
                }
                return entry;
              })
            );
          }
          setIsTypingOutput(false);
          typingTimeoutRef.current = null;
          currentCommandRef.current = null;
        }
      };

      typingTimeoutRef.current = setTimeout(addNextLine, 50);
    },
    [setCommandHistory, setIsTypingOutput, currentCommandRef, typingTimeoutRef]
  );

  const animateDestroy = useCallback(
    (result: CommandResult, onComplete?: () => void) => {
      if (!currentCommandRef.current) return;

      setIsTypingOutput(true);
      let destroyIndex = 0;

      const addDestroyLine = () => {
        if (destroyIndex < result.output.length && currentCommandRef.current) {
          const line = result.output[destroyIndex];
          currentCommandRef.current.output.push(line);

          setCommandHistory((prev) =>
            updateCommandHistoryEntry(prev, (entry) => {
              if (entry && currentCommandRef.current) {
                return {
                  ...entry,
                  output: [...currentCommandRef.current.output],
                };
              }
              return entry;
            })
          );

          destroyIndex++;
          const delay = destroyIndex > result.output.length * 0.8 ? 30 : 40;
          typingTimeoutRef.current = setTimeout(addDestroyLine, delay);
        } else {
          setIsTypingOutput(false);
          typingTimeoutRef.current = null;
          if (onComplete) {
            onComplete();
          }
        }
      };

      typingTimeoutRef.current = setTimeout(addDestroyLine, 50);
    },
    [setCommandHistory, setIsTypingOutput, currentCommandRef, typingTimeoutRef]
  );

  return {
    animateOutput,
    animateDestroy,
  };
};
