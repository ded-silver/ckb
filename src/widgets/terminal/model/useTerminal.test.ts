import { executeCommand } from "@shared/lib/commands";
import { useOutputAnimation } from "@shared/lib/hooks";
import { soundGenerator } from "@shared/lib/sounds";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useTerminal } from "./useTerminal";
import type { Theme, TerminalSize, UserInfo } from "../../../types";

vi.mock("@shared/lib/commands", () => ({
  executeCommand: vi.fn(),
}));

vi.mock("@shared/lib/sounds", () => ({
  soundGenerator: {
    playCommand: vi.fn(),
    playError: vi.fn(),
  },
}));

vi.mock("@shared/lib/sounds/soundHandler", () => ({
  playCommandSound: vi.fn(),
}));

vi.mock("@shared/lib/destroy", () => ({
  createDestroyOverlay: vi.fn(),
}));

vi.mock("@shared/lib/hooks", () => ({
  useOutputAnimation: vi.fn(() => ({
    animateOutput: vi.fn(),
    animateDestroy: vi.fn(),
  })),
}));

describe("useTerminal", () => {
  const defaultTheme: Theme = "2077";
  const defaultSize: TerminalSize = { width: 800, height: 600 };
  const defaultUserInfo: UserInfo = { username: "user", hostname: "host" };

  let onThemeChange: (theme: Theme) => void;
  let onSizeChange: (size: TerminalSize) => void;
  let onUserInfoChange: (userInfo: UserInfo) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    onThemeChange = vi.fn();
    onSizeChange = vi.fn();
    onUserInfoChange = vi.fn();
    vi.mocked(useOutputAnimation).mockReturnValue({
      animateOutput: vi.fn(),
      animateDestroy: vi.fn(),
    } as any);
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    expect(result.current.commandHistory).toEqual([]);
    expect(result.current.currentCommand).toBe("");
    expect(result.current.commandHistoryIndex).toBe(-1);
    expect(result.current.rawCommandHistory).toEqual([]);
    expect(result.current.tempCommand).toBe("");
  });

  it("should set current command", () => {
    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    act(() => {
      result.current.setCurrentCommand("test command");
    });

    expect(result.current.currentCommand).toBe("test command");
  });

  it("should handle clear command", async () => {
    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    act(() => {
      result.current.setCurrentCommand("test");
    });

    await act(async () => {
      await result.current.handleCommand("clear");
    });

    expect(result.current.commandHistory).toEqual([]);
    expect(result.current.currentCommand).toBe("");
    expect(result.current.output).toEqual([]);
  });

  it("should execute command and add to history", async () => {
    const mockResult = {
      output: ["Command output"],
      isError: false,
    };

    vi.mocked(executeCommand).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("help");
    });

    expect(executeCommand).toHaveBeenCalled();
    expect(soundGenerator.playCommand).toHaveBeenCalled();
    expect(result.current.rawCommandHistory).toContain("help");
  });

  it("should not execute empty command", async () => {
    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("   ");
    });

    expect(executeCommand).not.toHaveBeenCalled();
  });

  it("should handle command with error", async () => {
    const mockResult = {
      output: ["Error message"],
      isError: true,
    };

    vi.mocked(executeCommand).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("invalid");
    });

    expect(result.current.glitchActive).toBe(true);
  });

  it("should handle theme change from command result", async () => {
    const mockResult = {
      output: ["Theme changed"],
      theme: "matrix" as Theme,
    };

    vi.mocked(executeCommand).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("theme matrix");
    });

    expect(onThemeChange).toHaveBeenCalledWith("matrix");
  });

  it("should handle notification from command result", async () => {
    const mockResult = {
      output: ["Command output"],
      notification: "Test notification",
    };

    vi.mocked(executeCommand).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("test");
    });

    expect(result.current.notifications).toContain("Test notification");
  });

  it("should not execute command when isTypingOutput is true", async () => {
    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    vi.mocked(executeCommand).mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              output: ["Loading..."],
              isError: false,
            });
          }, 100);
        })
    );

    await act(async () => {
      await result.current.handleCommand("ping");
    });

    const callCountBefore = vi.mocked(executeCommand).mock.calls.length;

    await act(async () => {
      await result.current.handleCommand("help");
    });

    expect(vi.mocked(executeCommand).mock.calls.length).toBe(callCountBefore);
  });

  it("should handle async command loading", async () => {
    vi.mocked(executeCommand).mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              output: ["Ping result"],
              isError: false,
            });
          }, 50);
        })
    );

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("ping");
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.rawCommandHistory).toContain("ping");
    expect(executeCommand).toHaveBeenCalled();
  });

  it("should handle destroy command", async () => {
    const mockResult = {
      output: ["Destroying..."],
      isError: true,
      shouldDestroy: true,
    };

    vi.mocked(executeCommand).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("destroy");
    });

    expect(result.current.glitchActive).toBe(true);
    expect(soundGenerator.playError).toHaveBeenCalled();
  });

  it("should handle command error with catch block", async () => {
    vi.mocked(executeCommand).mockRejectedValue(new Error("Test error"));

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("test");
    });

    expect(result.current.glitchActive).toBe(true);
    expect(soundGenerator.playError).toHaveBeenCalled();
    expect(result.current.commandHistory.length).toBeGreaterThan(0);
    const lastEntry = result.current.commandHistory[result.current.commandHistory.length - 1];
    expect(lastEntry.isError).toBe(true);
    expect(lastEntry.output.some(line => line.includes("Error"))).toBe(true);
  });

  it("should handle command error with non-Error object", async () => {
    vi.mocked(executeCommand).mockRejectedValue("String error");

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("test");
    });

    expect(result.current.glitchActive).toBe(true);
    expect(soundGenerator.playError).toHaveBeenCalled();
  });

  it("should handle size change from command callback", async () => {
    const mockResult = {
      output: ["Size changed"],
    };

    vi.mocked(executeCommand).mockImplementation(
      async (
        _cmd: string,
        _rawHistory?: string[],
        _theme?: string,
        _setThemeCallback?: (theme: Theme) => void,
        _addNotificationCallback?: (message: string) => void,
        _currentSize?: TerminalSize,
        setSizeCallback?: (size: TerminalSize) => void,
        _currentUserInfo?: UserInfo,
        _setUserInfoCallback?: (userInfo: UserInfo) => void
      ) => {
        if (setSizeCallback) {
          setSizeCallback({ width: 1000, height: 800 });
        }
        return mockResult;
      }
    );

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("resize");
    });

    expect(onSizeChange).toHaveBeenCalledWith({ width: 1000, height: 800 });
  });

  it("should handle userInfo change from command callback", async () => {
    const mockResult = {
      output: ["User changed"],
    };

    vi.mocked(executeCommand).mockImplementation(
      async (
        _cmd: string,
        _rawHistory?: string[],
        _theme?: string,
        _setThemeCallback?: (theme: Theme) => void,
        _addNotificationCallback?: (message: string) => void,
        _currentSize?: TerminalSize,
        _setSizeCallback?: (size: TerminalSize) => void,
        _currentUserInfo?: UserInfo,
        setUserInfoCallback?: (userInfo: UserInfo) => void
      ) => {
        if (setUserInfoCallback) {
          setUserInfoCallback({ username: "newuser", hostname: "newhost" });
        }
        return mockResult;
      }
    );

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("login");
    });

    expect(onUserInfoChange).toHaveBeenCalledWith({
      username: "newuser",
      hostname: "newhost",
    });
  });

  it("should handle command with progress", async () => {
    const mockResult = {
      output: ["Progress..."],
      progress: 50,
      isAnimated: true,
    };

    vi.mocked(executeCommand).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("progress");
    });

    const lastEntry = result.current.commandHistory[result.current.commandHistory.length - 1];
    expect(lastEntry.progress).toBe(50);
    expect(lastEntry.isAnimated).toBe(true);
  });

  it("should handle hack command", async () => {
    const mockResult = {
      output: ["Hacking..."],
      isError: false,
    };

    vi.mocked(executeCommand).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("hack server");
    });

    expect(result.current.rawCommandHistory).toContain("hack server");
  });

  it("should handle async command error", async () => {
    vi.mocked(executeCommand).mockRejectedValue(new Error("Async error"));

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    await act(async () => {
      await result.current.handleCommand("ping");
    });

    expect(result.current.commandHistory.length).toBeGreaterThan(0);
    const lastEntry = result.current.commandHistory[result.current.commandHistory.length - 1];
    expect(lastEntry.isError).toBe(true);
  });

  it("should reset command history index and temp command on command execution", async () => {
    const mockResult = {
      output: ["Output"],
      isError: false,
    };

    vi.mocked(executeCommand).mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useTerminal({
        theme: defaultTheme,
        onThemeChange,
        size: defaultSize,
        onSizeChange,
        userInfo: defaultUserInfo,
        onUserInfoChange,
      })
    );

    act(() => {
      result.current.setCommandHistoryIndex(5);
      result.current.setTempCommand("temp");
    });

    await act(async () => {
      await result.current.handleCommand("test");
    });

    expect(result.current.commandHistoryIndex).toBe(-1);
    expect(result.current.tempCommand).toBe("");
  });

  describe("notifications", () => {
    it("should show notification from command result", async () => {
      const mockResult = {
        output: ["Output"],
        isError: false,
        notification: "Test notification",
      };

      vi.mocked(executeCommand).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useTerminal({
          theme: defaultTheme,
          onThemeChange,
          size: defaultSize,
          onSizeChange,
          userInfo: defaultUserInfo,
          onUserInfoChange,
        })
      );

      await act(async () => {
        await result.current.handleCommand("test");
      });

      expect(result.current.notifications).toContain("Test notification");
    });

    it("should remove notification after timeout", async () => {
      vi.useFakeTimers();
      const mockResult = {
        output: ["Output"],
        isError: false,
        notification: "Test notification",
      };

      vi.mocked(executeCommand).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useTerminal({
          theme: defaultTheme,
          onThemeChange,
          size: defaultSize,
          onSizeChange,
          userInfo: defaultUserInfo,
          onUserInfoChange,
        })
      );

      await act(async () => {
        await result.current.handleCommand("test");
      });

      expect(result.current.notifications).toContain("Test notification");

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.notifications.length).toBe(0);

      vi.useRealTimers();
    });
  });

  describe("handleClear", () => {
    it("should clear all state when clear command is executed", async () => {
      const { result } = renderHook(() =>
        useTerminal({
          theme: defaultTheme,
          onThemeChange,
          size: defaultSize,
          onSizeChange,
          userInfo: defaultUserInfo,
          onUserInfoChange,
        })
      );

      act(() => {
        result.current.setCurrentCommand("test");
      });

      await act(async () => {
        await result.current.handleCommand("clear");
      });

      expect(result.current.currentCommand).toBe("");
      expect(result.current.commandHistory.length).toBe(0);
      expect(result.current.output.length).toBe(0);
    });
  });
});
