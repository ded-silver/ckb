/**
 * Application Manager
 *
 * Централизованная система управления открытыми приложениями.
 * Заменяет отдельные callbacks для каждого приложения единым менеджером.
 */

export type AppName = "music" | "email" | "snake" | "tetris" | "hex" | "ports" | "fm" | "webcam";

export interface WindowSettings {
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
  resizable: boolean;
  draggable: boolean;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}

export interface AppConfig {
  name: AppName;
  displayName: string;
  executable: string; // "player.exe", "mail.exe"
  commands: string[]; // ["music", "open player.exe"]
  requiresFile?: boolean; // hexedit требует файл
  windowSettings: WindowSettings;
  description?: string;
}

export type AppState = Record<AppName, boolean>;
export type ZIndexState = Record<AppName, number>;

type StateCallback = (state: AppState) => void;
type ZIndexCallback = (zIndexes: ZIndexState) => void;

export const APP_CONFIGS: Record<AppName, AppConfig> = {
  music: {
    name: "music",
    displayName: "Music Player",
    executable: "player.exe",
    commands: ["music", "music open", "open player.exe", "player.exe"],
    windowSettings: {
      defaultSize: { width: 600, height: 400 },
      defaultPosition: { x: 0, y: 0 },
      resizable: true,
      draggable: true,
      minSize: { width: 400, height: 300 },
      maxSize: { width: 1200, height: 800 },
    },
    description: "Cyberpunk music player with audio visualization",
  },
  email: {
    name: "email",
    displayName: "Email Client",
    executable: "mail.exe",
    commands: ["mail", "email", "open mail.exe", "mail.exe"],
    windowSettings: {
      defaultSize: { width: 900, height: 700 },
      defaultPosition: { x: 0, y: 0 },
      resizable: true,
      draggable: true,
      minSize: { width: 600, height: 400 },
    },
    description: "Secure email client for Wired communications",
  },
  snake: {
    name: "snake",
    displayName: "Snake Game",
    executable: "snake.exe",
    commands: ["snake", "games snake", "open snake.exe", "snake.exe"],
    windowSettings: {
      defaultSize: { width: 600, height: 500 },
      defaultPosition: { x: 0, y: 0 },
      resizable: false,
      draggable: true,
    },
    description: "Classic snake game with cyberpunk twist",
  },
  tetris: {
    name: "tetris",
    displayName: "Tetris",
    executable: "tetris.exe",
    commands: ["tetris", "games tetris", "open tetris.exe", "tetris.exe"],
    windowSettings: {
      defaultSize: { width: 400, height: 600 },
      defaultPosition: { x: 0, y: 0 },
      resizable: false,
      draggable: true,
    },
    description: "Classic block puzzle game",
  },
  hex: {
    name: "hex",
    displayName: "Hex Editor",
    executable: "hexedit.exe",
    commands: ["hexedit", "hex", "open hexedit.exe", "hexedit.exe"],
    requiresFile: true,
    windowSettings: {
      defaultSize: { width: 800, height: 600 },
      defaultPosition: { x: 0, y: 0 },
      resizable: true,
      draggable: true,
      minSize: { width: 600, height: 400 },
    },
    description: "Hex editor for binary file analysis",
  },
  ports: {
    name: "ports",
    displayName: "Port Scanner",
    executable: "portscan.exe",
    commands: ["portscan --visual", "nmap --visual", "open portscan.exe", "portscan.exe"],
    windowSettings: {
      defaultSize: { width: 700, height: 500 },
      defaultPosition: { x: 0, y: 0 },
      resizable: true,
      draggable: true,
      minSize: { width: 500, height: 400 },
    },
    description: "Visual network port scanner",
  },
  fm: {
    name: "fm",
    displayName: "File Manager",
    executable: "mc.exe",
    commands: ["mc", "fm", "filemanager", "open mc.exe", "mc.exe"],
    windowSettings: {
      defaultSize: { width: 1000, height: 700 },
      defaultPosition: { x: 0, y: 0 },
      resizable: true,
      draggable: true,
      minSize: { width: 800, height: 500 },
    },
    description: "Midnight Commander style file manager",
  },
  webcam: {
    name: "webcam",
    displayName: "ASCII Webcam",
    executable: "webcam.exe",
    commands: ["webcam", "ascii-cam", "open webcam.exe", "webcam.exe"],
    windowSettings: {
      defaultSize: { width: 900, height: 700 },
      defaultPosition: { x: 0, y: 0 },
      resizable: true,
      draggable: true,
      minSize: { width: 400, height: 300 },
      maxSize: { width: 1400, height: 1000 },
    },
    description: "Real-time ASCII art webcam viewer",
  },
};

