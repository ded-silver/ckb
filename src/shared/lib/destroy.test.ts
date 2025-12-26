import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { getDestroyOutput, createDestroyOverlay } from "./destroy";

describe("destroy", () => {
  describe("getDestroyOutput", () => {
    it("should return array of strings", () => {
      const output = getDestroyOutput();

      expect(Array.isArray(output)).toBe(true);
      expect(output.length).toBeGreaterThan(0);
    });

    it("should contain warning message", () => {
      const output = getDestroyOutput();

      const hasWarning = output.some(line => line.includes("CRITICAL WARNING"));
      expect(hasWarning).toBe(true);
    });

    it("should contain command information", () => {
      const output = getDestroyOutput();

      const hasCommand = output.some(line => line.includes("sudo rm -rf /"));
      expect(hasCommand).toBe(true);
    });

    it("should contain deletion steps", () => {
      const output = getDestroyOutput();

      const hasSteps = output.some(line => line.includes("[1/10]"));
      expect(hasSteps).toBe(true);
    });

    it("should contain file deletion messages", () => {
      const output = getDestroyOutput();

      const hasDeleted = output.some(line => line.includes("[DELETED]"));
      expect(hasDeleted).toBe(true);
    });

    it("should contain system directories", () => {
      const output = getDestroyOutput();

      const hasBin = output.some(line => line.includes("/bin/"));
      expect(hasBin).toBe(true);
    });

    it("should have consistent structure", () => {
      const output1 = getDestroyOutput();
      const output2 = getDestroyOutput();

      expect(output1).toEqual(output2);
    });
  });

  describe("createDestroyOverlay", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
      document.head.innerHTML = "";
      vi.useFakeTimers();
    });

    afterEach(() => {
      document.body.innerHTML = "";
      document.head.innerHTML = "";
      vi.useRealTimers();
    });

    it("should create overlay element", () => {
      createDestroyOverlay();
      const overlay = document.body.querySelector("div");
      expect(overlay).toBeTruthy();
    });

    it("should set overlay styles", () => {
      createDestroyOverlay();
      const overlay = document.body.querySelector("div");
      expect(overlay?.style.position).toBe("fixed");
      expect(overlay?.style.top).toBe("0px");
      expect(overlay?.style.left).toBe("0px");
      expect(overlay?.style.width).toBe("100%");
      expect(overlay?.style.height).toBe("100%");
      expect(overlay?.style.background).toMatch(/#000|rgb\(0,\s*0,\s*0\)/);
      expect(overlay?.style.zIndex).toBe("99999");
    });

    it("should add style element to head", () => {
      createDestroyOverlay();
      const style = document.head.querySelector("style");
      expect(style).toBeTruthy();
      expect(style?.textContent).toContain("@keyframes fadeIn");
      expect(style?.textContent).toContain("@keyframes glitch");
    });

    it("should add overlay content", () => {
      createDestroyOverlay();
      const overlay = document.body.querySelector("div");
      expect(overlay?.innerHTML).toContain("SYSTEM DESTROYED");
      expect(overlay?.innerHTML).toContain("All files have been deleted");
      expect(overlay?.innerHTML).toContain("Rebooting...");
    });

    it("should create flicker interval", () => {
      createDestroyOverlay();
      const overlay = document.body.querySelector("div") as HTMLElement;
      const initialOpacity = overlay.style.opacity;

      vi.advanceTimersByTime(100);
      expect(overlay.style.opacity).not.toBe(initialOpacity);

      vi.advanceTimersByTime(1000);
      expect(overlay.style.opacity).toBeDefined();
    });

    it("should reload page after 5 seconds", () => {
      const reloadSpy = vi.spyOn(window.location, "reload").mockImplementation(() => {});
      createDestroyOverlay();

      vi.advanceTimersByTime(5000);
      expect(reloadSpy).toHaveBeenCalled();
      reloadSpy.mockRestore();
    });
  });
});
