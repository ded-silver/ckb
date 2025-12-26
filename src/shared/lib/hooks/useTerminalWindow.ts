import { useState, useEffect, useRef, useCallback } from "react";

import { useCommandHistory } from "./useCommandHistory";
import { useCursor } from "./useCursor";
import type { CommandEntry, CommandResult } from "../../../types";

interface UseTerminalWindowOptions {
  onCommand: (cmd: string) => Promise<CommandResult>;
  prompt?: string;
  welcomeMessage?: string[];
  storageKey?: string; // для сохранения истории команд
  onThemeChange?: (theme: string) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  currentSize?: { width: number; height: number };
  rawHistory?: string[]; // для автодополнения (пока не используется)
}

/**
 * Хук для управления терминальной логикой в приложениях
 * Объединяет: команды, историю, анимацию вывода, курсор, фокус
 */
export const useTerminalWindow = ({
  onCommand,
  prompt = "app@terminal:~$",
  welcomeMessage = [],
  storageKey,
  onThemeChange,
  onSizeChange: _onSizeChange,
  currentSize: _currentSize,
  rawHistory: _rawHistory = [],
}: UseTerminalWindowOptions) => {
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);
  const [rawCommandHistory, setRawCommandHistory] = useState<string[]>([]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const [tempCommand, setTempCommand] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  const [isTypingOutput, setIsTypingOutput] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const currentCommandRef = useRef<CommandEntry | null>(null);

  useEffect(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.rawCommandHistory) {
            setRawCommandHistory(parsed.rawCommandHistory);
          }
        }
      } catch (error) {
        console.warn(`Failed to load command history from ${storageKey}:`, error);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey && rawCommandHistory.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ rawCommandHistory }));
      } catch (error) {
        console.warn(`Failed to save command history to ${storageKey}:`, error);
      }
    }
  }, [storageKey, rawCommandHistory]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (inputRef.current && isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    if (!isTypingOutput && inputRef.current) {
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setIsFocused(true);
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isTypingOutput]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const { cursorRef, measureRef, updateCursorPosition } = useCursor(
    currentCommand,
    isTypingOutput,
    inputRef
  );

  const { handleArrowUp, handleArrowDown, handleTab } = useCommandHistory(
    rawCommandHistory,
    currentCommand,
    setCurrentCommand,
    commandHistoryIndex,
    setCommandHistoryIndex,
    tempCommand,
    setTempCommand
  );

  // Используем упрощенную анимацию вместо useOutputAnimation для совместимости
  // const { animateOutput } = useOutputAnimation({
  //   setCommandHistory,
  //   setIsTypingOutput,
  //   currentCommandRef,
  //   typingTimeoutRef,
  // });

  const animateOutputSimple = useCallback(
    (output: readonly string[]) => {
      if (output.length === 0) {
        setIsTypingOutput(false);
        return;
      }

      setIsTypingOutput(true);
      let currentIndex = 0;

      const addNextLine = () => {
        if (currentIndex < output.length && currentCommandRef.current) {
          const line = output[currentIndex];
          currentCommandRef.current = {
            ...currentCommandRef.current,
            output: [...currentCommandRef.current.output, line],
          };

          setCommandHistory(prev => {
            const newHistory = [...prev];
            const lastIndex = newHistory.length - 1;
            if (lastIndex >= 0 && currentCommandRef.current) {
              newHistory[lastIndex] = {
                ...newHistory[lastIndex],
                output: [...currentCommandRef.current.output],
              };
            }
            return newHistory;
          });

          currentIndex++;
          typingTimeoutRef.current = setTimeout(addNextLine, 40) as unknown as number;
        } else {
          setIsTypingOutput(false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
          }
          currentCommandRef.current = null;
        }
      };

      typingTimeoutRef.current = setTimeout(addNextLine, 50) as unknown as number;
    },
    [setCommandHistory, setIsTypingOutput]
  );

  const handleCommand = useCallback(
    async (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) {
        return;
      }

      if (trimmed.toLowerCase() === "clear") {
        setCommandHistory([]);
        setRawCommandHistory([]);
        setCommandHistoryIndex(-1);
        setTempCommand("");
        setCurrentCommand("");
        currentCommandRef.current = null;
        setIsTypingOutput(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        return;
      }

      const result = await onCommand(trimmed);

      if (result.output.length === 0 && !result.isError) {
        return;
      }

      if (result.isError) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 500);
      }

      if (result.theme && onThemeChange) {
        onThemeChange(result.theme);
      }

      const newEntry: CommandEntry = {
        command: trimmed,
        output: [],
        isError: result.isError,
      };
      setCommandHistory(prev => [...prev, newEntry]);
      setRawCommandHistory(prev => [...prev, trimmed]);
      setCommandHistoryIndex(-1);
      setTempCommand("");
      setCurrentCommand("");

      currentCommandRef.current = newEntry;

      animateOutputSimple(result.output);
    },
    [onCommand, onThemeChange, animateOutputSimple]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCommand(currentCommand);
      }
    },
    [currentCommand, handleCommand]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        if (!(e.ctrlKey && e.altKey)) {
          e.preventDefault();
          e.stopPropagation();
          handleArrowUp();
          setTimeout(updateCursorPosition, 0);
          return;
        }
      } else if (e.key === "ArrowDown") {
        if (!(e.ctrlKey && e.altKey)) {
          e.preventDefault();
          e.stopPropagation();
          handleArrowDown();
          setTimeout(updateCursorPosition, 0);
          return;
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        handleTab();
        setTimeout(updateCursorPosition, 0);
        return;
      } else {
        setTimeout(updateCursorPosition, 0);
      }
    },
    [handleArrowUp, handleArrowDown, handleTab, updateCursorPosition]
  );

  const handleTerminalClick = useCallback(
    (_e: React.MouseEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        if (inputRef.current && !isTypingOutput) {
          inputRef.current.focus();
          setIsFocused(true);
        }
      }
    },
    [isTypingOutput]
  );

  return {
    commandHistory,
    currentCommand,
    setCurrentCommand,
    rawCommandHistory,
    commandHistoryIndex,
    tempCommand,
    showCursor,
    isFocused,
    setIsFocused,
    isTypingOutput,
    glitchActive,
    inputRef,
    terminalRef,
    cursorRef,
    measureRef,
    handleCommand,
    handleKeyPress,
    handleKeyDown,
    handleTerminalClick,
    updateCursorPosition,
    welcomeMessage,
    prompt,
  };
};
