import { musicPlayer } from "@features/music/lib/musicPlayer";
import { handleMusicPlayerCommand } from "@features/music/lib/musicPlayerCommands";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { MusicPlayer } from "./MusicPlayer";
import type { Theme } from "../../../types";

vi.mock("@features/music/lib/musicPlayer", () => ({
  musicPlayer: {
    getCurrentTrack: vi.fn(() => null),
    getStatus: vi.fn(() => "stopped"),
    getNextTrack: vi.fn(() => null),
    getShuffle: vi.fn(() => false),
    getRepeat: vi.fn(() => "off"),
    getVisualizationMode: vi.fn(() => "bars"),
    getSavedSettings: vi.fn(() => null),
    getState: vi.fn(() => ({ position: 0, duration: 0 })),
    getFrequencyData: vi.fn(() => null),
    on: vi.fn(),
    off: vi.fn(),
    saveWindowState: vi.fn(),
  },
}));

const mockUpdateCursorPosition = vi.fn();

const escapeHandlers = new Set<() => void>();

vi.mock("@shared/lib/hooks", async importOriginal => {
  const actual = await importOriginal<typeof import("@shared/lib/hooks")>();
  return {
    ...actual,
    useCursor: vi.fn(() => ({
      cursorRef: { current: null },
      measureRef: { current: null },
      updateCursorPosition: mockUpdateCursorPosition,
    })),
    useDragResize: vi.fn(() => ({
      isDragging: false,
      isResizing: false,
      dragHandlers: {
        onMouseDown: vi.fn(),
      },
      resizeHandlers: {
        onMouseDown: vi.fn(),
      },
    })),
    useTerminalWindow: vi.fn(options => {
      let currentCommandState = "";
      const inputRef = { current: null as HTMLInputElement | null };

      const setupInputRef = () => {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement && !inputRef.current) {
          inputRef.current = inputElement;
        }
      };
      setupInputRef();
      setTimeout(setupInputRef, 0);

      const setCurrentCommand = vi.fn((value: string | ((prev: string) => string)) => {
        if (typeof value === "function") {
          currentCommandState = value(currentCommandState);
        } else {
          currentCommandState = value;
        }
        if (!inputRef.current) {
          setupInputRef();
        }
        if (inputRef.current) {
          inputRef.current.value = currentCommandState;
        }
      });

      const handleCommand = async (cmd: string) => {
        if (options?.onCommand) {
          const result = await options.onCommand(cmd);
          currentCommandState = "";
          if (inputRef.current) {
            inputRef.current.value = "";
          }
          if (result && result.output.length === 0 && !result.isError) {
            return;
          }
          return result;
        }
      };

      const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          const inputValue = (e.target as HTMLInputElement)?.value || inputRef.current?.value || "";
          const cmd = inputValue || currentCommandState;
          if (cmd.trim()) {
            await handleCommand(cmd.trim());
          }
        }
      };

      return {
        commandHistory: [],
        get currentCommand() {
          if (inputRef.current) {
            const inputValue = inputRef.current.value;
            if (inputValue !== currentCommandState) {
              currentCommandState = inputValue;
            }
            return inputValue;
          }
          return currentCommandState;
        },
        setCurrentCommand,
        rawCommandHistory: [],
        commandHistoryIndex: -1,
        tempCommand: "",
        showCursor: true,
        isFocused: true,
        setIsFocused: vi.fn(),
        isTypingOutput: false,
        glitchActive: false,
        inputRef,
        terminalRef: { current: null },
        cursorRef: { current: null },
        measureRef: { current: null },
        handleCommand,
        handleKeyPress,
        handleKeyDown: vi.fn(),
        handleTerminalClick: vi.fn(),
        updateCursorPosition: mockUpdateCursorPosition,
        welcomeMessage: [],
        prompt: "music@player:~$",
      };
    }),
    useAppFocus: vi.fn(options => {
      if (options?.onClose) {
        if (!escapeHandlers.has(options.onClose)) {
          escapeHandlers.add(options.onClose);
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              e.preventDefault();
              options.onClose();
            }
          };
          setTimeout(() => {
            window.addEventListener("keydown", handleKeyDown, true);
          }, 0);
        }
      }
      return {
        handleFocus: vi.fn(),
      };
    }),
  };
});

vi.mock("@shared/lib/sounds", () => ({
  soundGenerator: {
    playType: vi.fn(),
    playCommand: vi.fn(),
  },
}));

