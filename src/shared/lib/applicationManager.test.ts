import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApplicationManager, APP_CONFIGS, type AppName } from "./applicationManager";

describe("ApplicationManager", () => {
  let manager: ApplicationManager;

  beforeEach(() => {
    localStorage.clear();
    manager = new ApplicationManager();
  });

  describe("Initialization", () => {
    it("should initialize with all apps closed", () => {
      const state = manager.getState();
      expect(state.music).toBe(false);
      expect(state.email).toBe(false);
      expect(state.snake).toBe(false);
    });

    it("should load state from localStorage if available", () => {
      localStorage.setItem(
        "cyberpunk_apps_state",
        JSON.stringify({
          music: true,
          email: false,
          snake: false,
          tetris: false,
          hex: false,
          ports: false,
          fm: false,
        })
      );

      const newManager = new ApplicationManager();
      expect(newManager.isOpen("music")).toBe(true);
      expect(newManager.isOpen("email")).toBe(false);
    });
  });

  describe("openApp", () => {
    it("should open an app", () => {
      manager.openApp("music");
      expect(manager.isOpen("music")).toBe(true);
    });

    it("should not open an already open app", () => {
      manager.openApp("music");
      manager.openApp("music");
      expect(manager.isOpen("music")).toBe(true);
    });

    it("should notify state callback when opening", () => {
      const callback = vi.fn();
      manager.setStateCallback(callback);

      manager.openApp("email");

      expect(callback).toHaveBeenCalled();
      const calledState = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(calledState.email).toBe(true);
    });

    it("should save state to localStorage", () => {
      manager.openApp("snake");

      const saved = localStorage.getItem("cyberpunk_apps_state");
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.snake).toBe(true);
    });
  });

  describe("closeApp", () => {
    it("should close an open app", () => {
      manager.openApp("music");
      manager.closeApp("music");
      expect(manager.isOpen("music")).toBe(false);
    });

    it("should not fail when closing already closed app", () => {
      expect(() => manager.closeApp("music")).not.toThrow();
      expect(manager.isOpen("music")).toBe(false);
    });

    it("should notify state callback when closing", () => {
      manager.openApp("music");

      const callback = vi.fn();
      manager.setStateCallback(callback);

      manager.closeApp("music");

      expect(callback).toHaveBeenCalled();
      const calledState = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(calledState.music).toBe(false);
    });
  });

  describe("toggleApp", () => {
    it("should toggle app state from closed to open", () => {
      manager.toggleApp("music");
      expect(manager.isOpen("music")).toBe(true);
    });

    it("should toggle app state from open to closed", () => {
      manager.openApp("music");
      manager.toggleApp("music");
      expect(manager.isOpen("music")).toBe(false);
    });
  });

  describe("getOpenApps", () => {
    it("should return empty array when no apps are open", () => {
      expect(manager.getOpenApps()).toEqual([]);
    });

    it("should return list of open apps", () => {
      manager.openApp("music");
      manager.openApp("email");

      const openApps = manager.getOpenApps();
      expect(openApps).toContain("music");
      expect(openApps).toContain("email");
      expect(openApps.length).toBe(2);
    });
  });

  describe("closeAll", () => {
    it("should close all open apps", () => {
      manager.openApp("music");
      manager.openApp("email");
      manager.openApp("snake");

      manager.closeAll();

      expect(manager.getOpenApps()).toEqual([]);
    });

    it("should notify state callback", () => {
      manager.openApp("music");
      manager.openApp("email");

      const callback = vi.fn();
      manager.setStateCallback(callback);

      manager.closeAll();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("getConfig", () => {
    it("should return app configuration", () => {
      const config = manager.getConfig("music");
      expect(config).toBeDefined();
      expect(config?.name).toBe("music");
      expect(config?.executable).toBe("player.exe");
    });

    it("should return undefined for unknown app", () => {
      const config = manager.getConfig("unknown" as AppName);
      expect(config).toBeUndefined();
    });
  });

  describe("findAppByCommand", () => {
    it("should find app by command", () => {
      expect(manager.findAppByCommand("music")).toBe("music");
      expect(manager.findAppByCommand("player.exe")).toBe("music");
      expect(manager.findAppByCommand("mail")).toBe("email");
    });

    it("should be case-insensitive", () => {
      expect(manager.findAppByCommand("MUSIC")).toBe("music");
      expect(manager.findAppByCommand("Player.exe")).toBe("music");
    });

    it("should return null for unknown command", () => {
      expect(manager.findAppByCommand("unknown")).toBeNull();
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", () => {
      manager.openApp("music");
      manager.openApp("email");

      const stats = manager.getStats();
      expect(stats.total).toBe(Object.keys(APP_CONFIGS).length);
      expect(stats.open).toBe(2);
      expect(stats.closed).toBe(stats.total - 2);
    });
  });

  describe("setStateCallback", () => {
    it("should call callback immediately with current state", () => {
      manager.openApp("music");

      const callback = vi.fn();
      manager.setStateCallback(callback);

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ music: true }));
    });

    it("should allow setting callback to null", () => {
      const callback = vi.fn();
      manager.setStateCallback(callback);
      manager.setStateCallback(null);

      manager.openApp("email");

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});

describe("APP_CONFIGS", () => {
  it("should have configurations for all apps", () => {
    const apps: AppName[] = ["music", "email", "snake", "tetris", "hex", "ports", "fm"];

    for (const app of apps) {
      expect(APP_CONFIGS[app]).toBeDefined();
      expect(APP_CONFIGS[app].name).toBe(app);
    }
  });

  it("should have valid window settings for all apps", () => {
    for (const config of Object.values(APP_CONFIGS)) {
      expect(config.windowSettings).toBeDefined();
      expect(config.windowSettings.defaultSize.width).toBeGreaterThan(0);
      expect(config.windowSettings.defaultSize.height).toBeGreaterThan(0);
      expect(typeof config.windowSettings.draggable).toBe("boolean");
      expect(typeof config.windowSettings.resizable).toBe("boolean");
    }
  });

  it("should have at least one command for each app", () => {
    for (const config of Object.values(APP_CONFIGS)) {
      expect(config.commands.length).toBeGreaterThan(0);
    }
  });
});
