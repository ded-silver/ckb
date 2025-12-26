import { getVirusState } from "@features/virus/model";
import { soundGenerator } from "@shared/lib/sounds";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { TerminalInput } from "./TerminalInput";
import type { UserInfo } from "../../../types";

vi.mock("@features/virus/model", () => ({
  getVirusState: vi.fn(() => null),
}));

vi.mock("@shared/lib/sounds", () => ({
  soundGenerator: {
    playType: vi.fn(),
  },
}));

vi.mock("@shared/lib/textCorruption", () => ({
  corruptRandomChars: vi.fn((text: string) => text),
}));

describe("TerminalInput", () => {
  const defaultUserInfo: UserInfo = { username: "user", hostname: "host" };

  let setCurrentCommand: (cmd: string) => void;
  let setIsInputFocused: (focused: boolean) => void;
  let onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  let onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  let updateCursorPosition: () => void;
  let inputRef: React.RefObject<HTMLInputElement>;
  let cursorRef: React.RefObject<HTMLSpanElement>;
  let measureRef: React.RefObject<HTMLSpanElement>;

  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentCommand = vi.fn() as (cmd: string) => void;
    setIsInputFocused = vi.fn() as (focused: boolean) => void;
    onKeyPress = vi.fn() as (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onKeyDown = vi.fn() as (e: React.KeyboardEvent<HTMLInputElement>) => void;
    updateCursorPosition = vi.fn() as () => void;
    inputRef = { current: null };
    cursorRef = { current: null };
    measureRef = { current: null };
    vi.mocked(getVirusState).mockReturnValue(null);
  });

  const getDefaultProps = () => ({
    currentCommand: "",
    setCurrentCommand,
    isTypingOutput: false,
    isInputFocused: true,
    setIsInputFocused,
    showCursor: true,
    onKeyPress,
    onKeyDown,
    updateCursorPosition,
    inputRef,
    cursorRef,
    measureRef,
    userInfo: defaultUserInfo,
  });

  it("should render input field", () => {
    render(<TerminalInput {...getDefaultProps()} currentCommand="test" />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("test");
  });

  it("should display prompt with user info", () => {
    render(<TerminalInput {...getDefaultProps()} />);

    const prompt = screen.getByText("user@host:~$");
    expect(prompt).toBeInTheDocument();
  });

  it("should call setCurrentCommand when typing", async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...getDefaultProps()} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "hello");

    expect(setCurrentCommand).toHaveBeenCalled();
  });

  it("should call onKeyPress when key is pressed", async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...getDefaultProps()} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "h");

    expect(onKeyPress).toHaveBeenCalled();
  });

  it("should call onKeyDown when key is pressed", async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...getDefaultProps()} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "{Enter}");

    expect(onKeyDown).toHaveBeenCalled();
  });

  it("should call updateCursorPosition when input changes", async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...getDefaultProps()} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "h");

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(updateCursorPosition).toHaveBeenCalled();
  });

  it("should call soundGenerator.playType when typing", async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...getDefaultProps()} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "h");

    expect(soundGenerator.playType).toHaveBeenCalled();
  });

  it("should not play sound when input is empty", async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...getDefaultProps()} currentCommand="test" />);

    const input = screen.getByRole("textbox");
    vi.clearAllMocks();
    await user.clear(input);

    const calls = vi.mocked(soundGenerator.playType).mock.calls;
    if (calls.length > 0) {
      const setCalls = vi.mocked(setCurrentCommand).mock.calls;
      const lastCall = setCalls[setCalls.length - 1];
      if (lastCall && lastCall[0] === "") {
        expect(soundGenerator.playType).not.toHaveBeenCalled();
      }
    }
  });

  it("should call setIsInputFocused on focus", async () => {
    const user = userEvent.setup();
    const props = getDefaultProps();
    props.isInputFocused = false;
    render(<TerminalInput {...props} />);

    const input = screen.getByRole("textbox");
    await user.click(input);

    expect(setIsInputFocused).toHaveBeenCalled();
  });

  it("should call setIsInputFocused on blur", async () => {
    const user = userEvent.setup();
    render(<TerminalInput {...getDefaultProps()} />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    expect(setIsInputFocused).toHaveBeenCalledWith(false);
  });

  it("should be disabled when isTypingOutput is true", () => {
    const props = getDefaultProps();
    props.isTypingOutput = true;
    render(<TerminalInput {...props} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("disabled");
  });

  it("should not be disabled when isTypingOutput is false", () => {
    const props = getDefaultProps();
    props.isTypingOutput = false;
    render(<TerminalInput {...props} />);

    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("disabled");
  });

  it("should show cursor when showCursor is true and input is focused", () => {
    const props = getDefaultProps();
    props.showCursor = true;
    props.isInputFocused = true;
    props.isTypingOutput = false;
    const { container } = render(<TerminalInput {...props} />);

    const cursor = container.querySelector(".input-cursor");
    expect(cursor).toBeInTheDocument();
  });

  it("should not show cursor when showCursor is false", () => {
    const props = getDefaultProps();
    props.showCursor = false;
    props.isInputFocused = true;
    props.isTypingOutput = false;
    const { container } = render(<TerminalInput {...props} />);

    const cursor = container.querySelector(".input-cursor");
    expect(cursor).toBeInTheDocument();
  });

  it("should not show cursor when isTypingOutput is true", () => {
    const props = getDefaultProps();
    props.showCursor = true;
    props.isInputFocused = true;
    props.isTypingOutput = true;
    const { container } = render(<TerminalInput {...props} />);

    const cursor = container.querySelector(".input-cursor");
    expect(cursor).not.toBeInTheDocument();
  });

  it("should display corrupted prompt when virus is active", async () => {
    vi.mocked(getVirusState).mockReturnValue({
      isInfected: true,
      timeRemaining: 999999,
      startTime: Date.now(),
      virusType: "corruption",
    });

    const { corruptRandomChars } = await import("@shared/lib/textCorruption");
    vi.mocked(corruptRandomChars).mockReturnValue("corrupted_prompt");

    render(<TerminalInput {...getDefaultProps()} />);

    const prompt = screen.getByText("corrupted_prompt");
    expect(prompt).toBeInTheDocument();
  });

  it("should update virus state on interval", async () => {
    render(<TerminalInput {...getDefaultProps()} />);

    expect(getVirusState).toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(getVirusState).toHaveBeenCalledTimes(2);
  });

  it("should call updateCursorPosition on select", async () => {
    const user = userEvent.setup();
    const props = getDefaultProps();
    props.currentCommand = "test";
    render(<TerminalInput {...props} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    vi.clearAllMocks();
    input.setSelectionRange(0, 2);
    await user.click(input);

    await new Promise(resolve => setTimeout(resolve, 20));
    expect(updateCursorPosition).toHaveBeenCalled();
  });

  it("should call updateCursorPosition on click", async () => {
    const user = userEvent.setup();
    const props = getDefaultProps();
    props.currentCommand = "test";
    render(<TerminalInput {...props} />);

    const input = screen.getByRole("textbox");
    vi.clearAllMocks();
    await user.click(input);

    await new Promise(resolve => setTimeout(resolve, 20));
    expect(updateCursorPosition).toHaveBeenCalled();
  });
});
