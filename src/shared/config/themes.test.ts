import { describe, it, expect } from "vitest";

import { getASCIILogo, THEMES, DEFAULT_THEME } from "./themes";
import type { Theme } from "../../types";

describe("themes", () => {
  describe("getASCIILogo", () => {
    it("should return logo for matrix theme", () => {
      const logo = getASCIILogo("matrix");
      expect(logo).toBeTruthy();
      expect(typeof logo).toBe("string");
      expect(logo.length).toBeGreaterThan(0);
    });

    it("should return logo for anime theme", () => {
      const logo = getASCIILogo("anime");
      expect(logo).toBeTruthy();
      expect(typeof logo).toBe("string");
      expect(logo.length).toBeGreaterThan(0);
    });

    it("should return logo for amber theme", () => {
      const logo = getASCIILogo("amber");
      expect(logo).toBeTruthy();
      expect(typeof logo).toBe("string");
      expect(logo.length).toBeGreaterThan(0);
    });

    it("should return logo for dolbaeb theme", () => {
      const logo = getASCIILogo("dolbaeb");
      expect(logo).toBeTruthy();
      expect(typeof logo).toBe("string");
      expect(logo.length).toBeGreaterThan(0);
    });

    it("should return logo for win95 theme", () => {
      const logo = getASCIILogo("win95");
      expect(logo).toBeTruthy();
      expect(typeof logo).toBe("string");
      expect(logo.length).toBeGreaterThan(0);
    });

    it("should return logo for retro theme", () => {
      const logo = getASCIILogo("retro");
      expect(logo).toBeTruthy();
      expect(typeof logo).toBe("string");
      expect(logo.length).toBeGreaterThan(0);
    });

    it("should return logo for 2077 theme", () => {
      const logo = getASCIILogo("2077");
      expect(logo).toBeTruthy();
      expect(typeof logo).toBe("string");
      expect(logo.length).toBeGreaterThan(0);
    });

    it("should return default logo for unknown theme", () => {
      const logo = getASCIILogo("unknown" as Theme);
      expect(logo).toBeTruthy();
      expect(typeof logo).toBe("string");
      expect(logo.length).toBeGreaterThan(0);
    });

    it("should return different logos for different themes", () => {
      const matrixLogo = getASCIILogo("matrix");
      const animeLogo = getASCIILogo("anime");
      const amberLogo = getASCIILogo("amber");

      expect(matrixLogo).not.toBe(animeLogo);
      expect(animeLogo).not.toBe(amberLogo);
      expect(matrixLogo).not.toBe(amberLogo);
    });
  });

  describe("THEMES", () => {
    it("should be defined", () => {
      expect(THEMES).toBeDefined();
    });

    it("should contain all expected themes", () => {
      expect(THEMES).toContain("matrix");
      expect(THEMES).toContain("anime");
      expect(THEMES).toContain("amber");
      expect(THEMES).toContain("dolbaeb");
      expect(THEMES).toContain("win95");
      expect(THEMES).toContain("retro");
      expect(THEMES).toContain("2077");
    });

    it("should be an array", () => {
      expect(Array.isArray(THEMES)).toBe(true);
    });
  });

  describe("DEFAULT_THEME", () => {
    it("should be defined", () => {
      expect(DEFAULT_THEME).toBeDefined();
    });

    it("should be 2077", () => {
      expect(DEFAULT_THEME).toBe("2077");
    });
  });
});
