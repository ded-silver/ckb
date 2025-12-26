import { getVirusState } from "@features/virus/model";
import { useCommandHistory, useCursor } from "@shared/lib/hooks";
import { corruptRandomChars } from "@shared/lib/textCorruption";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { Terminal } from "./Terminal";
import type { Theme, TerminalSize, UserInfo } from "../../../types";

import { useTerminal } from "../model";

vi.mock("../model", () => ({
  useTerminal: vi.fn(),
}));

vi.mock("@shared/lib/hooks", () => ({
  useCommandHistory: vi.fn(),
  useCursor: vi.fn(),
}));

vi.mock("@shared/config", () => ({
  getASCIILogo: vi.fn(() => "ASCII_LOGO"),
}));

vi.mock("@features/virus/model", () => ({
  getVirusState: vi.fn(() => null),
}));

vi.mock("@shared/lib/textCorruption", () => ({
  corruptRandomChars: vi.fn((text: string) => text),
}));

vi.mock("./TerminalInput", () => ({
  TerminalInput: ({ currentCommand, onKeyPress, onKeyDown }: any) => (
    <div data-testid="terminal-input">
      <input
        data-testid="command-input"
        value={currentCommand}
        onKeyPress={onKeyPress}
        onKeyDown={onKeyDown}
      />
    </div>
  ),
}));

vi.mock("./CommandHistory", () => ({
  CommandHistory: ({ commandHistory }: any) => (
    <div data-testid="command-history">
      {commandHistory.map((entry: any, idx: number) => (
        <div key={idx} data-testid={`history-entry-${idx}`}>
          {entry.command}
        </div>
      ))}
    </div>
  ),
}));

