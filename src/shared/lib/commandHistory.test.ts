import { describe, it, expect } from "vitest";

import { updateCommandHistoryEntry, updateCurrentCommandEntry } from "./commandHistory";
import type { CommandEntry } from "../../types";

describe("commandHistory", () => {
  describe("updateCommandHistoryEntry", () => {
    it("should update last entry in history", () => {
      const history: CommandEntry[] = [
        { command: "help", output: ["Help text"], isError: false },
        { command: "ls", output: ["file.txt"], isError: false },
      ];

      const result = updateCommandHistoryEntry(history, entry => {
        if (entry) {
          return { ...entry, output: [...entry.output, "New line"] };
        }
        return entry;
      });

      expect(result).toHaveLength(2);
      expect(result[1].output).toEqual(["file.txt", "New line"]);
      expect(result[0]).toEqual(history[0]);
    });

    it("should return empty array when history is empty", () => {
      const history: CommandEntry[] = [];

      const result = updateCommandHistoryEntry(history, entry => entry);

      expect(result).toEqual([]);
    });

    it("should not update entry when updater returns null", () => {
      const history: CommandEntry[] = [
        { command: "help", output: ["Help"], isError: false },
        { command: "ls", output: ["file.txt"], isError: false },
      ];

      const result = updateCommandHistoryEntry(history, () => null);

      expect(result).toHaveLength(2);
      expect(result).toEqual(history);
    });

    it("should not modify original history", () => {
      const history: CommandEntry[] = [{ command: "help", output: ["Help"], isError: false }];

      const result = updateCommandHistoryEntry(history, entry => entry);

      expect(result).not.toBe(history);
      expect(history[0].output).toEqual(["Help"]);
    });
  });

  describe("updateCurrentCommandEntry", () => {
    it("should update current entry when it matches", () => {
      const currentEntry: CommandEntry = {
        command: "ls",
        output: ["file.txt"],
        isError: false,
      };
      const history: CommandEntry[] = [
        { command: "help", output: ["Help"], isError: false },
        currentEntry,
      ];

      const result = updateCurrentCommandEntry(history, currentEntry, entry => ({
        ...entry,
        output: [...entry.output, "New line"],
      }));

      expect(result).toHaveLength(2);
      expect(result[1].output).toEqual(["file.txt", "New line"]);
    });

    it("should not update when currentEntry is null", () => {
      const history: CommandEntry[] = [{ command: "help", output: ["Help"], isError: false }];

      const result = updateCurrentCommandEntry(history, null, entry => entry);

      expect(result).toEqual(history);
    });

    it("should not update when entry does not match", () => {
      const currentEntry: CommandEntry = {
        command: "ls",
        output: ["file.txt"],
        isError: false,
      };
      const history: CommandEntry[] = [
        { command: "help", output: ["Help"], isError: false },
        { command: "pwd", output: ["/home"], isError: false },
      ];

      const result = updateCurrentCommandEntry(history, currentEntry, entry => ({
        ...entry,
        output: [...entry.output, "New line"],
      }));

      expect(result).toEqual(history);
    });

    it("should handle empty history", () => {
      const currentEntry: CommandEntry = {
        command: "ls",
        output: ["file.txt"],
        isError: false,
      };
      const history: CommandEntry[] = [];

      const result = updateCurrentCommandEntry(history, currentEntry, entry => entry);

      expect(result).toEqual([]);
    });
  });
});
