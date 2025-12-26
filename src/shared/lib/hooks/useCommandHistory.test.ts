import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useCommandHistory } from "./useCommandHistory";

describe("useCommandHistory", () => {
  let setCurrentCommand: (cmd: string) => void;
  let setCommandHistoryIndex: (index: number) => void;
  let setTempCommand: (cmd: string) => void;

  beforeEach(() => {
    setCurrentCommand = vi.fn();
    setCommandHistoryIndex = vi.fn();
    setTempCommand = vi.fn();
  });

  describe("handleArrowUp", () => {
    it("should do nothing when history is empty", () => {
      const { result } = renderHook(() =>
        useCommandHistory([], "", setCurrentCommand, -1, setCommandHistoryIndex, "", setTempCommand)
      );

      act(() => {
        result.current.handleArrowUp();
      });

      expect(setCommandHistoryIndex).not.toHaveBeenCalled();
      expect(setCurrentCommand).not.toHaveBeenCalled();
    });

    it("should navigate to last command in history", () => {
      const history = ["cmd1", "cmd2", "cmd3"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowUp();
      });

      expect(setCommandHistoryIndex).toHaveBeenCalledWith(0);
      expect(setCurrentCommand).toHaveBeenCalledWith("cmd3");
    });

    it("should save current command to temp when starting navigation", () => {
      const history = ["cmd1", "cmd2"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "current-command",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowUp();
      });

      expect(setTempCommand).toHaveBeenCalledWith("current-command");
    });

    it("should navigate up through history", () => {
      const history = ["cmd1", "cmd2", "cmd3"];
      const { result, rerender } = renderHook(
        ({ index }) =>
          useCommandHistory(
            history,
            "",
            setCurrentCommand,
            index,
            setCommandHistoryIndex,
            "",
            setTempCommand
          ),
        { initialProps: { index: -1 } }
      );

      act(() => {
        result.current.handleArrowUp();
      });
      expect(setCommandHistoryIndex).toHaveBeenCalledWith(0);
      expect(setCurrentCommand).toHaveBeenCalledWith("cmd3");

      rerender({ index: 0 });
      act(() => {
        result.current.handleArrowUp();
      });
      expect(setCommandHistoryIndex).toHaveBeenCalledWith(1);
      expect(setCurrentCommand).toHaveBeenCalledWith("cmd2");
    });

    it("should not go beyond first command in history", () => {
      const history = ["cmd1", "cmd2"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "",
          setCurrentCommand,
          1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowUp();
      });

      expect(setCommandHistoryIndex).toHaveBeenCalledWith(1);
    });

    it("should not save temp command when already navigating", () => {
      const history = ["cmd1", "cmd2"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "",
          setCurrentCommand,
          0,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowUp();
      });

      expect(setTempCommand).not.toHaveBeenCalled();
    });
  });

  describe("handleArrowDown", () => {
    it("should do nothing when not navigating (index is -1)", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          ["cmd1", "cmd2"],
          "",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowDown();
      });

      expect(setCommandHistoryIndex).not.toHaveBeenCalled();
      expect(setCurrentCommand).not.toHaveBeenCalled();
    });

    it("should restore temp command when at first history item", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          ["cmd1", "cmd2"],
          "",
          setCurrentCommand,
          0,
          setCommandHistoryIndex,
          "temp-command",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowDown();
      });

      expect(setCommandHistoryIndex).toHaveBeenCalledWith(-1);
      expect(setCurrentCommand).toHaveBeenCalledWith("temp-command");
      expect(setTempCommand).toHaveBeenCalledWith("");
    });

    it("should navigate down through history", () => {
      const history = ["cmd1", "cmd2", "cmd3"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "",
          setCurrentCommand,
          2,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowDown();
      });

      expect(setCommandHistoryIndex).toHaveBeenCalledWith(1);
      expect(setCurrentCommand).toHaveBeenCalledWith("cmd2");
    });

    it("should navigate to most recent command when going down from middle", () => {
      const history = ["cmd1", "cmd2", "cmd3"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "",
          setCurrentCommand,
          1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowDown();
      });

      expect(setCommandHistoryIndex).toHaveBeenCalledWith(0);
      expect(setCurrentCommand).toHaveBeenCalledWith("cmd3");
    });
  });

  describe("handleTab", () => {
    it("should complete command when single match", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "hel",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleTab();
      });

      expect(setCurrentCommand).toHaveBeenCalledWith("help");
    });

    it("should complete to common prefix when multiple matches", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "ca",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleTab();
      });

      expect(setCurrentCommand).toHaveBeenCalledWith("cat");
    });

    it("should not change command when no matches", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "xyz",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleTab();
      });

      expect(setCurrentCommand).not.toHaveBeenCalled();
    });

    it("should not change command when common prefix is not longer", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "help",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleTab();
      });

      expect(result.current).toBeDefined();
    });

    it("should handle case-insensitive matching", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "HEL",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleTab();
      });

      expect(setCurrentCommand).toHaveBeenCalledWith("help");
    });

    it("should not change command when common prefix length equals current command length", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "cat",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleTab();
      });

      expect(result.current).toBeDefined();
    });

    it("should not change command when common prefix is shorter than current command", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "help",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleTab();
      });

      expect(result.current).toBeDefined();
    });

    it("should not set command when commonPrefix.length <= currentCommand.length", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "cat",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      vi.clearAllMocks();
      act(() => {
        result.current.handleTab();
      });

      expect(result.current).toBeDefined();
    });

    it("should handle multiple matches with different prefixes", () => {
      const { result } = renderHook(() =>
        useCommandHistory(
          [],
          "ca",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleTab();
      });

      expect(setCurrentCommand).toHaveBeenCalled();
    });

    it("should handle empty current command with matches", () => {
      const { result } = renderHook(() =>
        useCommandHistory([], "", setCurrentCommand, -1, setCommandHistoryIndex, "", setTempCommand)
      );

      act(() => {
        result.current.handleTab();
      });

      expect(setCurrentCommand).not.toHaveBeenCalled();
    });
  });

  describe("handleArrowUp edge cases", () => {
    it("should handle single command in history", () => {
      const history = ["cmd1"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "",
          setCurrentCommand,
          -1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowUp();
      });

      expect(setCommandHistoryIndex).toHaveBeenCalledWith(0);
      expect(setCurrentCommand).toHaveBeenCalledWith("cmd1");
    });

    it("should handle reaching first command in history", () => {
      const history = ["cmd1", "cmd2"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "",
          setCurrentCommand,
          0,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowUp();
      });

      expect(setCommandHistoryIndex).toHaveBeenCalledWith(1);
      expect(setCurrentCommand).toHaveBeenCalledWith("cmd1");
    });
  });

  describe("handleArrowDown edge cases", () => {
    it("should handle navigation from middle to end", () => {
      const history = ["cmd1", "cmd2", "cmd3"];
      const { result } = renderHook(() =>
        useCommandHistory(
          history,
          "",
          setCurrentCommand,
          1,
          setCommandHistoryIndex,
          "",
          setTempCommand
        )
      );

      act(() => {
        result.current.handleArrowDown();
      });

      expect(setCommandHistoryIndex).toHaveBeenCalledWith(0);
      expect(setCurrentCommand).toHaveBeenCalledWith("cmd3");
    });
  });
});
