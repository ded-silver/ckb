import { useCallback } from "react";

import { AVAILABLE_COMMANDS } from "@shared/config";

export const useCommandHistory = (
  rawCommandHistory: string[],
  currentCommand: string,
  setCurrentCommand: (cmd: string) => void,
  commandHistoryIndex: number,
  setCommandHistoryIndex: (index: number) => void,
  tempCommand: string,
  setTempCommand: (cmd: string) => void
) => {
  const handleArrowUp = useCallback(() => {
    if (rawCommandHistory.length === 0) return;

    if (commandHistoryIndex === -1) {
      setTempCommand(currentCommand);
    }

    const newIndex =
      commandHistoryIndex < rawCommandHistory.length - 1
        ? commandHistoryIndex + 1
        : rawCommandHistory.length - 1;
    setCommandHistoryIndex(newIndex);
    setCurrentCommand(rawCommandHistory[rawCommandHistory.length - 1 - newIndex]);
  }, [
    rawCommandHistory,
    currentCommand,
    commandHistoryIndex,
    setCurrentCommand,
    setCommandHistoryIndex,
    setTempCommand,
  ]);

  const handleArrowDown = useCallback(() => {
    if (commandHistoryIndex === -1) return;

    if (commandHistoryIndex === 0) {
      setCommandHistoryIndex(-1);
      setCurrentCommand(tempCommand);
      setTempCommand("");
    } else {
      const newIndex = commandHistoryIndex - 1;
      setCommandHistoryIndex(newIndex);
      setCurrentCommand(rawCommandHistory[rawCommandHistory.length - 1 - newIndex]);
    }
  }, [
    commandHistoryIndex,
    tempCommand,
    rawCommandHistory,
    setCurrentCommand,
    setCommandHistoryIndex,
    setTempCommand,
  ]);

  const handleTab = useCallback(() => {
    const matchingCommands = AVAILABLE_COMMANDS.filter(cmd =>
      cmd.startsWith(currentCommand.toLowerCase())
    );

    if (matchingCommands.length === 1) {
      setCurrentCommand(matchingCommands[0]);
    } else if (matchingCommands.length > 1) {
      const commonPrefix = matchingCommands.reduce((prefix: string, cmd) => {
        let i = 0;
        while (i < prefix.length && i < cmd.length && prefix[i] === cmd[i]) {
          i++;
        }
        return prefix.substring(0, i);
      }, matchingCommands[0]);

      if (commonPrefix.length > currentCommand.length) {
        setCurrentCommand(commonPrefix);
      }
    }
  }, [currentCommand, setCurrentCommand]);

  return {
    handleArrowUp,
    handleArrowDown,
    handleTab,
  };
};
