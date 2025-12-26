/**
 * Интеграционные тесты для команд терминала
 *
 * Эти тесты проверяют полный flow: ввод команды -> выполнение -> проверка вывода
 * В отличие от unit-тестов, здесь мы тестируем команды как пользователь:
 * вводим команду и проверяем, что получили ожидаемый результат.
 */

import type { CommandContext } from "@entities/command/types";
import { clearVirusState } from "@features/virus/model";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { executeCommand } from "./commandExecutor";

import { storageManager } from "./storage";

vi.mock("@shared/lib/commandStats");
vi.mock("@shared/lib/secrets");
vi.mock("./commandExecutor/virusHandler", () => ({
  checkVirusTimeoutHandler: () => null,
  handleVirusTrigger: async () => null,
}));
vi.mock("./commandExecutor/appHandler", () => ({
  handleOpenCommand: () => null,
  handleDotSlashCommand: () => null,
}));
vi.mock("./commandExecutor/missionHandler", () => ({
  trackMissionProgress: async () => {},
}));
vi.mock("./commandExecutor/contactsHandler", () => ({
  handleContactsAfterCommand: async () => {},
}));

describe("Command Integration Tests", () => {
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
    clearVirusState();
    storageManager.clear();
  });

  describe("help command", () => {
    it("should return help menu with available commands", async () => {
      const result = await executeCommand("help", createContext());

      expect(result.output).toBeDefined();
      expect(Array.isArray(result.output)).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);

      const outputText = result.output.join("\n");
      expect(outputText).toContain("AVAILABLE COMMANDS");
      expect(outputText).toContain("BASIC:");
      expect(outputText).toContain("NETWORK:");
      expect(outputText).toContain("SYSTEM:");
    });

    it("should return secret help menu with --secret flag", async () => {
      const result = await executeCommand("help --secret", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText).toContain("SECRET COMMANDS");
      expect(outputText).toContain("konami");
      expect(outputText).toContain("matrix");
    });
  });

  describe("ls command", () => {
    it("should list directory contents", async () => {
      const result = await executeCommand("ls", createContext());

      expect(result.output).toBeDefined();
      expect(Array.isArray(result.output)).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);

      const outputText = result.output.join("\n");
      expect(outputText).toContain("Directory listing");
    });

    it("should show help with -h flag", async () => {
      const result = await executeCommand("ls -h", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText).toContain("Usage: ls");
      expect(outputText).toContain("Options:");
    });

    it("should show all files with -a flag", async () => {
      const result = await executeCommand("ls -a", createContext());

      expect(result.output).toBeDefined();
      expect(result.isError).toBeFalsy();
    });
  });

  describe("cat command", () => {
    it("should show usage when no filename provided", async () => {
      const result = await executeCommand("cat", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText).toContain("Usage: cat");
    });

    it("should read file content", async () => {
      const result = await executeCommand("cat documents/notes.txt", createContext());

      expect(result.output).toBeDefined();
      expect(Array.isArray(result.output)).toBe(true);
      expect(result.output.length).toBeGreaterThan(0);

      const outputText = result.output.join("\n");
      expect(outputText).toContain("First Entry");
    });

    it("should handle /dev/null special case", async () => {
      const result = await executeCommand("cat /dev/null", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText).toContain("Nothing to see here");
    });

    it("should show error for non-existent file", async () => {
      const result = await executeCommand("cat nonexistent.txt", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText.toLowerCase()).toMatch(/not found|error|does not exist/i);
    });

    it("should number lines with -n flag", async () => {
      const result = await executeCommand("cat -n documents/notes.txt", createContext());

      expect(result.output).toBeDefined();
      const firstLine = result.output[0];
      if (firstLine && firstLine.trim()) {
        expect(firstLine).toMatch(/^\s*\d+\s+/);
      }
    });
  });

  describe("pwd command", () => {
    it("should return current directory", async () => {
      const result = await executeCommand("pwd", createContext());

      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
      expect(result.output[0]).toContain("/");
    });
  });

  describe("cd command", () => {
    it("should show usage when no directory provided", async () => {
      const result = await executeCommand("cd", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText).toContain("Usage: cd");
    });

    it("should change to existing directory", async () => {
      const result = await executeCommand("cd documents", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText.toLowerCase()).toContain("changed");
    });

    it("should show error for non-existent directory", async () => {
      const result = await executeCommand("cd nonexistent", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText.toLowerCase()).toMatch(/not found|error/i);
    });
  });

  describe("echo command", () => {
    it("should echo text", async () => {
      const result = await executeCommand('echo "Hello World"', createContext());

      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
      const outputText = result.output.join("\n");
      expect(outputText).toContain("Hello");
      expect(outputText).toContain("World");
    });

    it("should handle multiple arguments", async () => {
      const result = await executeCommand("echo test1 test2 test3", createContext());

      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText).toContain("test1");
      expect(outputText).toContain("test2");
      expect(outputText).toContain("test3");
    });
  });

  describe("whoami command", () => {
    it("should return current user info", async () => {
      const result = await executeCommand("whoami", createContext());

      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
    });
  });

  describe("date command", () => {
    it("should return current date", async () => {
      const result = await executeCommand("date", createContext());

      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
    });
  });

  describe("clear command", () => {
    it("should return empty output", async () => {
      const result = await executeCommand("clear", createContext());

      expect(result.output).toBeDefined();
    });
  });

  describe("unknown command", () => {
    it("should return error message for unknown command", async () => {
      const result = await executeCommand("unknowncommand123", createContext());

      expect(result.isError).toBe(true);
      expect(result.output).toBeDefined();
      const outputText = result.output.join("\n");
      expect(outputText.toLowerCase()).toContain("not found");
      expect(outputText).toContain("help");
    });
  });

  describe("command with arguments", () => {
    it("should handle commands with multiple arguments", async () => {
      const result = await executeCommand("echo arg1 arg2 arg3", createContext());

      expect(result.output).toBeDefined();
      expect(result.isError).toBeFalsy();
    });

    it("should handle commands with flags", async () => {
      const result = await executeCommand("ls -a -l", createContext());

      expect(result.output).toBeDefined();
      expect(result.isError).toBeFalsy();
    });
  });

  describe("empty and whitespace commands", () => {
    it("should handle empty command", async () => {
      const result = await executeCommand("", createContext());

      expect(result.output).toBeDefined();
      expect(Array.isArray(result.output)).toBe(true);
    });

    it("should handle whitespace-only command", async () => {
      const result = await executeCommand("   ", createContext());

      expect(result.output).toBeDefined();
      expect(Array.isArray(result.output)).toBe(true);
    });
  });
});
