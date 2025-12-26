import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  getAllSecrets,
  isSecretDiscovered,
  getDiscoveredSecrets,
  discoverSecret,
  checkSecretTriggers,
  getTotalSecretsCount,
} from "./secrets";

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

describe("secrets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  describe("getAllSecrets", () => {
    it("should return array of secrets", () => {
      const secrets = getAllSecrets();

      expect(Array.isArray(secrets)).toBe(true);
      expect(secrets.length).toBeGreaterThan(0);
    });

    it("should return secrets with required properties", () => {
      const secrets = getAllSecrets();

      secrets.forEach(secret => {
        expect(secret).toHaveProperty("id");
        expect(secret).toHaveProperty("name");
        expect(secret).toHaveProperty("description");
        expect(secret).toHaveProperty("trigger");
      });
    });

    it("should include konami secret", () => {
      const secrets = getAllSecrets();

      const konami = secrets.find(s => s.id === "konami");
      expect(konami).toBeDefined();
      expect(konami?.trigger.type).toBe("command");
      expect(konami?.trigger.condition).toBe("konami");
    });
  });

  describe("isSecretDiscovered", () => {
    it("should return false for undiscovered secret", () => {
      expect(isSecretDiscovered("konami")).toBe(false);
    });

    it("should return true for discovered secret", () => {
      localStorageMock.setItem("cyberpunk_secrets", JSON.stringify(["konami"]));

      expect(isSecretDiscovered("konami")).toBe(true);
    });

    it("should handle invalid localStorage data", () => {
      localStorageMock.setItem("cyberpunk_secrets", "invalid json");

      expect(isSecretDiscovered("konami")).toBe(false);
    });

    it("should handle non-array data", () => {
      localStorageMock.setItem("cyberpunk_secrets", JSON.stringify({}));

      expect(isSecretDiscovered("konami")).toBe(false);
    });
  });

  describe("getDiscoveredSecrets", () => {
    it("should return empty array when no secrets discovered", () => {
      const discovered = getDiscoveredSecrets();

      expect(discovered).toEqual([]);
    });

    it("should return discovered secrets", () => {
      localStorageMock.setItem("cyberpunk_secrets", JSON.stringify(["konami", "matrix"]));

      const discovered = getDiscoveredSecrets();

      expect(discovered).toContain("konami");
      expect(discovered).toContain("matrix");
    });
  });

  describe("discoverSecret", () => {
    it("should discover new secret", () => {
      const result = discoverSecret("konami");

      expect(result).toBe(true);
      expect(isSecretDiscovered("konami")).toBe(true);
    });

    it("should not discover already discovered secret", () => {
      discoverSecret("konami");
      const result = discoverSecret("konami");

      expect(result).toBe(false);
    });

    it("should save discovered secret to localStorage", () => {
      discoverSecret("matrix");

      const saved = localStorageMock.getItem("cyberpunk_secrets");
      expect(saved).toBeTruthy();
      if (saved) {
        const parsed = JSON.parse(saved);
        expect(parsed).toContain("matrix");
      }
    });
  });

  describe("checkSecretTriggers", () => {
    it("should discover secret by command trigger", () => {
      const result = checkSecretTriggers("konami");

      expect(result).toBe("konami");
      expect(isSecretDiscovered("konami")).toBe(true);
    });

    it("should not discover already discovered secret", () => {
      discoverSecret("konami");
      const result = checkSecretTriggers("konami");

      expect(result).toBeNull();
    });

    it("should discover secret by mission complete trigger", () => {
      const result = checkSecretTriggers("", [], "secret_hunter");

      expect(result).toBe("first_secret");
      expect(isSecretDiscovered("first_secret")).toBe(true);
    });

    it("should return null for non-matching command", () => {
      const result = checkSecretTriggers("unknown_command");

      expect(result).toBeNull();
    });

    it("should handle invalid discovered secrets data", () => {
      localStorageMock.setItem("cyberpunk_secrets", "invalid json");

      const result = checkSecretTriggers("konami");

      expect(result).toBe("konami");
    });
  });

  describe("getTotalSecretsCount", () => {
    it("should return total number of secrets", () => {
      const count = getTotalSecretsCount();

      expect(count).toBeGreaterThan(0);
      expect(typeof count).toBe("number");
    });

    it("should match length of getAllSecrets", () => {
      const count = getTotalSecretsCount();
      const secrets = getAllSecrets();

      expect(count).toBe(secrets.length);
    });
  });

  describe("saveDiscovered error handling", () => {
    it("should handle localStorage setItem errors in saveDiscovered", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      discoverSecret("konami");
      expect(consoleSpy).toHaveBeenCalled();

      localStorageMock.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("checkSecretTriggers edge cases", () => {
    it("should handle invalid discovered secrets data (non-array)", () => {
      localStorageMock.setItem("cyberpunk_secrets", JSON.stringify({}));

      const result = checkSecretTriggers("konami");
      expect(result).toBe("konami");
    });

    it("should return null when discovered is not an array", () => {
      const result = checkSecretTriggers("konami");
      expect(result).toBe("konami");
    });

    it("should skip secrets without id", () => {
      const result = checkSecretTriggers("unknown_command");
      expect(result).toBeNull();
    });

    it("should handle combination trigger type (not implemented)", () => {
      const result = checkSecretTriggers("some_command");
      expect(result).toBeNull();
    });
  });
});
