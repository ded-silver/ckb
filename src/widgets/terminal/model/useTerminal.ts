import { useState, useEffect, useRef, useCallback } from "react";

import { INITIAL_OUTPUT, ASYNC_COMMANDS, HACK_COMMANDS } from "@shared/config";
import { executeCommand } from "@shared/lib/commands";
import { createDestroyOverlay } from "@shared/lib/destroy";
import { useOutputAnimation } from "@shared/lib/hooks";
import { soundGenerator } from "@shared/lib/sounds";
import { playCommandSound } from "@shared/lib/sounds/soundHandler";

import type { CommandEntry, Theme, CommandResult } from "../../../types";

import type { TerminalSize, UserInfo } from "../../../types";

interface UseTerminalOptions {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  size: TerminalSize;
  onSizeChange: (size: TerminalSize) => void;
  userInfo: UserInfo;
  onUserInfoChange: (userInfo: UserInfo) => void;
}

export const useTerminal = ({
  theme,
  onThemeChange,
  size,
  onSizeChange,
  userInfo,
  onUserInfoChange,
}: UseTerminalOptions) => {
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [output, setOutput] = useState<string[]>(INITIAL_OUTPUT);
  const [isTypingOutput, setIsTypingOutput] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const [rawCommandHistory, setRawCommandHistory] = useState<string[]>([]);
  const [tempCommand, setTempCommand] = useState("");

  const typingTimeoutRef = useRef<number | null>(null);
  const currentCommandRef = useRef<CommandEntry | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const notificationTimeoutsRef = useRef<Map<number, number>>(new Map());

  const { animateOutput, animateDestroy } = useOutputAnimation({
    setCommandHistory,
    setIsTypingOutput,
    currentCommandRef,
    typingTimeoutRef,
  });

  const addNotification = useCallback((message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, message]);
    const timeoutId = setTimeout(() => {
      setNotifications(prev => prev.filter((_, idx) => idx !== 0));
      notificationTimeoutsRef.current.delete(id);
    }, 3000) as unknown as number;
    notificationTimeoutsRef.current.set(id, timeoutId);
  }, []);

  useEffect(() => {
    const handleSnakeAchievement = (event: CustomEvent<{ message: string }>) => {
      addNotification(event.detail.message);
    };

    window.addEventListener("snake-achievement", handleSnakeAchievement as EventListener);
    return () => {
      window.removeEventListener("snake-achievement", handleSnakeAchievement as EventListener);
    };
  }, [addNotification]);

  const handleClear = useCallback(() => {
    setOutput([]);
    setCommandHistory([]);
    setCurrentCommand("");
    currentCommandRef.current = null;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTypingOutput(false);
  }, []);

  const handleAsyncCommandLoading = useCallback((cmd: string) => {
    const loadingEntry: CommandEntry = {
      command: cmd,
      output: ["> Loading..."],
      isError: false,
    };
    setCommandHistory(prev => [...prev, loadingEntry]);
    currentCommandRef.current = loadingEntry;
    setIsTypingOutput(true);
  }, []);

  const handleDestroy = useCallback(
    (result: CommandResult, cmd: string) => {
      setGlitchActive(true);
      soundGenerator.playError();

      const destroyEntry: CommandEntry = {
        command: cmd,
        output: [],
        isError: true,
        isAnimated: false,
      };
      setCommandHistory(prev => [...prev, destroyEntry]);
      currentCommandRef.current = destroyEntry;

      animateDestroy(result, () => {
        setTimeout(() => {
          setGlitchActive(true);
          createDestroyOverlay();
        }, 1500);
      });
    },
    [animateDestroy]
  );

  const handleCommand = useCallback(
    async (cmd: string) => {
      if (!cmd.trim() || isTypingOutput) return;

      const trimmedCmd = cmd.trim().toLowerCase();

      if (trimmedCmd === "clear") {
        handleClear();
        return;
      }

      setRawCommandHistory(prev => [...prev, cmd]);
      setCommandHistoryIndex(-1);
      setTempCommand("");
      setCurrentCommand("");

      soundGenerator.playCommand();

      const commandName = trimmedCmd.split(" ")[0];
      const isAsyncCommand = ASYNC_COMMANDS.some(c => c === commandName);

      if (isAsyncCommand) {
        handleAsyncCommandLoading(cmd);
      }

      try {
        const result = await executeCommand(
          cmd,
          rawCommandHistory,
          theme,
          newTheme => {
            onThemeChange(newTheme);
          },
          addNotification,
          size,
          newSize => {
            onSizeChange(newSize);
          },
          userInfo,
          newUserInfo => {
            onUserInfoChange(newUserInfo);
          }
        );

        if (isAsyncCommand) {
          setCommandHistory(prev => prev.slice(0, -1));
        }

        playCommandSound(cmd, result.isError || false);

        if (result.isError) {
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 500);
        }

        if (result.theme) {
          onThemeChange(result.theme);
        }
        if (result.notification) {
          addNotification(result.notification);
        }

        if (result.shouldDestroy) {
          handleDestroy(result, cmd);
          return;
        }

        const newEntry: CommandEntry = {
          command: cmd,
          output: [],
          isError: result.isError,
          isAnimated: result.isAnimated,
          progress: result.progress,
        };

        setCommandHistory(prev => [...prev, newEntry]);
        currentCommandRef.current = newEntry;

        const isHackCommand = HACK_COMMANDS.some(
          c => trimmedCmd === c || trimmedCmd.startsWith(`${c} `)
        );

        animateOutput(result, isHackCommand);
      } catch (error: unknown) {
        if (isAsyncCommand) {
          setCommandHistory(prev => prev.slice(0, -1));
        }

        const errorMessage = error instanceof Error ? error.message : "Failed to execute command";
        const errorEntry: CommandEntry = {
          command: cmd,
          output: [`Error: ${errorMessage}`, ""],
          isError: true,
        };

        setCommandHistory(prev => [...prev, errorEntry]);
        setGlitchActive(true);
        soundGenerator.playError();
        setTimeout(() => setGlitchActive(false), 500);
        setIsTypingOutput(false);
      }
    },
    [
      isTypingOutput,
      rawCommandHistory,
      theme,
      onThemeChange,
      addNotification,
      handleClear,
      handleAsyncCommandLoading,
      handleDestroy,
      animateOutput,
      size,
      onSizeChange,
      userInfo,
      onUserInfoChange,
    ]
  );

  useEffect(() => {
    const typingTimeout = typingTimeoutRef;
    const progressInterval = progressIntervalRef;
    const notificationTimeouts = notificationTimeoutsRef;

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      notificationTimeouts.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      notificationTimeouts.current.clear();
    };
  }, []);

  return {
    commandHistory,
    currentCommand,
    setCurrentCommand,
    output,
    isTypingOutput,
    glitchActive,
    notifications,
    commandHistoryIndex,
    setCommandHistoryIndex,
    rawCommandHistory,
    tempCommand,
    setTempCommand,
    handleCommand,
  };
};
