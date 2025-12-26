class StorageManager {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
      return false;
    }
  }

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`Failed to remove ${key} from localStorage`, e);
      return false;
    }
  }

  has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (e) {
      console.warn(`Failed to check ${key} in localStorage`, e);
      return false;
    }
  }

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.warn("Failed to clear localStorage", e);
      return false;
    }
  }
}

export const storageManager = new StorageManager();
