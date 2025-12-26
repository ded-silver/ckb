import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { InputManager, type KeyHandler } from "./inputManager";

describe("InputManager", () => {
  let manager: InputManager;

  beforeEach(() => {
    manager = new InputManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe("Initialization", () => {
    it("should initialize with terminal focus", () => {
      expect(manager.getFocusedApp()).toBe("terminal");
    });

    it("should have no registered handlers initially", () => {
      const stats = manager.getStats();
      expect(stats.registeredHandlers).toBe(0);
      expect(stats.handlers).toEqual([]);
    });
  });

  describe("setFocus", () => {
    it("should set focus to an app", () => {
      manager.setFocus("snake");
      expect(manager.getFocusedApp()).toBe("snake");
    });

    it("should set focus to terminal", () => {
      manager.setFocus("snake");
      manager.setFocus("terminal");
      expect(manager.getFocusedApp()).toBe("terminal");
    });

    it("should not change focus if already focused", () => {
      manager.setFocus("snake");
      const consoleSpy = vi.spyOn(console, "log");

      manager.setFocus("snake");

      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining("Input focus changed"));

      consoleSpy.mockRestore();
    });
  });

  describe("releaseFocus", () => {
    it("should release focus back to terminal", () => {
      manager.setFocus("music");
      manager.releaseFocus();
      expect(manager.getFocusedApp()).toBe("terminal");
    });
  });

  describe("hasFocus", () => {
    it("should return true if app has focus", () => {
      manager.setFocus("email");
      expect(manager.hasFocus("email")).toBe(true);
    });

    it("should return false if app does not have focus", () => {
      manager.setFocus("email");
      expect(manager.hasFocus("music")).toBe(false);
    });
  });

  describe("captureKeys", () => {
    it("should register key handler for app", () => {
      const handler: KeyHandler = vi.fn();

      manager.captureKeys("snake", handler);

      expect(manager.hasHandler("snake")).toBe(true);
    });

    it("should warn when registering duplicate handler", () => {
      const handler1: KeyHandler = vi.fn();
      const handler2: KeyHandler = vi.fn();
      const consoleSpy = vi.spyOn(console, "warn");

      manager.captureKeys("snake", handler1);
      manager.captureKeys("snake", handler2);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("already has a key handler"));

      consoleSpy.mockRestore();
    });
  });

  describe("releaseKeys", () => {
    it("should remove key handler for app", () => {
      const handler: KeyHandler = vi.fn();

      manager.captureKeys("snake", handler);
      manager.releaseKeys("snake");

      expect(manager.hasHandler("snake")).toBe(false);
    });

    it("should not fail when releasing non-existent handler", () => {
      expect(() => manager.releaseKeys("snake")).not.toThrow();
    });
  });

  describe("hasHandler", () => {
    it("should return true if handler is registered", () => {
      const handler: KeyHandler = vi.fn();
      manager.captureKeys("music", handler);

      expect(manager.hasHandler("music")).toBe(true);
    });

    it("should return false if handler is not registered", () => {
      expect(manager.hasHandler("music")).toBe(false);
    });
  });

  describe("handleGlobalKey", () => {
    it("should handle Escape key to release focus", () => {
      manager.setFocus("snake");

      const event = new KeyboardEvent("keydown", { key: "Escape" });
      const handled = manager.handleGlobalKey(event);

      expect(handled).toBe(true);
      expect(manager.getFocusedApp()).toBe("terminal");
    });

    it("should not handle Escape when focus is on terminal", () => {
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      const handled = manager.handleGlobalKey(event);

      expect(handled).toBe(false);
    });

    it("should not handle Alt+Tab yet", () => {
      const event = new KeyboardEvent("keydown", { key: "Tab", altKey: true });
      const handled = manager.handleGlobalKey(event);

      expect(handled).toBe(false);
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", () => {
      const handler1: KeyHandler = vi.fn();
      const handler2: KeyHandler = vi.fn();

      manager.captureKeys("snake", handler1);
      manager.captureKeys("music", handler2);
      manager.setFocus("snake");

      const stats = manager.getStats();

      expect(stats.focusedApp).toBe("snake");
      expect(stats.registeredHandlers).toBe(2);
      expect(stats.handlers).toContain("snake");
      expect(stats.handlers).toContain("music");
    });
  });

  describe("clearAll", () => {
    it("should clear all handlers and reset focus", () => {
      const handler1: KeyHandler = vi.fn();
      const handler2: KeyHandler = vi.fn();

      manager.captureKeys("snake", handler1);
      manager.captureKeys("music", handler2);
      manager.setFocus("snake");

      manager.clearAll();

      expect(manager.getFocusedApp()).toBe("terminal");
      expect(manager.hasHandler("snake")).toBe(false);
      expect(manager.hasHandler("music")).toBe(false);
    });
  });

  describe("Key event handling", () => {
    it("should call handler when app has focus", () => {
      const handler: KeyHandler = vi.fn(() => true);

      manager.captureKeys("snake", handler);
      manager.setFocus("snake");

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      window.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it("should not call handler when app does not have focus", () => {
      const handler: KeyHandler = vi.fn(() => true);

      manager.captureKeys("snake", handler);
      manager.setFocus("terminal");

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      window.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it("should prevent default when handler returns true", () => {
      const handler: KeyHandler = vi.fn(() => true);

      manager.captureKeys("snake", handler);
      manager.setFocus("snake");

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");
      const stopPropagationSpy = vi.spyOn(event, "stopPropagation");

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it("should not prevent default when handler returns false", () => {
      const handler: KeyHandler = vi.fn(() => false);

      manager.captureKeys("snake", handler);
      manager.setFocus("snake");

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe("destroy", () => {
    it("should remove global event listener", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      manager.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function), true);
    });

    it("should clear all handlers", () => {
      const handler: KeyHandler = vi.fn();
      manager.captureKeys("snake", handler);

      manager.destroy();

      expect(manager.hasHandler("snake")).toBe(false);
    });
  });
});
