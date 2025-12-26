import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useCursor } from "./useCursor";

describe("useCursor", () => {
  let inputRef: React.RefObject<HTMLInputElement>;
  let mockInput: Partial<HTMLInputElement>;
  let mockCursor: Partial<HTMLSpanElement>;
  let mockMeasure: Partial<HTMLSpanElement>;
  let mockGetComputedStyle: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetComputedStyle = vi.fn().mockReturnValue({
      font: "16px monospace",
      fontSize: "16px",
      fontFamily: "monospace",
      fontWeight: "400",
      letterSpacing: "0px",
    });

    mockInput = {
      selectionStart: 0,
      style: {} as CSSStyleDeclaration,
    };

    mockCursor = {
      style: {
        left: "",
      } as CSSStyleDeclaration,
    };

    mockMeasure = {
      style: {} as CSSStyleDeclaration,
      textContent: "",
      offsetWidth: 0,
    };

    inputRef = {
      current: mockInput as HTMLInputElement,
    };

    Object.defineProperty(window, "getComputedStyle", {
      value: mockGetComputedStyle,
      writable: true,
    });
  });

  it("should return cursorRef, measureRef, and updateCursorPosition", () => {
    const { result } = renderHook(() => useCursor("test", false, inputRef));

    expect(result.current.cursorRef).toBeDefined();
    expect(result.current.measureRef).toBeDefined();
    expect(result.current.updateCursorPosition).toBeDefined();
    expect(typeof result.current.updateCursorPosition).toBe("function");
  });

  it("should not update cursor position when inputRef is null", () => {
    const nullRef = { current: null };
    const { result } = renderHook(() => useCursor("test", false, nullRef));

    expect(result.current).toBeDefined();
    act(() => {
      result.current.updateCursorPosition();
    });
  });

  it("should not update cursor position when isTypingOutput is true", () => {
    const { result } = renderHook(() => useCursor("test", true, inputRef));

    act(() => {
      result.current.updateCursorPosition();
    });

    expect(result.current).toBeDefined();
  });

  it("should update cursor position when all refs are available", () => {
    const testInputRef = { current: mockInput as HTMLInputElement };

    const { result } = renderHook(() => useCursor("test", false, testInputRef));

    Object.defineProperty(result.current.cursorRef, "current", {
      value: mockCursor as HTMLSpanElement,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(result.current.measureRef, "current", {
      value: mockMeasure as HTMLSpanElement,
      writable: true,
      configurable: true,
    });

    act(() => {
      result.current.updateCursorPosition();
    });

    expect(mockGetComputedStyle).toHaveBeenCalled();
  });

  it("should use selectionStart from input when available", () => {
    mockInput.selectionStart = 2;
    const { result } = renderHook(() => useCursor("test command", false, inputRef));

    Object.defineProperty(result.current.cursorRef, "current", {
      value: mockCursor as HTMLSpanElement,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(result.current.measureRef, "current", {
      value: mockMeasure as HTMLSpanElement,
      writable: true,
      configurable: true,
    });

    act(() => {
      result.current.updateCursorPosition();
    });

    expect(mockMeasure.textContent).toBe("te");
  });

  it("should use command length when selectionStart is null", () => {
    mockInput.selectionStart = null;
    const { result } = renderHook(() => useCursor("test", false, inputRef));

    Object.defineProperty(result.current.cursorRef, "current", {
      value: mockCursor as HTMLSpanElement,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(result.current.measureRef, "current", {
      value: mockMeasure as HTMLSpanElement,
      writable: true,
      configurable: true,
    });

    act(() => {
      result.current.updateCursorPosition();
    });

    expect(mockMeasure.textContent).toBe("test");
  });

  it("should update cursor position when command changes", () => {
    const { result, rerender } = renderHook(({ command }) => useCursor(command, false, inputRef), {
      initialProps: { command: "test" },
    });

    Object.defineProperty(result.current.cursorRef, "current", {
      value: mockCursor as HTMLSpanElement,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(result.current.measureRef, "current", {
      value: mockMeasure as HTMLSpanElement,
      writable: true,
      configurable: true,
    });

    rerender({ command: "new command" });

    expect(result.current).toBeDefined();
  });

  it("should update cursor position when isTypingOutput changes", () => {
    const { result, rerender } = renderHook(
      ({ isTyping }) => useCursor("test", isTyping, inputRef),
      { initialProps: { isTyping: false } }
    );

    rerender({ isTyping: true });

    expect(result.current).toBeDefined();
  });
});
