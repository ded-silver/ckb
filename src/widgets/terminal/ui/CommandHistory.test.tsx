import { getVirusState } from "@features/virus/model";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { CommandHistory } from "./CommandHistory";
import type { UserInfo } from "../../../types";

vi.mock("@features/virus/model", () => ({
  getVirusState: vi.fn(() => null),
}));

vi.mock("@shared/lib/textCorruption", () => ({
  corruptRandomChars: vi.fn((text: string) => text),
}));

describe("CommandHistory", () => {
  const defaultUserInfo: UserInfo = { username: "user", hostname: "host" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getVirusState).mockReturnValue(null);
  });

  it("should render empty history", () => {
    render(<CommandHistory commandHistory={[]} userInfo={defaultUserInfo} />);

    const container = document.querySelector(".command-history");
    expect(container).toBeInTheDocument();
  });

  it("should render command history entries", () => {
    const history = [
      { command: "help", output: ["Help text"], isError: false },
      { command: "ls", output: ["file.txt"], isError: false },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    expect(screen.getByText("help")).toBeInTheDocument();
    expect(screen.getByText("ls")).toBeInTheDocument();
  });

  it("should display command output", () => {
    const history = [
      {
        command: "cat file.txt",
        output: ["Line 1", "Line 2", "Line 3"],
        isError: false,
      },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    expect(screen.getByText("Line 1")).toBeInTheDocument();
    expect(screen.getByText("Line 2")).toBeInTheDocument();
    expect(screen.getByText("Line 3")).toBeInTheDocument();
  });

  it("should display error commands with error styling", () => {
    const history = [
      {
        command: "invalid",
        output: ["Command not found"],
        isError: true,
      },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    const outputLine = screen.getByText("Command not found");
    expect(outputLine).toHaveClass("error");
  });

  it("should display prompt with user info", () => {
    const history = [{ command: "help", output: ["Help"], isError: false }];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    expect(screen.getByText("user@host:~$")).toBeInTheDocument();
  });

  it("should handle different user info", () => {
    const customUserInfo: UserInfo = { username: "admin", hostname: "server" };
    const history = [{ command: "whoami", output: ["admin"], isError: false }];

    render(<CommandHistory commandHistory={history} userInfo={customUserInfo} />);

    expect(screen.getByText("admin@server:~$")).toBeInTheDocument();
  });

  it("should render multiple command entries", () => {
    const history = [
      { command: "cmd1", output: ["Output 1"], isError: false },
      { command: "cmd2", output: ["Output 2"], isError: false },
      { command: "cmd3", output: ["Output 3"], isError: false },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    expect(screen.getByText("cmd1")).toBeInTheDocument();
    expect(screen.getByText("cmd2")).toBeInTheDocument();
    expect(screen.getByText("cmd3")).toBeInTheDocument();
  });

  it("should handle empty output", () => {
    const history = [{ command: "clear", output: [], isError: false }];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    expect(screen.getByText("clear")).toBeInTheDocument();
  });

  it("should handle command with multiple output lines", () => {
    const history = [
      {
        command: "ls -la",
        output: [
          "total 24",
          "drwxr-xr-x  3 user user 4096 Jan  1 00:00 .",
          "drwxr-xr-x  3 user user 4096 Jan  1 00:00 ..",
          "-rw-r--r--  1 user user 1024 Jan  1 00:00 file.txt",
        ],
        isError: false,
      },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    expect(screen.getByText("total 24")).toBeInTheDocument();
    expect(screen.getByText(/-rw-r--r--.*file\.txt/)).toBeInTheDocument();
  });

  it("should handle mixed error and success commands", () => {
    const history = [
      { command: "help", output: ["Help"], isError: false },
      { command: "invalid", output: ["Error"], isError: true },
      { command: "ls", output: ["files"], isError: false },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    const outputLines = document.querySelectorAll(".output-line");
    expect(outputLines[0]).not.toHaveClass("error");
    expect(outputLines[1]).toHaveClass("error");
    expect(outputLines[2]).not.toHaveClass("error");
  });

  it("should update virus state on interval", async () => {
    const history = [{ command: "help", output: ["Help"], isError: false }];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    expect(getVirusState).toHaveBeenCalled();

    await waitFor(
      () => {
        expect(getVirusState).toHaveBeenCalledTimes(2);
      },
      { timeout: 200 }
    );
  });

  it("should apply corruption when virus is active", async () => {
    const { corruptRandomChars } = await import("@shared/lib/textCorruption");
    vi.mocked(getVirusState).mockReturnValue({
      isInfected: true,
      virusType: "corruption",
    } as any);

    const history = [{ command: "help", output: ["Help text"], isError: false }];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    expect(vi.mocked(corruptRandomChars)).toHaveBeenCalled();
  });

  it("should not apply corruption when virus is not active", () => {
    vi.mocked(getVirusState).mockReturnValue({
      isInfected: false,
      virusType: null,
    } as any);

    const history = [{ command: "help", output: ["Help text"], isError: false }];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    const outputLine = screen.getByText("Help text");
    expect(outputLine).toBeInTheDocument();
  });

  it("should display progress bar when progress is defined", () => {
    const history = [
      {
        command: "download",
        output: ["Downloading..."],
        isError: false,
        progress: 50,
      },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    const progressText = screen.getByText("50%");
    expect(progressText).toBeInTheDocument();
  });

  it("should display warning styling for warning lines", () => {
    const history = [
      {
        command: "test",
        output: ["Warning: Something went wrong"],
        isError: false,
      },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    const outputLine = screen.getByText("Warning: Something went wrong");
    expect(outputLine).toHaveClass("warning");
  });

  it("should display success styling for success lines", () => {
    const history = [
      {
        command: "test",
        output: ["File created successfully"],
        isError: false,
      },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    const outputLine = screen.getByText("File created successfully");
    expect(outputLine).toHaveClass("success");
  });

  it("should apply animated class when entry.isAnimated is true", () => {
    const history = [
      {
        command: "test",
        output: ["Animated output"],
        isError: false,
        isAnimated: true,
      },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    const outputContainer = document.querySelector(".command-output");
    expect(outputContainer).toHaveClass("animated");
  });

  it("should not apply animated class when entry.isAnimated is false", () => {
    const history = [
      {
        command: "test",
        output: ["Normal output"],
        isError: false,
        isAnimated: false,
      },
    ];

    render(<CommandHistory commandHistory={history} userInfo={defaultUserInfo} />);

    const outputContainer = document.querySelector(".command-output");
    expect(outputContainer).not.toHaveClass("animated");
  });
});
