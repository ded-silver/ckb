/**
 * Input Manager
 *
 * Централизованная система управления вводом с клавиатуры.
 * Позволяет приложениям (особенно играм) перехватывать клавиши
 * и блокировать терминал во время активного использования.
 */

import type { AppName } from "./applicationManager";

export type KeyHandler = (event: KeyboardEvent) => boolean | void;

export type FocusTarget = AppName | "terminal" | null;

/**
 * Input Manager Singleton
 *
 * Управляет фокусом ввода и перехватом клавиш.
 */
class InputManager {
  private focusedApp: FocusTarget = "terminal";
  private handlers: Map<AppName, KeyHandler> = new Map();
  private globalHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    this.setupGlobalHandler();
  }

  private setupGlobalHandler(): void {
    this.globalHandler = (e: KeyboardEvent) => {
      if (this.focusedApp && this.focusedApp !== "terminal") {
        const handler = this.handlers.get(this.focusedApp);
        if (handler) {
          const handled = handler(e);
          if (handled === true) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener("keydown", this.globalHandler, true);
  }

  setFocus(target: FocusTarget): void {
    if (this.focusedApp === target) {
      return;
    }

    this.focusedApp = target;
  }

  releaseFocus(): void {
    this.setFocus("terminal");
  }

  getFocusedApp(): FocusTarget {
    return this.focusedApp;
  }

  hasFocus(app: AppName): boolean {
    return this.focusedApp === app;
  }

  /**
   * Зарегистрировать обработчик клавиш для приложения
   *
   * @param app - Имя приложения
   * @param handler - Функция обработчик. Должна вернуть true если событие обработано.
   */
  captureKeys(app: AppName, handler: KeyHandler): void {
    if (this.handlers.has(app)) {
      console.warn(`App ${app} already has a key handler registered`);
    }

    this.handlers.set(app, handler);
  }

  releaseKeys(app: AppName): void {
    this.handlers.delete(app);
  }

  hasHandler(app: AppName): boolean {
    return this.handlers.has(app);
  }

  /**
   * Обработать глобальное нажатие клавиши
   * Используется для специальных комбинаций (Alt+Tab, Esc и т.д.)
   *
   * @returns true если событие было обработано
   */
  handleGlobalKey(e: KeyboardEvent): boolean {
    // Esc всегда освобождает фокус
    if (e.key === "Escape" && this.focusedApp && this.focusedApp !== "terminal") {
      this.releaseFocus();
      return true;
    }

    // Alt+Tab для переключения между приложениями (будущая фича)
    if (e.altKey && e.key === "Tab") {
      // TODO: Implement app switching
      return false;
    }

    return false;
  }

  getStats(): {
    focusedApp: FocusTarget;
    registeredHandlers: number;
    handlers: AppName[];
  } {
    return {
      focusedApp: this.focusedApp,
      registeredHandlers: this.handlers.size,
      handlers: Array.from(this.handlers.keys()),
    };
  }

  clearAll(): void {
    this.handlers.clear();
    this.focusedApp = "terminal";
  }

  destroy(): void {
    if (this.globalHandler) {
      window.removeEventListener("keydown", this.globalHandler, true);
      this.globalHandler = null;
    }
    this.clearAll();
  }
}

export const inputManager = new InputManager();

export { InputManager };
