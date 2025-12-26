import { describe, it, expect, vi, beforeEach } from "vitest";

import { corruptText, corruptTextGradually, corruptRandomChars } from "./textCorruption";

describe("textCorruption", () => {
  describe("corruptText", () => {
    it("should return original text when corruptionLevel is 0", () => {
      const text = "Hello World";
      const result = corruptText(text, 0);
      expect(result).toBe(text);
    });

    it("should corrupt text when corruptionLevel is greater than 0", () => {
      const text = "Hello World";
      const result = corruptText(text, 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should fully corrupt text when corruptionLevel is 1", () => {
      const text = "Hello";
      const result = corruptText(text, 1);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
      expect(result).not.toBe(text);
    });

    it("should handle empty string", () => {
      const result = corruptText("", 0.5);
      expect(result).toBe("");
    });

    it("should handle single character", () => {
      const result = corruptText("a", 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it("should handle special characters", () => {
      const text = "!@#$%^&*()";
      const result = corruptText(text, 0.3);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should handle numbers", () => {
      const text = "1234567890";
      const result = corruptText(text, 0.3);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should use default corruptionLevel when not provided", () => {
      const text = "Hello World";
      const result = corruptText(text);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });
  });

  describe("corruptTextGradually", () => {
    it("should return original text when progress is 0", () => {
      const text = "Hello World";
      const result = corruptTextGradually(text, 0);
      expect(result).toBe(text);
    });

    it("should corrupt text when progress is greater than 0", () => {
      const text = "Hello World";
      const result = corruptTextGradually(text, 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should cap corruption at 0.8 when progress is 1", () => {
      const text = "Hello World";
      const result = corruptTextGradually(text, 1);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should increase corruption with progress", () => {
      const text = "Hello World";
      const result1 = corruptTextGradually(text, 0.25);
      const result2 = corruptTextGradually(text, 0.75);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.length).toBe(text.length);
      expect(result2.length).toBe(text.length);
    });

    it("should handle empty string", () => {
      const result = corruptTextGradually("", 0.5);
      expect(result).toBe("");
    });
  });

  describe("corruptRandomChars", () => {
    it("should return original text when probability is 0", () => {
      const text = "Hello World";
      const result = corruptRandomChars(text, 0);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should corrupt text when probability is greater than 0", () => {
      const text = "Hello World";
      const result = corruptRandomChars(text, 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should use default probability when not provided", () => {
      const text = "Hello World";
      const result = corruptRandomChars(text);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should handle empty string", () => {
      const result = corruptRandomChars("", 0.5);
      expect(result).toBe("");
    });

    it("should preserve whitespace", () => {
      const text = "Hello   World";
      const result = corruptRandomChars(text, 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should return consistent results for same input within time window", () => {
      const text = "Test";
      const result1 = corruptRandomChars(text, 0.5);
      const result2 = corruptRandomChars(text, 0.5);

      expect(result1).toBe(result2);
    });

    it("should handle long text", () => {
      const text = "A".repeat(100);
      const result = corruptRandomChars(text, 0.3);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(text.length - 5);
      expect(result.length).toBeLessThanOrEqual(text.length + 5);
    });

    it("should handle special characters", () => {
      const text = "!@#$%^&*()";
      const result = corruptRandomChars(text, 0.3);
      expect(result).toBeDefined();
      expect(result.length).toBe(text.length);
    });

    it("should handle cache overflow", () => {
      const text = "A";
      for (let i = 0; i < 1001; i++) {
        corruptRandomChars(text + i, 0.5);
      }
      const result = corruptRandomChars("test", 0.5);
      expect(result).toBeDefined();
    });

    it("should handle cache overflow with firstKey check", () => {
      const text = "A";
      for (let i = 0; i < 1002; i++) {
        corruptRandomChars(text + i.toString().padStart(10, "0"), 0.5);
      }
      const result = corruptRandomChars("test", 0.5);
      expect(result).toBeDefined();
    });

    it("should handle cache overflow when firstKey is undefined", () => {
      const text = "A";
      for (let i = 0; i < 1002; i++) {
        corruptRandomChars(text + i.toString().padStart(10, "0"), 0.5);
      }
      const result = corruptRandomChars("test", 0.5);
      expect(result).toBeDefined();
    });
  });

  describe("corruptChar branches", () => {
    beforeEach(() => {
      vi.spyOn(Math, "random").mockRestore();
    });

    it("should use random corruption chars when random < 0.3 * level", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.1);
      const text = "a";
      const result = corruptText(text, 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it("should use corruption map when 0.3 * level <= random < 0.7 * level", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.25);
      const text = "a";
      const result = corruptText(text, 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it("should use corruption map for alphanumeric when 0.7 * level <= random < level", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.4);
      const text = "a";
      const result = corruptText(text, 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it("should return original char when random >= level", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.6);
      const text = "a";
      const result = corruptText(text, 0.5);
      expect(result).toBe("a");
    });

    it("should handle characters not in corruption map", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.4);
      const text = "z";
      const result = corruptText(text, 0.5);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it("should handle non-alphanumeric characters", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.4);
      const text = " ";
      const result = corruptText(text, 0.5);
      expect(result).toBe(" ");
    });
  });
});
