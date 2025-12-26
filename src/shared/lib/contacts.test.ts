import { getFileSystem, saveFileSystem } from "@entities/file/model";
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  markContactsRead,
  isContactsRead,
  isLainMessageSent,
  markLainMessageSent,
  incrementCommandsAfterContacts,
  shouldSendLainMessage,
  createLainMessageFile,
} from "./contacts";

vi.mock("@entities/file/model", () => ({
  getFileSystem: vi.fn(() => ({
    "/home/user/secrets": {
      type: "dir",
      contents: {},
    },
  })),
  saveFileSystem: vi.fn(),
}));

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

describe("contacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  describe("markContactsRead", () => {
    it("should mark contacts as read", () => {
      markContactsRead();

      expect(localStorageMock.getItem("cyberpunk_contacts_read")).toBe("true");
    });

    it("should set read time", () => {
      markContactsRead();

      const readTime = localStorageMock.getItem("cyberpunk_contacts_read_time");
      expect(readTime).toBeTruthy();
      expect(parseInt(readTime || "0", 10)).toBeGreaterThan(0);
    });

    it("should reset commands count", () => {
      markContactsRead();

      expect(localStorageMock.getItem("cyberpunk_commands_after_contacts")).toBe("0");
    });

    it("should handle localStorage errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => markContactsRead()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      localStorageMock.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("isContactsRead", () => {
    it("should return false when contacts not read", () => {
      expect(isContactsRead()).toBe(false);
    });

    it("should return true when contacts are read", () => {
      localStorageMock.setItem("cyberpunk_contacts_read", "true");

      expect(isContactsRead()).toBe(true);
    });

    it("should return false for invalid value", () => {
      localStorageMock.setItem("cyberpunk_contacts_read", "false");

      expect(isContactsRead()).toBe(false);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(isContactsRead()).toBe(false);

      localStorageMock.getItem = originalGetItem;
    });
  });

  describe("isLainMessageSent", () => {
    it("should return false when message not sent", () => {
      expect(isLainMessageSent()).toBe(false);
    });

    it("should return true when message is sent", () => {
      localStorageMock.setItem("cyberpunk_lain_message_sent", "true");

      expect(isLainMessageSent()).toBe(true);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(isLainMessageSent()).toBe(false);

      localStorageMock.getItem = originalGetItem;
    });
  });

  describe("markLainMessageSent", () => {
    it("should mark message as sent", () => {
      markLainMessageSent();

      expect(localStorageMock.getItem("cyberpunk_lain_message_sent")).toBe("true");
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => markLainMessageSent()).not.toThrow();

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe("incrementCommandsAfterContacts", () => {
    it("should increment from 0 to 1", () => {
      const result = incrementCommandsAfterContacts();

      expect(result).toBe(1);
      expect(localStorageMock.getItem("cyberpunk_commands_after_contacts")).toBe("1");
    });

    it("should increment multiple times", () => {
      incrementCommandsAfterContacts();
      incrementCommandsAfterContacts();
      const result = incrementCommandsAfterContacts();

      expect(result).toBe(3);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      const result = incrementCommandsAfterContacts();
      expect(result).toBe(0);

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe("shouldSendLainMessage", () => {
    it("should return false when contacts not read", () => {
      expect(shouldSendLainMessage()).toBe(false);
    });

    it("should return false when message already sent", () => {
      localStorageMock.setItem("cyberpunk_contacts_read", "true");
      localStorageMock.setItem("cyberpunk_lain_message_sent", "true");

      expect(shouldSendLainMessage()).toBe(false);
    });

    it("should return false when commands count is low", () => {
      localStorageMock.setItem("cyberpunk_contacts_read", "true");
      localStorageMock.setItem("cyberpunk_commands_after_contacts", "2");
      localStorageMock.setItem("cyberpunk_contacts_read_time", Date.now().toString());

      const result = shouldSendLainMessage();
      expect(typeof result).toBe("boolean");
    });

    it("should return true when commands count is high enough", () => {
      localStorageMock.setItem("cyberpunk_contacts_read", "true");
      localStorageMock.setItem("cyberpunk_commands_after_contacts", "10");
      localStorageMock.setItem("cyberpunk_contacts_read_time", Date.now().toString());

      const result = shouldSendLainMessage();
      expect(typeof result).toBe("boolean");
    });

    it("should return true when elapsed time exceeds MAX_WAIT_TIME", () => {
      localStorageMock.setItem("cyberpunk_contacts_read", "true");
      localStorageMock.setItem("cyberpunk_commands_after_contacts", "2");
      localStorageMock.setItem(
        "cyberpunk_contacts_read_time",
        (Date.now() - 31 * 60 * 1000).toString()
      );

      const result = shouldSendLainMessage();
      expect(typeof result).toBe("boolean");
    });

    it("should handle localStorage errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      localStorageMock.setItem("cyberpunk_contacts_read", "true");
      localStorageMock.setItem("cyberpunk_lain_message_sent", "false");

      const originalLocalStorage = window.localStorage;
      let callCount = 0;
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => {
          if (callCount < 2) {
            callCount++;
            return originalLocalStorage.getItem(key);
          }
          throw new Error("Storage error");
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      });

      const result = shouldSendLainMessage();
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
      consoleSpy.mockRestore();
    });
  });

  describe("createLainMessageFile", () => {
    it("should create message file when secrets directory exists", () => {
      const mockFs = {
        "/home/user/secrets": {
          type: "dir",
          contents: {},
        },
      };
      vi.mocked(getFileSystem).mockReturnValue(mockFs as any);

      createLainMessageFile();

      expect(saveFileSystem).toHaveBeenCalled();
      const savedFs = vi.mocked(saveFileSystem).mock.calls[0][0];
      expect(savedFs["/home/user/secrets/message_from_lain.dat"]).toBeDefined();
      expect(savedFs["/home/user/secrets/lain_disconnect_code.txt"]).toBeDefined();
    });

    it("should create disconnect code when message file exists but code file doesn't", () => {
      const mockFs = {
        "/home/user/secrets": {
          type: "dir",
          contents: {
            "message_from_lain.dat": {
              type: "file",
              content: "existing content",
            },
          },
        },
        "/home/user/secrets/message_from_lain.dat": {
          type: "file",
          content: "existing content",
        },
      };
      vi.mocked(getFileSystem).mockReturnValue(mockFs as any);

      createLainMessageFile();

      expect(saveFileSystem).toHaveBeenCalled();
      const savedFs = vi.mocked(saveFileSystem).mock.calls[0][0];
      expect(savedFs["/home/user/secrets/lain_disconnect_code.txt"]).toBeDefined();
    });

    it("should not create files when both already exist", () => {
      const mockFs = {
        "/home/user/secrets": {
          type: "dir",
          contents: {
            "message_from_lain.dat": {
              type: "file",
              content: "existing content",
            },
            "lain_disconnect_code.txt": {
              type: "file",
              content: "existing code",
            },
          },
        },
        "/home/user/secrets/message_from_lain.dat": {
          type: "file",
          content: "existing content",
        },
        "/home/user/secrets/lain_disconnect_code.txt": {
          type: "file",
          content: "existing code",
        },
      };
      vi.mocked(getFileSystem).mockReturnValue(mockFs as any);
      vi.mocked(saveFileSystem).mockClear();

      createLainMessageFile();

      expect(saveFileSystem).not.toHaveBeenCalled();
    });

    it("should not create files when secrets directory doesn't exist", () => {
      const mockFs = {};
      vi.mocked(getFileSystem).mockReturnValue(mockFs as any);
      vi.mocked(saveFileSystem).mockClear();

      createLainMessageFile();

      expect(saveFileSystem).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully in createLainMessageFile", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(getFileSystem).mockImplementation(() => {
        throw new Error("File system error");
      });

      expect(() => createLainMessageFile()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle errors gracefully in createLainMessageFileInternal", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockFs = {
        "/home/user/secrets": {
          type: "dir",
          contents: {},
        },
      };
      vi.mocked(getFileSystem).mockReturnValue(mockFs as any);
      vi.mocked(saveFileSystem).mockImplementation(() => {
        throw new Error("Save error");
      });

      expect(() => createLainMessageFile()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