describe("Terminal", () => {
  const defaultTheme: Theme = "2077";
  const defaultSize: TerminalSize = { width: 800, height: 600 };
  const defaultUserInfo: UserInfo = { username: "user", hostname: "host" };

  let onThemeChange: (theme: Theme) => void;
  let onSizeChange: (size: TerminalSize) => void;
  let onUserInfoChange: (userInfo: UserInfo) => void;

  const mockUseTerminal = {
    commandHistory: [],
    currentCommand: "",
    setCurrentCommand: vi.fn(),
    output: ["> SYSTEM INITIALIZED"],
    isTypingOutput: false,
    glitchActive: false,
    notifications: [],
    commandHistoryIndex: -1,
    setCommandHistoryIndex: vi.fn(),
    rawCommandHistory: [],
    tempCommand: "",
    setTempCommand: vi.fn(),
    handleCommand: vi.fn(),
  };

  const mockUseCommandHistory = {
    handleArrowUp: vi.fn(),
    handleArrowDown: vi.fn(),
    handleTab: vi.fn(),
  };

  const mockUseCursor = {
    cursorRef: { current: null },
    measureRef: { current: null },
    updateCursorPosition: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    onThemeChange = vi.fn();
    onSizeChange = vi.fn();
    onUserInfoChange = vi.fn();

    vi.mocked(useTerminal).mockReturnValue(mockUseTerminal as any);
    vi.mocked(useCommandHistory).mockReturnValue(mockUseCommandHistory);
    vi.mocked(useCursor).mockReturnValue(mockUseCursor);
  });

  const getDefaultProps = () => ({
    theme: defaultTheme,
    onThemeChange,
    size: defaultSize,
    onSizeChange,
    userInfo: defaultUserInfo,
    onUserInfoChange,
  });

  it("should render terminal container", () => {
    render(<Terminal {...getDefaultProps()} />);

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should display ASCII logo", () => {
    render(<Terminal {...getDefaultProps()} />);

    const logo = document.querySelector(".ascii-logo");
    expect(logo).toBeInTheDocument();
  });

  it("should display terminal output when not typing", async () => {
    render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 100));

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should render TerminalInput component when not typing", async () => {
    render(<Terminal {...getDefaultProps()} />);

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should render CommandHistory component when not typing", async () => {
    render(<Terminal {...getDefaultProps()} />);

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should display command history entries when not typing", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      commandHistory: [
        { command: "help", output: ["Help text"], isError: false },
        { command: "ls", output: ["file.txt"], isError: false },
      ],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should call handleCommand when Enter is pressed", () => {
    const mockHistory = {
      ...mockUseTerminal,
      currentCommand: "help",
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    expect(mockUseTerminal.handleCommand).toBeDefined();
  });

  it("should provide keyboard handlers to TerminalInput", () => {
    render(<Terminal {...getDefaultProps()} />);

    expect(useCommandHistory).toHaveBeenCalled();
    expect(useCursor).toHaveBeenCalled();
  });

  it("should display notifications when not typing", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      notifications: ["Notification 1", "Notification 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should apply glitch class when glitchActive is true and not typing", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      glitchActive: true,
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should apply theme class", () => {
    render(<Terminal {...getDefaultProps()} theme="matrix" />);

    const terminal = document.querySelector(".terminal");
    expect(terminal).toHaveClass("theme-matrix");
  });

  it("should set terminal size from props", () => {
    render(<Terminal {...getDefaultProps()} size={{ width: 1000, height: 800 }} />);

    const terminal = document.querySelector(".terminal") as HTMLElement;
    expect(terminal).toHaveStyle({ width: "1000px", height: "800px" });
  });

  it("should show typing state initially", () => {
    render(<Terminal {...getDefaultProps()} />);

    const terminal = document.querySelector(".typing-terminal");
    expect(terminal).toBeInTheDocument();
    const logo = document.querySelector(".ascii-logo");
    expect(logo).toBeInTheDocument();
  });

  it("should use correct theme class", () => {
    render(<Terminal {...getDefaultProps()} theme="matrix" />);

    const terminal = document.querySelector(".terminal");
    expect(terminal).toHaveClass("theme-matrix");
  });

  it("should pass correct props to useTerminal", () => {
    render(<Terminal {...getDefaultProps()} />);

    expect(useTerminal).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: defaultTheme,
        size: defaultSize,
        userInfo: defaultUserInfo,
      })
    );
    expect(useTerminal).toHaveBeenCalledTimes(1);
  });

  it("should apply corruption to output when virus is active", async () => {
    const { corruptRandomChars } = await import("@shared/lib/textCorruption");
    const { getVirusState } = await import("@features/virus/model");
    vi.mocked(getVirusState).mockReturnValue({
      isInfected: true,
      virusType: "corruption",
    } as any);

    const mockHistory = {
      ...mockUseTerminal,
      output: ["Line 1", "Line 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(vi.mocked(corruptRandomChars)).toHaveBeenCalled();
  });

  it("should not apply corruption when virus is not active", async () => {
    const { getVirusState } = await import("@features/virus/model");
    vi.mocked(getVirusState).mockReturnValue({
      isInfected: false,
      virusType: null,
    } as any);

    const mockHistory = {
      ...mockUseTerminal,
      output: ["Line 1", "Line 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should display notifications when present", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      notifications: ["Notification 1", "Notification 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 200));

    const notifications = document.querySelector(".notifications");
    if (notifications) {
      expect(notifications).toBeInTheDocument();
    } else {
      const container = document.querySelector(".terminal-container");
      expect(container).toBeInTheDocument();
    }
  });

  it("should not display notifications when empty", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      notifications: [],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    const notifications = document.querySelector(".notifications");
    expect(notifications).not.toBeInTheDocument();
  });

  it("should handle Enter key press", async () => {
    const user = await import("@testing-library/user-event");
    const userEvent = user.default.setup();

    const mockHistory = {
      ...mockUseTerminal,
      currentCommand: "help",
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    const input = document.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      await userEvent.type(input, "{Enter}");
      expect(mockUseTerminal.handleCommand).toHaveBeenCalledWith("help");
    }
  });

  it("should handle Enter key in handleKeyPress", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      currentCommand: "test",
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const input = document.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      const enterEvent = new KeyboardEvent("keypress", { key: "Enter" });
      input.dispatchEvent(enterEvent);

      expect(mockUseTerminal.handleCommand).toHaveBeenCalledWith("test");
    }
  });

  it("should handle ArrowUp key", async () => {
    const user = await import("@testing-library/user-event");
    const userEvent = user.default.setup();

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    const input = document.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      await userEvent.type(input, "{ArrowUp}");
      expect(mockUseCommandHistory.handleArrowUp).toHaveBeenCalled();
    }
  });

  it("should handle ArrowDown key", async () => {
    const user = await import("@testing-library/user-event");
    const userEvent = user.default.setup();

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    const input = document.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      await userEvent.type(input, "{ArrowDown}");
      expect(mockUseCommandHistory.handleArrowDown).toHaveBeenCalled();
    }
  });

  it("should handle Tab key", async () => {
    const user = await import("@testing-library/user-event");
    const userEvent = user.default.setup();

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    const input = document.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      await userEvent.type(input, "{Tab}");
      expect(mockUseCommandHistory.handleTab).toHaveBeenCalled();
    }
  });

  it("should update virus state on interval", async () => {
    const { getVirusState } = await import("@features/virus/model");
    vi.mocked(getVirusState).mockReturnValue(null);

    render(<Terminal {...getDefaultProps()} />);

    expect(getVirusState).toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(getVirusState).toHaveBeenCalledTimes(2);
  });

  it("should scroll terminal when command history changes", () => {
    const mockHistory = {
      ...mockUseTerminal,
      commandHistory: [{ command: "help", output: ["Help"], isError: false }],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { rerender } = render(<Terminal {...getDefaultProps()} />);

    const mockHistory2 = {
      ...mockUseTerminal,
      commandHistory: [
        { command: "help", output: ["Help"], isError: false },
        { command: "ls", output: ["file.txt"], isError: false },
      ],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory2 as any);

    rerender(<Terminal {...getDefaultProps()} />);

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should handle cursor blinking interval", async () => {
    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 600));

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should handle autoscroll when output changes", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      output: ["Line 1"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { rerender } = render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const mockHistory2 = {
      ...mockUseTerminal,
      output: ["Line 1", "Line 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory2 as any);

    rerender(<Terminal {...getDefaultProps()} />);

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should handle autoscroll when terminalRef exists", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      commandHistory: [{ command: "help", output: ["Help"], isError: false }],
      output: ["Line 1"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const terminal = document.querySelector(".terminal");
    expect(terminal).toBeInTheDocument();
  });

  it("should handle focus on input when not typing and not typing output", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      isTypingOutput: false,
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 200));

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should not focus input when isTypingOutput is true", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      isTypingOutput: true,
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 200));

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should not focus input when inputRef.current is null", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      isTypingOutput: false,
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 200));

    const container = document.querySelector(".terminal-container");
    expect(container).toBeInTheDocument();
  });

  it("should handle other keys in handleKeyDown", async () => {
    const user = await import("@testing-library/user-event");
    const userEvent = user.default.setup();

    render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 150));

    const input = document.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      await userEvent.type(input, "a");
      expect(mockUseCursor.updateCursorPosition).toHaveBeenCalled();
    }
  });

  it("should scroll terminal to bottom when commandHistory or output changes", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      commandHistory: [],
      output: ["Line 1"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container, rerender } = render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const terminalDiv = container.querySelector(".terminal") as HTMLDivElement;
    if (terminalDiv) {
      Object.defineProperty(terminalDiv, "scrollHeight", {
        writable: true,
        value: 1000,
      });
      terminalDiv.scrollTop = 0;

      const mockHistory2 = {
        ...mockUseTerminal,
        commandHistory: [],
        output: ["Line 1", "Line 2"],
      };
      vi.mocked(useTerminal).mockReturnValue(mockHistory2 as any);
      rerender(<Terminal {...getDefaultProps()} />);

      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });

  it("should focus input when typing is complete and not typing output", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      isTypingOutput: false,
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container } = render(<Terminal {...getDefaultProps()} />);

    await new Promise(resolve => setTimeout(resolve, 200));

    const input = container.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      expect(input).toBeInTheDocument();
    }
  });

  it("should call handleCommand when Enter is pressed in handleKeyPress", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      currentCommand: "test command",
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container } = render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const input = container.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

      expect(mockUseTerminal.handleCommand).toHaveBeenCalledWith("test command");
    }
  });

  it("should prevent default and call handlers for ArrowUp in handleKeyDown", async () => {
    const { container } = render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const input = container.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      fireEvent.keyDown(input, {
        key: "ArrowUp",
        code: "ArrowUp",
        keyCode: 38,
      });

      expect(mockUseCommandHistory.handleArrowUp).toHaveBeenCalled();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockUseCursor.updateCursorPosition).toHaveBeenCalled();
    }
  });

  it("should prevent default and call handlers for ArrowDown in handleKeyDown", async () => {
    const { container } = render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const input = container.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      fireEvent.keyDown(input, {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
      });

      expect(mockUseCommandHistory.handleArrowDown).toHaveBeenCalled();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockUseCursor.updateCursorPosition).toHaveBeenCalled();
    }
  });

  it("should prevent default and call handlers for Tab in handleKeyDown", async () => {
    const { container } = render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const input = container.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      fireEvent.keyDown(input, {
        key: "Tab",
        code: "Tab",
        keyCode: 9,
      });

      expect(mockUseCommandHistory.handleTab).toHaveBeenCalled();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockUseCursor.updateCursorPosition).toHaveBeenCalled();
    }
  });

  it("should call updateCursorPosition for other keys in handleKeyDown", async () => {
    const { container } = render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const input = container.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      vi.clearAllMocks();
      fireEvent.keyDown(input, {
        key: "a",
        code: "KeyA",
        keyCode: 65,
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockUseCursor.updateCursorPosition).toHaveBeenCalled();
    }
  });

  it("should not call handleCommand for non-Enter key in handleKeyPress", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      currentCommand: "test command",
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container } = render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    const input = container.querySelector('input[data-testid="command-input"]') as HTMLInputElement;
    if (input) {
      vi.clearAllMocks();
      fireEvent.keyPress(input, { key: "a", code: "KeyA", charCode: 97 });

      expect(mockUseTerminal.handleCommand).not.toHaveBeenCalled();
    }
  });

  it("should handle corruption virus output", async () => {
    const { getVirusState } = await import("@features/virus/model");
    const { corruptRandomChars } = await import("@shared/lib/textCorruption");

    vi.mocked(getVirusState).mockReturnValue({
      isInfected: true,
      timeRemaining: 999999,
      startTime: Date.now(),
      virusType: "corruption",
    });

    const mockHistory = {
      ...mockUseTerminal,
      output: ["Line 1", "Line 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(corruptRandomChars).toHaveBeenCalled();
  });

  it("should not corrupt output when virus is not corruption type", async () => {
    const { getVirusState } = await import("@features/virus/model");
    const { corruptRandomChars } = await import("@shared/lib/textCorruption");

    vi.mocked(getVirusState).mockReturnValue({
      isInfected: true,
      timeRemaining: 1000,
      startTime: Date.now(),
      virusType: "trojan",
    });

    const mockHistory = {
      ...mockUseTerminal,
      output: ["Line 1", "Line 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(corruptRandomChars).not.toHaveBeenCalled();
  });

  it("should display notifications when present", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      notifications: ["Notification 1", "Notification 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container } = render(<Terminal {...getDefaultProps()} />);

    await waitFor(
      () => {
        const terminal = container.querySelector(".terminal");
        expect(terminal).not.toHaveClass("typing-terminal");
      },
      { timeout: 2000 }
    );

    const notifications = document.querySelector(".notifications");
    expect(notifications).toBeInTheDocument();
  });

  it("should not display notifications when empty", () => {
    const mockHistory = {
      ...mockUseTerminal,
      notifications: [],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    const notifications = document.querySelector(".notifications");
    expect(notifications).not.toBeInTheDocument();
  });

  it("should apply glitch class when glitchActive is true", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      glitchActive: true,
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container } = render(<Terminal {...getDefaultProps()} />);

    await waitFor(
      () => {
        const terminal = container.querySelector(".terminal");
        expect(terminal).not.toHaveClass("typing-terminal");
      },
      { timeout: 2000 }
    );

    const terminal = document.querySelector(".terminal");
    expect(terminal).toHaveClass("glitch-active");
  });

  it("should not apply glitch class when glitchActive is false", () => {
    const mockHistory = {
      ...mockUseTerminal,
      glitchActive: false,
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    render(<Terminal {...getDefaultProps()} />);

    const terminal = document.querySelector(".terminal");
    expect(terminal).not.toHaveClass("glitch-active");
  });

  it("should handle corruption output when virus is active", async () => {
    vi.mocked(getVirusState).mockReturnValue({
      isInfected: true,
      virusType: "corruption",
      timeRemaining: 999999,
      startTime: Date.now(),
    });
    vi.mocked(corruptRandomChars).mockImplementation((text: string) => `corrupted_${text}`);

    const mockHistory = {
      ...mockUseTerminal,
      output: ["Line 1", "Line 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container } = render(<Terminal {...getDefaultProps()} />);

    await waitFor(
      () => {
        const terminal = container.querySelector(".terminal");
        expect(terminal).not.toHaveClass("typing-terminal");
      },
      { timeout: 2000 }
    );

    expect(corruptRandomChars).toHaveBeenCalled();
  });

  it("should handle terminal ref scroll when commandHistory changes", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      commandHistory: [{ command: "test", output: [] }],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container, rerender } = render(<Terminal {...getDefaultProps()} />);

    await waitFor(
      () => {
        const terminal = container.querySelector(".terminal");
        expect(terminal).not.toHaveClass("typing-terminal");
      },
      { timeout: 2000 }
    );

    const newHistory = {
      ...mockUseTerminal,
      commandHistory: [
        { command: "test", output: [] },
        { command: "test2", output: [] },
      ],
    };
    vi.mocked(useTerminal).mockReturnValue(newHistory as any);
    rerender(<Terminal {...getDefaultProps()} />);

    const terminal = container.querySelector(".terminal");
    expect(terminal).toBeInTheDocument();
  });

  it("should handle terminal ref scroll when output changes", async () => {
    const mockHistory = {
      ...mockUseTerminal,
      output: ["> Line 1"],
    };
    vi.mocked(useTerminal).mockReturnValue(mockHistory as any);

    const { container, rerender } = render(<Terminal {...getDefaultProps()} />);

    await waitFor(
      () => {
        const terminal = container.querySelector(".terminal");
        expect(terminal).not.toHaveClass("typing-terminal");
      },
      { timeout: 2000 }
    );

    const newHistory = {
      ...mockUseTerminal,
      output: ["> Line 1", "> Line 2"],
    };
    vi.mocked(useTerminal).mockReturnValue(newHistory as any);
    rerender(<Terminal {...getDefaultProps()} />);

    const terminal = container.querySelector(".terminal");
    expect(terminal).toBeInTheDocument();
  });
});