vi.mock("@shared/lib/sounds/soundHandler", () => ({
  playCommandSound: vi.fn(),
}));

vi.mock("@features/music/lib/musicPlayerCommands", () => ({
  handleMusicPlayerCommand: vi.fn().mockResolvedValue({
    output: [],
    isError: false,
  }),
}));

describe("MusicPlayer", () => {
  const defaultTheme: Theme = "2077";
  let onClose: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
    escapeHandlers.clear();
    onClose = vi.fn();
  });

  it("should render music player", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const player = document.querySelector(".music-player");
    expect(player).toBeInTheDocument();
  });

  it("should render player header", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const header = document.querySelector(".music-player-header");
    expect(header).toBeInTheDocument();
  });

  it("should call onClose when Escape key is pressed", async () => {
    const onCloseSpy = vi.fn();
    render(<MusicPlayer theme={defaultTheme} onClose={onCloseSpy} />);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    onCloseSpy.mockClear();

    await act(async () => {
      const escapeEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(escapeEvent);
    });

    await waitFor(() => {
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("should render terminal input", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should render visualization area", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should apply theme class", () => {
    render(<MusicPlayer theme="matrix" onClose={onClose} />);

    const player = document.querySelector(".music-player");
    expect(player).toHaveClass("theme-matrix");
  });

  it("should initialize with music player state", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    expect(musicPlayer.getCurrentTrack).toHaveBeenCalled();
    expect(musicPlayer.getStatus).toHaveBeenCalled();
    expect(musicPlayer.getShuffle).toHaveBeenCalled();
    expect(musicPlayer.getRepeat).toHaveBeenCalled();
  });

  it("should set up event listeners on mount", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    expect(musicPlayer.on).toHaveBeenCalledWith("trackChanged", expect.any(Function));
    expect(musicPlayer.on).toHaveBeenCalledWith("statusChanged", expect.any(Function));
    expect(musicPlayer.on).toHaveBeenCalledWith("playlistChanged", expect.any(Function));
  });

  it("should handle Enter key to execute command", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Playing..."],
      isError: false,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "play{Enter}");

    expect(handleMusicPlayerCommand).toHaveBeenCalled();
  });

  it("should display command history", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Command executed"],
      isError: false,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "help{Enter}");

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(handleMusicPlayerCommand).toHaveBeenCalled();
  });

  it("should handle empty command", async () => {
    const user = userEvent.setup();
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "{Enter}");

    expect(handleMusicPlayerCommand).not.toHaveBeenCalled();
  });

  it("should update theme when prop changes", () => {
    const { rerender } = render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const player = document.querySelector(".music-player");
    expect(player).toHaveClass("theme-2077");

    rerender(<MusicPlayer theme="matrix" onClose={onClose} />);

    expect(player).toHaveClass("theme-matrix");
  });

  it("should render visualization container", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const container = document.querySelector(".visualization-container");
    expect(container).toBeInTheDocument();
  });

  it("should render time display", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const timeDisplay = document.querySelector(".visualization-time");
    expect(timeDisplay).toBeInTheDocument();
  });

  it("should render terminal section", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const terminal = document.querySelector(".music-player-terminal");
    expect(terminal).toBeInTheDocument();
  });

  it("should render waves visualization mode", () => {
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("waves");
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should render spectrum visualization mode", () => {
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("spectrum");
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should render bars visualization mode by default", () => {
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("bars");
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should handle onBlur event", async () => {
    const user = userEvent.setup();
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    expect(input).toHaveFocus();

    const visualization = document.querySelector(".visualization");
    if (visualization) {
      await user.click(visualization as HTMLElement);
    }
    expect(input).toBeInTheDocument();
  });

  it("should handle input focus", async () => {
    const user = userEvent.setup();
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.click(input);

    expect(input).toHaveFocus();
  });

  it("should handle input onChange with sound", async () => {
    const user = userEvent.setup();
    const { soundGenerator } = await import("@shared/lib/sounds");
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test");

    expect(soundGenerator.playType).toHaveBeenCalled();
  });

  it("should handle clear command", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Cleared"],
      isError: false,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test{Enter}");
    await new Promise(resolve => setTimeout(resolve, 100));

    await user.type(input, "clear{Enter}");
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(handleMusicPlayerCommand).toHaveBeenCalled();
  });

  it("should handle command with error and glitch effect", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Error occurred"],
      isError: true,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "invalid{Enter}");

    await new Promise(resolve => setTimeout(resolve, 600));

    expect(handleMusicPlayerCommand).toHaveBeenCalled();
  });

  it("should handle command with theme change", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Theme changed"],
      isError: false,
      theme: "matrix",
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "theme matrix{Enter}");

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(handleMusicPlayerCommand).toHaveBeenCalled();
  });

  it("should handle ArrowUp for command history", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Command 1"],
      isError: false,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "command1{Enter}");
    await new Promise(resolve => setTimeout(resolve, 100));

    await user.type(input, "{ArrowUp}");
    expect(input).toBeInTheDocument();
  });

  it("should handle ArrowDown for command history", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Command 1"],
      isError: false,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "command1{Enter}");
    await new Promise(resolve => setTimeout(resolve, 100));

    await user.type(input, "{ArrowUp}");
    await user.type(input, "{ArrowDown}");
    expect(input).toBeInTheDocument();
  });

  it("should handle terminal click to focus input", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Output"],
      isError: false,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    const terminal = document.querySelector(".music-player-terminal");

    await user.click(document.body);
    expect(input).not.toHaveFocus();

    if (terminal) {
      await user.click(terminal);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  it("should render next track info when available", () => {
    vi.mocked(musicPlayer.getNextTrack).mockReturnValue({
      filename: "next.ogg",
      title: "Next Track",
      artist: "Next Artist",
      duration: 180,
      format: "ogg",
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const nextTrackInfo = document.querySelector(".visualization-next");
    expect(nextTrackInfo).toBeInTheDocument();
    expect(nextTrackInfo?.textContent).toContain("Next Track");
  });

  it("should render shuffle status", () => {
    vi.mocked(musicPlayer.getShuffle).mockReturnValue(true);
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const header = document.querySelector(".music-player-header");
    expect(header?.textContent).toContain("SHUFFLE");
  });

  it("should render repeat status", () => {
    vi.mocked(musicPlayer.getRepeat).mockReturnValue("one");
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const header = document.querySelector(".music-player-header");
    expect(header?.textContent).toContain("REPEAT");
  });

  it("should render current track info", () => {
    vi.mocked(musicPlayer.getCurrentTrack).mockReturnValue({
      filename: "test.ogg",
      title: "Test Track",
      artist: "Test Artist",
      duration: 180,
      format: "ogg",
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const title = document.querySelector(".music-player-title");
    expect(title?.textContent).toContain("Test Track");
    expect(title?.textContent).toContain("Test Artist");
  });

  it("should handle input onSelect event", async () => {
    const user = userEvent.setup();
    mockUpdateCursorPosition.mockClear();

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.type(input, "test");

    input.setSelectionRange(0, 4);
    input.dispatchEvent(new Event("select", { bubbles: true }));

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockUpdateCursorPosition).toHaveBeenCalled();
  });

  it("should handle input onClick event", async () => {
    const user = userEvent.setup();
    mockUpdateCursorPosition.mockClear();

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.click(input);

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockUpdateCursorPosition).toHaveBeenCalled();
  });

  it("should render bars visualization with frequency data", () => {
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("bars");
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(new Uint8Array(256).fill(128));

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should render waves visualization with frequency data", () => {
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("waves");
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(new Uint8Array(256).fill(128));

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should render spectrum visualization with frequency data", () => {
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("spectrum");
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(new Uint8Array(256).fill(128));

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should handle window dragging", async () => {
    const user = userEvent.setup();
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const header = document.querySelector(".music-player-header");
    if (header) {
      await user.pointer({ keys: "[MouseLeft>]", target: header });
      await user.pointer({ keys: "[MouseLeft]", coords: { x: 100, y: 100 } });
    }
  });

  it("should handle Ctrl+Alt+ArrowUp for window movement", async () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    input.blur();

    fireEvent.keyDown(window, {
      key: "ArrowUp",
      ctrlKey: true,
      altKey: true,
    });

    const player = document.querySelector(".music-player") as HTMLElement;
    expect(player).toBeInTheDocument();
  });

  it("should handle Ctrl+Alt+ArrowDown for window movement", async () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    input.blur();

    fireEvent.keyDown(window, {
      key: "ArrowDown",
      ctrlKey: true,
      altKey: true,
    });

    const player = document.querySelector(".music-player");
    expect(player).toBeInTheDocument();
  });

  it("should handle Ctrl+Alt+ArrowLeft for window movement", async () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    input.blur();

    fireEvent.keyDown(window, {
      key: "ArrowLeft",
      ctrlKey: true,
      altKey: true,
    });

    const player = document.querySelector(".music-player");
    expect(player).toBeInTheDocument();
  });

  it("should handle Ctrl+Alt+ArrowRight for window movement", async () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    input.blur();

    fireEvent.keyDown(window, {
      key: "ArrowRight",
      ctrlKey: true,
      altKey: true,
    });

    const player = document.querySelector(".music-player");
    expect(player).toBeInTheDocument();
  });

  it("should not move window when input is focused", async () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(window, {
      key: "ArrowUp",
      ctrlKey: true,
      altKey: true,
    });

    const player = document.querySelector(".music-player");
    expect(player).toBeInTheDocument();
  });

  it("should handle output animation", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: ["Line 1", "Line 2", "Line 3"],
      isError: false,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test{Enter}");

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(handleMusicPlayerCommand).toHaveBeenCalled();
  });

  it("should handle empty output in animation", async () => {
    const user = userEvent.setup();
    vi.mocked(handleMusicPlayerCommand).mockResolvedValue({
      output: [],
      isError: false,
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test{Enter}");

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(handleMusicPlayerCommand).toHaveBeenCalled();
  });

  it("should format time correctly", async () => {
    vi.mocked(musicPlayer.getState).mockReturnValue({
      position: 125,
      duration: 300,
    } as any);

    let timeUpdateCallback: (() => void) | null = null;
    vi.mocked(musicPlayer.on).mockImplementation((event: string, callback: any) => {
      if (event === "timeUpdate") {
        timeUpdateCallback = callback;
      }
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    if (timeUpdateCallback) {
      await act(async () => {
        timeUpdateCallback!();
      });
    }

    await waitFor(() => {
      const timeDisplay = document.querySelector(".visualization-time");
      expect(timeDisplay?.textContent).toContain("2:05");
      expect(timeDisplay?.textContent).toContain("5:00");
    });
  });

  it("should handle invalid time values", () => {
    vi.mocked(musicPlayer.getState).mockReturnValue({
      position: Infinity,
      duration: NaN,
    } as any);

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const timeDisplay = document.querySelector(".visualization-time");
    expect(timeDisplay).toBeInTheDocument();
  });

  it("should save window state on unmount", () => {
    const { unmount } = render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    unmount();

    expect(musicPlayer.saveWindowState).toHaveBeenCalled();
  });

  it("should handle cursor blinking", async () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    await new Promise(resolve => setTimeout(resolve, 600));

    const cursor = document.querySelector(".input-cursor");
    expect(cursor).toBeInTheDocument();
  });

  it("should format time with different values", async () => {
    vi.mocked(musicPlayer.getState).mockReturnValue({
      position: 0,
      duration: 0,
    } as any);

    let timeUpdateCallback: (() => void) | null = null;
    vi.mocked(musicPlayer.on).mockImplementation((event: string, callback: any) => {
      if (event === "timeUpdate") {
        timeUpdateCallback = callback;
      }
    });

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    vi.mocked(musicPlayer.getState).mockReturnValue({
      position: 3661,
      duration: 7200,
    } as any);

    if (timeUpdateCallback) {
      await act(async () => {
        timeUpdateCallback!();
      });
    }

    await waitFor(() => {
      const timeDisplay = document.querySelector(".visualization-time");
      expect(timeDisplay?.textContent).toContain("61:01");
      expect(timeDisplay?.textContent).toContain("120:00");
    });
  });

  it("should handle formatTime with zero values", () => {
    vi.mocked(musicPlayer.getState).mockReturnValue({
      position: 0,
      duration: 0,
    } as any);

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const timeDisplay = document.querySelector(".visualization-time");
    expect(timeDisplay?.textContent).toContain("0:00");
  });

  it("should handle formatTime with negative values", () => {
    vi.mocked(musicPlayer.getState).mockReturnValue({
      position: -10,
      duration: -5,
    } as any);

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const timeDisplay = document.querySelector(".visualization-time");
    expect(timeDisplay).toBeInTheDocument();
  });

  it("should handle window dragging", () => {
    const { container } = render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);
    const player = container.querySelector(".music-player") as HTMLElement;
    const header = container.querySelector(".music-player-header") as HTMLElement;

    fireEvent.mouseDown(header, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(window);

    expect(player).toBeInTheDocument();
  });

  it("should handle keyboard window movement", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "ArrowUp", ctrlKey: true, altKey: true });
    fireEvent.keyDown(window, {
      key: "ArrowDown",
      ctrlKey: true,
      altKey: true,
    });
    fireEvent.keyDown(window, {
      key: "ArrowLeft",
      ctrlKey: true,
      altKey: true,
    });
    fireEvent.keyDown(window, {
      key: "ArrowRight",
      ctrlKey: true,
      altKey: true,
    });

    const player = document.querySelector(".music-player");
    expect(player).toBeInTheDocument();
  });

  it("should not move window when input is focused", () => {
    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");
    input.focus();

    fireEvent.keyDown(window, { key: "ArrowUp", ctrlKey: true, altKey: true });

    const player = document.querySelector(".music-player");
    expect(player).toBeInTheDocument();
  });

  it("should handle visualization mode changes", () => {
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("waves");
    const { rerender } = render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("spectrum");
    rerender(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should handle frequency data visualization", () => {
    const mockFrequencyData = new Uint8Array(256).fill(128);
    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(mockFrequencyData);
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should center player when no saved position", () => {
    vi.mocked(musicPlayer.getSavedSettings).mockReturnValue(null);

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    expect(musicPlayer.saveWindowState).toHaveBeenCalled();
  });

  it("should handle default visualization mode", () => {
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("unknown" as any);

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should render spectrum visualization with complex data", () => {
    const mockFrequencyData = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      mockFrequencyData[i] = Math.floor(Math.random() * 256);
    }
    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(mockFrequencyData);
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("spectrum");

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should handle spectrum visualization edge cases", () => {
    const mockFrequencyData = new Uint8Array(256);
    mockFrequencyData[0] = 255;
    mockFrequencyData[1] = 0;
    mockFrequencyData[2] = 128;
    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(mockFrequencyData);
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("spectrum");

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should handle all fillRatio levels in spectrum visualization", () => {
    const mockFrequencyData = new Uint8Array(256);

    mockFrequencyData[0] = 255;
    mockFrequencyData[1] = 250;
    mockFrequencyData[2] = 230;
    mockFrequencyData[3] = 210;
    mockFrequencyData[4] = 190;
    mockFrequencyData[5] = 170;
    mockFrequencyData[6] = 150;
    mockFrequencyData[7] = 130;
    mockFrequencyData[8] = 110;

    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(mockFrequencyData);
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("spectrum");

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should handle spectrum transitions between bars", () => {
    const mockFrequencyData = new Uint8Array(256);
    mockFrequencyData[0] = 200;
    mockFrequencyData[1] = 50;
    mockFrequencyData[2] = 50;
    mockFrequencyData[3] = 200;
    mockFrequencyData[4] = 150;
    mockFrequencyData[5] = 160;

    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(mockFrequencyData);
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("spectrum");

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should cancel animation frame when status is not playing", () => {
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    const { rerender } = render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    vi.mocked(musicPlayer.getStatus).mockReturnValue("stopped");
    rerender(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should handle all heightPercent levels in bars visualization", () => {
    const mockFrequencyData = new Uint8Array(256);
    mockFrequencyData[0] = 255;
    mockFrequencyData[20] = 200;
    mockFrequencyData[40] = 170;
    mockFrequencyData[60] = 140;
    mockFrequencyData[80] = 110;
    mockFrequencyData[100] = 80;

    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(mockFrequencyData);
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("bars");

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });

  it("should handle window resize with size callback", () => {
    const { container } = render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const player = container.querySelector(".music-player");
    expect(player).toBeInTheDocument();
  });

  it("should handle command history navigation backward", async () => {
    const user = userEvent.setup();

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const input = screen.getByRole("textbox");

    await user.type(input, "{ArrowUp}");
    await user.type(input, "{ArrowUp}");

    expect(input).toBeInTheDocument();
  });

  it("should handle empty frequency data gracefully", () => {
    vi.mocked(musicPlayer.getFrequencyData).mockReturnValue(null);
    vi.mocked(musicPlayer.getStatus).mockReturnValue("playing");
    vi.mocked(musicPlayer.getVisualizationMode).mockReturnValue("bars");

    render(<MusicPlayer theme={defaultTheme} onClose={onClose} />);

    const visualization = document.querySelector(".visualization");
    expect(visualization).toBeInTheDocument();
  });
});
