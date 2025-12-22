import { CommandEntry } from "../types";

export const updateCommandHistoryEntry = (
  history: CommandEntry[],
  updater: (entry: CommandEntry | null) => CommandEntry | null
): CommandEntry[] => {
  const newHistory = [...history];
  const lastIndex = newHistory.length - 1;
  if (lastIndex >= 0) {
    const updated = updater(newHistory[lastIndex]);
    if (updated) {
      newHistory[lastIndex] = updated;
    }
  }
  return newHistory;
};

export const updateCurrentCommandEntry = (
  history: CommandEntry[],
  currentEntry: CommandEntry | null,
  updater: (entry: CommandEntry) => CommandEntry
): CommandEntry[] => {
  if (!currentEntry) return history;
  return updateCommandHistoryEntry(history, (entry) => {
    if (entry && entry === currentEntry) {
      return updater(entry);
    }
    return entry;
  });
};
