import type { CommandContext } from "@entities/command/types";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { executeCommand } from "./commandExecutor";

import { getDestroyOutput } from "./commandExecutor/../destroy";
import { handleOpenCommand, handleDotSlashCommand } from "./commandExecutor/appHandler";
import { checkVirusTimeoutHandler, handleVirusTrigger } from "./commandExecutor/virusHandler";

vi.mock("@shared/lib/commandStats", () => ({
  trackCommandStats: vi.fn(),
}));

vi.mock("@shared/lib/secrets", () => ({
  checkSecretTriggers: vi.fn(),
}));

vi.mock("@shared/lib/destroy", () => ({
  getDestroyOutput: vi.fn(() => ["System destroyed!"]),
}));

vi.mock("./commandExecutor/virusHandler", () => ({
  checkVirusTimeoutHandler: vi.fn(),
  handleVirusTrigger: vi.fn(),
}));

vi.mock("./commandExecutor/appHandler", () => ({
  handleOpenCommand: vi.fn(),
  handleDotSlashCommand: vi.fn(),
}));

vi.mock("./commandExecutor/missionHandler", () => ({
  trackMissionProgress: vi.fn(),
}));

vi.mock("./commandExecutor/contactsHandler", () => ({
  handleContactsAfterCommand: vi.fn(),
}));

vi.mock("@entities/command/model", () => ({
  getCommandHandler: vi.fn(),
}));

describe("commandExecutor - Unit Tests", () => {
  const createContext = (overrides: Partial<CommandContext> = {}): CommandContext => ({
    rawHistory: [],
    theme: "2077",
    setThemeCallback: vi.fn(),
    addNotificationCallback: vi.fn(),
    currentSize: { width: 80, height: 24 },
    setSizeCallback: vi.fn(),
    currentUserInfo: { username: "user", hostname: "localhost" },
    setUserInfoCallback: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkVirusTimeoutHandler).mockReturnValue(null);
    vi.mocked(handleVirusTrigger).mockResolvedValue(null);
    vi.mocked(handleOpenCommand).mockReturnValue(null);
    vi.mocked(handleDotSlashCommand).mockReturnValue(null);
  });

  it("should return empty output for empty command", async () => {
    const context = createContext();
    const result = await executeCommand("", context);

    expect(result.output).toEqual([]);
  });

  it("should return empty output for whitespace only", async () => {
    const context = createContext();
    const result = await executeCommand("   ", context);

    expect(result.output).toEqual([]);
  });

  it("should handle virus timeout", async () => {
    vi.mocked(checkVirusTimeoutHandler).mockReturnValue({
      output: ["VIRUS TIMEOUT!"],
      isError: true,
    });

    const context = createContext();
    const result = await executeCommand("ls", context);

    expect(result.output).toEqual(["VIRUS TIMEOUT!"]);
    expect(result.isError).toBe(true);
  });

  it("should handle sudo rm -rf / command", async () => {
    vi.mocked(getDestroyOutput).mockReturnValue(["Destroying system...", "All data will be lost!"]);

    const context = createContext();
    const result = await executeCommand("sudo rm -rf /", context);

    expect(result.output).toContain("Destroying system...");
    expect(result.shouldDestroy).toBe(true);
  });

  it("should handle sudo rm -rf / with different casing", async () => {
    const context = createContext();
    const result = await executeCommand("SUDO RM -RF /", context);

    expect(result.shouldDestroy).toBe(true);
  });

  it("should not trigger destroy for incomplete sudo command", async () => {
    const context = createContext();
    const result = await executeCommand("sudo rm", context);

    expect(result.shouldDestroy).toBeUndefined();
  });

  it("should not trigger destroy for sudo without -rf", async () => {
    const context = createContext();
    const result = await executeCommand("sudo rm /", context);

    expect(result.shouldDestroy).toBeUndefined();
  });

  it("should handle open command", async () => {
    vi.mocked(handleOpenCommand).mockReturnValue({
      output: ["Opening application..."],
    });

    const context = createContext();
    const result = await executeCommand("open myapp", context);

    expect(result.output).toContain("Opening application...");
  });

  it("should handle ./ command", async () => {
    vi.mocked(handleDotSlashCommand).mockReturnValue({
      output: ["Executing script..."],
    });

    const context = createContext();
    const result = await executeCommand("./script.sh", context);

    expect(result.output).toContain("Executing script...");
  });

  it("should not handle open command when handler returns null", async () => {
    vi.mocked(handleOpenCommand).mockReturnValue(null);

    const context = createContext();
    await executeCommand("open", context);

    expect(handleOpenCommand).toHaveBeenCalledWith([]);
  });

  it("should not handle ./ command when handler returns null", async () => {
    vi.mocked(handleDotSlashCommand).mockReturnValue(null);

    const context = createContext();
    await executeCommand("./notfound", context);

    expect(handleDotSlashCommand).toHaveBeenCalledWith("./notfound");
  });
});