/**
 * Application Manager Singleton
 *
 * Управляет состоянием всех открытых приложений.
 */
class ApplicationManager {
  private state: AppState;
  private zIndexes: ZIndexState;
  private stateCallback: StateCallback | null = null;
  private zIndexCallback: ZIndexCallback | null = null;
  private readonly STORAGE_KEY = "cyberpunk_apps_state";
  private readonly BASE_ZINDEX = 1000;
  private zIndexCounter = 1000;

  constructor() {
    this.state = this.loadState();
    this.zIndexes = this.initZIndexes();
  }

  private loadState(): AppState {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validState: Partial<AppState> = {};
        for (const key of Object.keys(APP_CONFIGS)) {
          validState[key as AppName] = parsed[key] === true;
        }
        return validState as AppState;
      }
    } catch (e) {
      console.warn("Failed to load apps state from localStorage", e);
    }

    return {
      music: false,
      email: false,
      snake: false,
      tetris: false,
      hex: false,
      ports: false,
      fm: false,
      webcam: false,
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to save apps state to localStorage", e);
    }
  }

  private initZIndexes(): ZIndexState {
    const initial: Partial<ZIndexState> = {};
    for (const key of Object.keys(APP_CONFIGS)) {
      initial[key as AppName] = this.BASE_ZINDEX;
    }
    return initial as ZIndexState;
  }

  private notifyStateChange(): void {
    if (this.stateCallback) {
      this.stateCallback({ ...this.state });
    }
    this.saveState();
  }

  private notifyZIndexChange(): void {
    if (this.zIndexCallback) {
      this.zIndexCallback({ ...this.zIndexes });
    }
  }

  setStateCallback(callback: StateCallback | null): void {
    this.stateCallback = callback;
    if (callback) {
      callback({ ...this.state });
    }
  }

  setZIndexCallback(callback: ZIndexCallback | null): void {
    this.zIndexCallback = callback;
    if (callback) {
      callback({ ...this.zIndexes });
    }
  }

  openApp(appName: AppName): void {
    if (!APP_CONFIGS[appName]) {
      console.warn(`Unknown app: ${appName}`);
      return;
    }

    if (this.state[appName]) {
      this.bringToFront(appName);
      return;
    }

    this.state[appName] = true;
    this.bringToFront(appName);
    this.notifyStateChange();
  }

  closeApp(appName: AppName): void {
    if (!this.state[appName]) {
      return;
    }

    this.state[appName] = false;
    this.notifyStateChange();
  }

  toggleApp(appName: AppName): void {
    if (this.state[appName]) {
      this.closeApp(appName);
    } else {
      this.openApp(appName);
    }
  }

  isOpen(appName: AppName): boolean {
    return this.state[appName] === true;
  }

  getState(): AppState {
    return { ...this.state };
  }

  getOpenApps(): AppName[] {
    return (Object.keys(this.state) as AppName[]).filter(app => this.state[app]);
  }

  closeAll(): void {
    for (const appName of Object.keys(this.state) as AppName[]) {
      this.state[appName] = false;
    }
    this.notifyStateChange();
  }

  bringToFront(appName: AppName): void {
    this.zIndexCounter++;
    this.zIndexes[appName] = this.zIndexCounter;
    this.notifyZIndexChange();
  }

  getZIndex(appName: AppName): number {
    return this.zIndexes[appName] || this.BASE_ZINDEX;
  }

  getZIndexes(): ZIndexState {
    return { ...this.zIndexes };
  }

  getConfig(appName: AppName): AppConfig | undefined {
    return APP_CONFIGS[appName];
  }

  findAppByCommand(command: string): AppName | null {
    const cleanCommand = command.trim().toLowerCase();

    for (const [appName, config] of Object.entries(APP_CONFIGS)) {
      if (config.commands.some(cmd => cmd.toLowerCase() === cleanCommand)) {
        return appName as AppName;
      }
    }

    return null;
  }

  getStats(): { total: number; open: number; closed: number } {
    const openApps = this.getOpenApps();
    const total = Object.keys(APP_CONFIGS).length;
    return {
      total,
      open: openApps.length,
      closed: total - openApps.length,
    };
  }
}

export const applicationManager = new ApplicationManager();

export { ApplicationManager };
