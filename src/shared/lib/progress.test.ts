import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  getProgressStats,
  incrementStat,
  trackFileRead,
  trackHack,
  resetProgress,
} from "./progress";

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

describe("progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  describe("getProgressStats", () => {
    it("should return default stats when no data exists", () => {
      const stats = getProgressStats();

      expect(stats.missionsCompleted).toBe(0);
      expect(stats.secretsFound).toBe(0);
      expect(stats.serversHacked).toBe(0);
      expect(stats.filesRead).toBe(0);
    });

    it("should load missions completed from localStorage", () => {
      localStorageMock.setItem(
        "cyberpunk_missions",
        JSON.stringify({ completed: ["mission1", "mission2"] })
      );

      const stats = getProgressStats();

      expect(stats.missionsCompleted).toBe(2);
    });

    it("should handle missions data without completed array", () => {
      localStorageMock.setItem("cyberpunk_missions", JSON.stringify({}));

      const stats = getProgressStats();

      expect(stats.missionsCompleted).toBe(0);
    });

    it("should handle missions data with null completed", () => {
      localStorageMock.setItem("cyberpunk_missions", JSON.stringify({ completed: null }));

      const stats = getProgressStats();

      expect(stats.missionsCompleted).toBe(0);
    });

    it("should load secrets found from localStorage", () => {
      localStorageMock.setItem(
        "cyberpunk_secrets",
        JSON.stringify(["secret1", "secret2", "secret3"])
      );

      const stats = getProgressStats();

      expect(stats.secretsFound).toBe(3);
    });

    it("should handle invalid missions data", () => {
      localStorageMock.setItem("cyberpunk_missions", "invalid json");

      const stats = getProgressStats();

      expect(stats.missionsCompleted).toBe(0);
    });

    it("should handle invalid secrets data", () => {
      localStorageMock.setItem("cyberpunk_secrets", "invalid json");

      const stats = getProgressStats();

      expect(stats.secretsFound).toBe(0);
    });

    it("should handle non-array secrets data", () => {
      localStorageMock.setItem("cyberpunk_secrets", JSON.stringify({}));

      const stats = getProgressStats();

      expect(stats.secretsFound).toBe(0);
    });

    it("should save stats after loading", () => {
      getProgressStats();

      const saved = localStorageMock.getItem("cyberpunk_progress");
      expect(saved).toBeTruthy();
      if (saved) {
        const parsed = JSON.parse(saved);
        expect(parsed).toHaveProperty("missionsCompleted");
        expect(parsed).toHaveProperty("secretsFound");
      }
    });
  });

  describe("incrementStat", () => {
    it("should increment missionsCompleted", () => {
      incrementStat("missionsCompleted");

      const stats = getProgressStats();
      expect(stats.missionsCompleted).toBeGreaterThanOrEqual(1);
    });

    it("should increment secretsFound", () => {
      incrementStat("secretsFound");

      const stats = getProgressStats();
      expect(stats.secretsFound).toBeGreaterThanOrEqual(1);
    });

    it("should increment serversHacked", () => {
      incrementStat("serversHacked");

      const stats = getProgressStats();
      expect(stats.serversHacked).toBeGreaterThanOrEqual(1);
    });

    it("should increment filesRead", () => {
      incrementStat("filesRead");

      const stats = getProgressStats();
      expect(stats.filesRead).toBeGreaterThanOrEqual(1);
    });

    it("should increment multiple times", () => {
      incrementStat("missionsCompleted");
      incrementStat("missionsCompleted");
      incrementStat("missionsCompleted");

      const stats = getProgressStats();
      expect(stats.missionsCompleted).toBeGreaterThanOrEqual(3);
    });
  });

  describe("trackFileRead", () => {
    it("should track new file read", () => {
      trackFileRead("/home/file.txt");

      const files = localStorageMock.getItem("cyberpunk_files_read");
      expect(files).toBeTruthy();
      if (files) {
        const parsed = JSON.parse(files);
        expect(parsed).toContain("/home/file.txt");
      }
    });

    it("should not track duplicate file reads", () => {
      trackFileRead("/home/file.txt");
      trackFileRead("/home/file.txt");

      const files = localStorageMock.getItem("cyberpunk_files_read");
      if (files) {
        const parsed = JSON.parse(files);
        expect(parsed.filter((f: string) => f === "/home/file.txt").length).toBe(1);
      }
    });

    it("should increment filesRead stat when tracking new file", () => {
      trackFileRead("/home/file1.txt");

      const stats = getProgressStats();
      expect(stats.filesRead).toBeGreaterThanOrEqual(1);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => trackFileRead("/home/file.txt")).not.toThrow();

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe("trackHack", () => {
    it("should track hack with server IP", () => {
      trackHack("192.168.1.1");

      const servers = localStorageMock.getItem("cyberpunk_servers_hacked");
      expect(servers).toBeTruthy();
      if (servers) {
        const parsed = JSON.parse(servers);
        expect(parsed).toContain("192.168.1.1");
      }
    });

    it("should track hack without server IP", () => {
      trackHack();

      const servers = localStorageMock.getItem("cyberpunk_servers_hacked");
      expect(servers).toBeTruthy();
      if (servers) {
        const parsed = JSON.parse(servers);
        expect(parsed.length).toBeGreaterThan(0);
        expect(parsed[0]).toMatch(/^server_\d+$/);
      }
    });

    it("should not track duplicate hacks", () => {
      trackHack("192.168.1.1");
      trackHack("192.168.1.1");

      const servers = localStorageMock.getItem("cyberpunk_servers_hacked");
      if (servers) {
        const parsed = JSON.parse(servers);
        expect(parsed.filter((s: string) => s === "192.168.1.1").length).toBe(1);
      }
    });

    it("should increment serversHacked stat when tracking new hack", () => {
      trackHack("192.168.1.2");

      const stats = getProgressStats();
      expect(stats.serversHacked).toBeGreaterThanOrEqual(1);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => trackHack("192.168.1.1")).not.toThrow();

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe("resetProgress", () => {
    it("should remove progress storage keys", () => {
      localStorageMock.setItem("cyberpunk_progress", "{}");
      localStorageMock.setItem("cyberpunk_files_read", "[]");
      localStorageMock.setItem("cyberpunk_servers_hacked", "[]");

      resetProgress();

      expect(localStorageMock.getItem("cyberpunk_progress")).toBeNull();
      expect(localStorageMock.getItem("cyberpunk_files_read")).toBeNull();
      expect(localStorageMock.getItem("cyberpunk_servers_hacked")).toBeNull();
    });

    it("should handle localStorage errors gracefully", () => {
      const originalRemoveItem = localStorageMock.removeItem;
      localStorageMock.removeItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => resetProgress()).not.toThrow();

      localStorageMock.removeItem = originalRemoveItem;
    });
  });

  describe("loadStats error handling", () => {
    it("should handle localStorage getItem errors in loadStats", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = vi.fn((key: string) => {
        if (key === "cyberpunk_progress") {
          throw new Error("Storage error");
        }
        return originalGetItem(key);
      });

      const stats = getProgressStats();
      expect(stats).toEqual({
        missionsCompleted: 0,
        secretsFound: 0,
        serversHacked: 0,
        filesRead: 0,
      });
      expect(consoleSpy).toHaveBeenCalled();

      localStorageMock.getItem = originalGetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("saveStats error handling", () => {
    it("should handle localStorage setItem errors in saveStats", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn((key: string, value?: string) => {
        if (key === "cyberpunk_progress") {
          throw new Error("Storage quota exceeded");
        }
        return originalSetItem(key, value || "");
      });

      incrementStat("missionsCompleted");
      expect(consoleSpy).toHaveBeenCalled();

      localStorageMock.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });
});
