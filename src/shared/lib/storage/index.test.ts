import { describe, it, expect, beforeEach, vi } from "vitest";

import { storageManager } from "./index";

describe("storageManager", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should get value from localStorage", () => {
    localStorage.setItem("test-key", JSON.stringify({ value: "test" }));

    const result = storageManager.get("test-key");
    expect(result).toEqual({ value: "test" });
  });

  it("should return defaultValue when key does not exist", () => {
    const result = storageManager.get("non-existent", "default");
    expect(result).toBe("default");
  });

  it("should return null when key does not exist and no defaultValue", () => {
    const result = storageManager.get("non-existent");
    expect(result).toBeNull();
  });

  it("should set value to localStorage", () => {
    const result = storageManager.set("test-key", { value: "test" });
    expect(result).toBe(true);
    expect(localStorage.getItem("test-key")).toBe(JSON.stringify({ value: "test" }));
  });

  it("should set complex objects to localStorage", () => {
    const complexObject = {
      nested: {
        array: [1, 2, 3],
        string: "test",
      },
    };
    storageManager.set("complex", complexObject);
    const result = storageManager.get("complex");
    expect(result).toEqual(complexObject);
  });

  it("should remove value from localStorage", () => {
    localStorage.setItem("test-key", "test-value");
    const result = storageManager.remove("test-key");
    expect(result).toBe(true);
    expect(localStorage.getItem("test-key")).toBeNull();
  });

  it("should check if key exists", () => {
    localStorage.setItem("test-key", "test-value");
    expect(storageManager.has("test-key")).toBe(true);
    expect(storageManager.has("non-existent")).toBe(false);
  });

  it("should clear all localStorage", () => {
    localStorage.setItem("key1", "value1");
    localStorage.setItem("key2", "value2");
    const result = storageManager.clear();
    expect(result).toBe(true);
    expect(localStorage.length).toBe(0);
  });

  it("should handle JSON parse errors gracefully", () => {
    localStorage.setItem("invalid-json", "not-json");
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = storageManager.get("invalid-json", "default");
    expect(result).toBe("default");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should handle different types of values", () => {
    storageManager.set("string", "test");
    storageManager.set("number", 42);
    storageManager.set("boolean", true);
    storageManager.set("array", [1, 2, 3]);
    storageManager.set("object", { key: "value" });

    expect(storageManager.get("string")).toBe("test");
    expect(storageManager.get("number")).toBe(42);
    expect(storageManager.get("boolean")).toBe(true);
    expect(storageManager.get("array")).toEqual([1, 2, 3]);
    expect(storageManager.get("object")).toEqual({ key: "value" });
  });

  it("should handle null values", () => {
    storageManager.set("null-value", null);
    expect(storageManager.get("null-value")).toBeNull();
  });

  it("should handle arrays and nested objects", () => {
    const nested = {
      level1: {
        level2: {
          level3: [1, 2, { deep: "value" }],
        },
      },
    };
    storageManager.set("nested", nested);
    const result = storageManager.get("nested");
    expect(result).toEqual(nested);
  });

  it("should handle localStorage set errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalSetItem = localStorage.setItem;
    const originalStringify = JSON.stringify;

    JSON.stringify = vi.fn(() => {
      throw new Error("Storage quota exceeded");
    });

    const result = storageManager.set("test-key", "value");
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    JSON.stringify = originalStringify;
    localStorage.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });

  it("should handle localStorage remove errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalRemoveItem = localStorage.removeItem;

    const mockRemoveItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage error");
    });
    Object.defineProperty(localStorage, "removeItem", {
      value: mockRemoveItem,
      writable: true,
      configurable: true,
    });

    const result = storageManager.remove("test-key");
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    Object.defineProperty(localStorage, "removeItem", {
      value: originalRemoveItem,
      writable: true,
      configurable: true,
    });
    consoleSpy.mockRestore();
  });

  it("should handle localStorage has errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalGetItem = localStorage.getItem;

    const mockGetItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage error");
    });
    Object.defineProperty(localStorage, "getItem", {
      value: mockGetItem,
      writable: true,
      configurable: true,
    });

    const result = storageManager.has("test-key");
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    Object.defineProperty(localStorage, "getItem", {
      value: originalGetItem,
      writable: true,
      configurable: true,
    });
    consoleSpy.mockRestore();
  });

  it("should handle localStorage clear errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalClear = localStorage.clear;

    const mockClear = vi.fn().mockImplementation(() => {
      throw new Error("Storage error");
    });
    Object.defineProperty(localStorage, "clear", {
      value: mockClear,
      writable: true,
      configurable: true,
    });

    const result = storageManager.clear();
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    Object.defineProperty(localStorage, "clear", {
      value: originalClear,
      writable: true,
      configurable: true,
    });
    consoleSpy.mockRestore();
  });
});
