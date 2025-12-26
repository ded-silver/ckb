import { describe, it, expect, beforeEach, vi } from "vitest";

import { trackCommandStats } from "./commandStats";

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("commandStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  describe("trackCommandStats", () => {
    it("should track command usage", () => {
      trackCommandStats("help");

      const stats = localStorageMock.getItem("cyberpunk_command_stats");
      expect(stats).toBeTruthy();
      if (stats) {
        const parsed = JSON.parse(stats);
        expect(parsed.help).toBe(1);
      }
    });

    it("should increment command count on multiple calls", () => {
      trackCommandStats("help");
      trackCommandStats("help");
      trackCommandStats("help");

      const stats = localStorageMock.getItem("cyberpunk_command_stats");
      if (stats) {
        const parsed = JSON.parse(stats);
        expect(parsed.help).toBe(3);
      }
    });

    it("should track multiple different commands", () => {
      trackCommandStats("help");
      trackCommandStats("ls");
      trackCommandStats("cat");

      const stats = localStorageMock.getItem("cyberpunk_command_stats");
      if (stats) {
        const parsed = JSON.parse(stats);
        expect(parsed.help).toBe(1);
        expect(parsed.ls).toBe(1);
        expect(parsed.cat).toBe(1);
      }
    });

    it("should not track empty command", () => {
      trackCommandStats("");

      const stats = localStorageMock.getItem("cyberpunk_command_stats");
      expect(stats).toBeNull();
    });

    it("should not track clear command", () => {
      trackCommandStats("clear");

      const stats = localStorageMock.getItem("cyberpunk_command_stats");
      expect(stats).toBeNull();
    });

    it("should not track history command", () => {
      trackCommandStats("history");

      const stats = localStorageMock.getItem("cyberpunk_command_stats");
      expect(stats).toBeNull();
    });

    it("should preserve existing stats when tracking new command", () => {
      localStorageMock.setItem("cyberpunk_command_stats", JSON.stringify({ help: 5, ls: 3 }));

      trackCommandStats("cat");

      const stats = localStorageMock.getItem("cyberpunk_command_stats");
      if (stats) {
        const parsed = JSON.parse(stats);
        expect(parsed.help).toBe(5);
        expect(parsed.ls).toBe(3);
        expect(parsed.cat).toBe(1);
      }
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => trackCommandStats("help")).not.toThrow();

      localStorageMock.setItem = originalSetItem;
    });

    it("should handle invalid existing stats", () => {
      localStorageMock.setItem("cyberpunk_command_stats", "invalid json");

      expect(() => trackCommandStats("help")).not.toThrow();
    });
  });
});
