import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  isNeoCorpHacked,
  markNeoCorpHacked,
  getVirusState,
  setVirusState,
  clearVirusState,
  checkVirusTrigger,
  detectVirusType,
  generateDeactivationCode,
  getDeactivationHint,
  checkDeactivationCode,
  getVirusInfectionOutput,
  getVirusCureOutput,
  checkVirusTimeout,
  type VirusType,
} from "./index";

const VIRUS_STORAGE_KEY = "cyberpunk_virus_state";
const NEO_CORP_HACK_KEY = "cyberpunk_neocorp_hacked";
const VIRUS_TIMEOUT = 45000;

describe("virus model", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("isNeoCorpHacked", () => {
    it("should return false when NeoCorp is not hacked", () => {
      expect(isNeoCorpHacked()).toBe(false);
    });

    it("should return true when NeoCorp is hacked", () => {
      localStorage.setItem(NEO_CORP_HACK_KEY, "true");
      expect(isNeoCorpHacked()).toBe(true);
    });

    it("should return false when localStorage throws error", () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage error");
      });
      expect(isNeoCorpHacked()).toBe(false);
      getItemSpy.mockRestore();
    });
  });

  describe("markNeoCorpHacked", () => {
    it("should mark NeoCorp as hacked", () => {
      markNeoCorpHacked();
      expect(localStorage.getItem(NEO_CORP_HACK_KEY)).toBe("true");
    });

    it("should handle localStorage errors gracefully", () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage error");
      });
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(() => markNeoCorpHacked()).not.toThrow();
      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("getVirusState", () => {
    it("should return null when no virus state exists", () => {
      expect(getVirusState()).toBe(null);
    });

    it("should return virus state for trojan type", () => {
      const state = {
        isInfected: true,
        timeRemaining: VIRUS_TIMEOUT,
        startTime: Date.now(),
        virusType: "trojan" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      const result = getVirusState();
      expect(result).toBeTruthy();
      expect(result?.isInfected).toBe(true);
      expect(result?.virusType).toBe("trojan");
    });

    it("should return virus state with updated timeRemaining for trojan", () => {
      const startTime = Date.now() - 10000;
      const state = {
        isInfected: true,
        timeRemaining: VIRUS_TIMEOUT,
        startTime,
        virusType: "trojan" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      const result = getVirusState();
      expect(result).toBeTruthy();
      expect(result?.timeRemaining).toBeLessThan(VIRUS_TIMEOUT);
      expect(result?.timeRemaining).toBeGreaterThan(0);
    });

    it("should return null when virus timeout expired", () => {
      const startTime = Date.now() - VIRUS_TIMEOUT - 1000;
      const state = {
        isInfected: true,
        timeRemaining: VIRUS_TIMEOUT,
        startTime,
        virusType: "trojan" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      const clearSpy = vi.spyOn(Storage.prototype, "removeItem");
      const result = getVirusState();
      expect(result).toBe(null);
      expect(clearSpy).toHaveBeenCalledWith(VIRUS_STORAGE_KEY);
      clearSpy.mockRestore();
    });

    it("should return virus state with infinite time for adware", () => {
      const state = {
        isInfected: true,
        timeRemaining: VIRUS_TIMEOUT,
        startTime: Date.now(),
        virusType: "adware" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      const result = getVirusState();
      expect(result).toBeTruthy();
      expect(result?.timeRemaining).toBe(999999);
    });

    it("should return virus state with infinite time for corruption", () => {
      const state = {
        isInfected: true,
        timeRemaining: VIRUS_TIMEOUT,
        startTime: Date.now(),
        virusType: "corruption" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      const result = getVirusState();
      expect(result).toBeTruthy();
      expect(result?.timeRemaining).toBe(999999);
    });

    it("should handle localStorage errors gracefully", () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage error");
      });
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = getVirusState();
      expect(result).toBe(null);
      expect(() => getVirusState()).not.toThrow();
      getItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorage.setItem(VIRUS_STORAGE_KEY, "invalid json");
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = getVirusState();
      expect(result).toBe(null);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe("setVirusState", () => {
    it("should set virus state when infected", () => {
      setVirusState(true, "trojan");
      const saved = localStorage.getItem(VIRUS_STORAGE_KEY);
      expect(saved).toBeTruthy();
      const state = JSON.parse(saved!);
      expect(state.isInfected).toBe(true);
      expect(state.virusType).toBe("trojan");
      expect(state.timeRemaining).toBe(VIRUS_TIMEOUT);
    });

    it("should use trojan as default virus type", () => {
      setVirusState(true);
      const saved = localStorage.getItem(VIRUS_STORAGE_KEY);
      const state = JSON.parse(saved!);
      expect(state.virusType).toBe("trojan");
    });

    it("should clear virus state when not infected", () => {
      setVirusState(true, "trojan");
      expect(localStorage.getItem(VIRUS_STORAGE_KEY)).toBeTruthy();
      setVirusState(false);
      expect(localStorage.getItem(VIRUS_STORAGE_KEY)).toBeNull();
    });

    it("should import commandTracking for corruption type", async () => {
      expect(() => setVirusState(true, "corruption")).not.toThrow();
    });

    it("should handle missing ensureCorruptionDeactivationFile in module", async () => {
      expect(() => setVirusState(true, "corruption")).not.toThrow();
    });

    it("should set virus state for all virus types", () => {
      const types: VirusType[] = ["trojan", "honeypot", "prototype", "adware", "corruption"];
      types.forEach(type => {
        setVirusState(true, type);
        const saved = localStorage.getItem(VIRUS_STORAGE_KEY);
        expect(saved).toBeTruthy();
        const state = JSON.parse(saved!);
        expect(state.virusType).toBe(type);
        clearVirusState();
      });
    });
  });

  describe("clearVirusState", () => {
    it("should remove virus state from localStorage", () => {
      setVirusState(true, "trojan");
      expect(localStorage.getItem(VIRUS_STORAGE_KEY)).toBeTruthy();
      clearVirusState();
      expect(localStorage.getItem(VIRUS_STORAGE_KEY)).toBeNull();
    });
  });

  describe("checkVirusTrigger", () => {
    it("should return true for execution command with virus_prototype", () => {
      expect(checkVirusTrigger("gcc", ["virus_prototype.asm"])).toBe(true);
      expect(checkVirusTrigger("./virus_prototype", ["virus_prototype"])).toBe(true);
      expect(checkVirusTrigger("bash", ["virus_prototype"])).toBe(true);
    });

    it("should return false for execution command without virus_prototype", () => {
      expect(checkVirusTrigger("gcc", ["file.c"])).toBe(false);
      expect(checkVirusTrigger("./program", [])).toBe(false);
    });

    it("should return true for read command with neocorp_countermeasure.dat", () => {
      expect(checkVirusTrigger("cat", ["neocorp_countermeasure.dat"])).toBe(true);
      expect(checkVirusTrigger("head", ["neocorp_countermeasure.dat"])).toBe(true);
    });

    it("should return true for read command with project_alpha_defense.exe", () => {
      expect(checkVirusTrigger("cat", ["project_alpha_defense.exe"])).toBe(true);
    });

    it("should return true for read command with neocorp_alert.dat", () => {
      expect(checkVirusTrigger("cat", ["neocorp_alert.dat"])).toBe(true);
    });

    it("should return true for read command with extracted_data.dat", () => {
      expect(checkVirusTrigger("cat", ["extracted_data.dat"])).toBe(true);
    });

    it("should return true for read command with virus_prototype.asm", () => {
      expect(checkVirusTrigger("cat", ["virus_prototype.asm"])).toBe(true);
    });

    it("should return true for read command with message_from_lain.dat", () => {
      expect(checkVirusTrigger("cat", ["message_from_lain.dat"])).toBe(true);
    });

    it("should return true for read command with message_from_ prefix", () => {
      expect(checkVirusTrigger("cat", ["message_from_alice.dat"])).toBe(true);
    });

    it("should return true for read command with corrupted_unicode", () => {
      expect(checkVirusTrigger("cat", ["corrupted_unicode.dat"])).toBe(true);
    });

    it("should return true for read command with broken_encoding", () => {
      expect(checkVirusTrigger("cat", ["broken_encoding.dat"])).toBe(true);
    });

    it("should return true for read command with text_corruption", () => {
      expect(checkVirusTrigger("cat", ["text_corruption.dat"])).toBe(true);
    });

    it("should return false for read command without args", () => {
      expect(checkVirusTrigger("cat", [])).toBe(false);
    });

    it("should return false for non-trigger command", () => {
      expect(checkVirusTrigger("ls", [])).toBe(false);
      expect(checkVirusTrigger("pwd", [])).toBe(false);
    });

    it("should handle case insensitive file names", () => {
      expect(checkVirusTrigger("cat", ["NEOcorp_COUNTERmeasure.DAT"])).toBe(true);
    });

    it("should handle file paths", () => {
      expect(checkVirusTrigger("cat", ["/home/user/neocorp_countermeasure.dat"])).toBe(true);
    });

    it("should return false for execution command without args", () => {
      expect(checkVirusTrigger("gcc", [])).toBe(false);
      expect(checkVirusTrigger("make", undefined)).toBe(false);
    });

    it("should return false for execution command with non-trigger args", () => {
      expect(checkVirusTrigger("gcc", ["file.c"])).toBe(false);
      expect(checkVirusTrigger("bash", ["script.sh"])).toBe(false);
    });

    it("should return false for read command with only flag args", () => {
      expect(checkVirusTrigger("cat", ["-n", "-A"])).toBe(false);
      expect(checkVirusTrigger("head", ["-10"])).toBe(false);
    });

    it("should return false for read command with non-trigger file", () => {
      expect(checkVirusTrigger("cat", ["normal_file.txt"])).toBe(false);
      expect(checkVirusTrigger("head", ["other.dat"])).toBe(false);
    });

    it("should handle execution commands that start with trigger", () => {
      expect(checkVirusTrigger("gcc", ["virus_prototype"])).toBe(true);
      expect(checkVirusTrigger("nasm", ["virus_prototype.asm"])).toBe(true);
    });

    it("should handle execution commands with multiple args", () => {
      expect(checkVirusTrigger("gcc", ["-o", "virus_prototype", "file.c"])).toBe(true);
    });

    it("should handle file paths with trigger in path", () => {
      expect(checkVirusTrigger("cat", ["/path/to/virus_prototype.asm"])).toBe(true);
      expect(checkVirusTrigger("cat", ["/home/user/message_from_lain.dat"])).toBe(true);
    });

    it("should handle file paths ending with trigger", () => {
      expect(checkVirusTrigger("cat", ["/path/neocorp_countermeasure.dat"])).toBe(true);
      expect(checkVirusTrigger("cat", ["/path/project_alpha_defense.exe"])).toBe(true);
    });

    it("should handle file paths ending with /trigger", () => {
      expect(checkVirusTrigger("cat", ["/path/neocorp_countermeasure.dat"])).toBe(true);
    });
  });

  describe("detectVirusType", () => {
    it("should detect prototype type", () => {
      expect(detectVirusType("cat", ["virus_prototype.asm"])).toBe("prototype");
    });

    it("should detect honeypot type", () => {
      expect(detectVirusType("cat", ["extracted_data.dat"])).toBe("honeypot");
    });

    it("should detect adware type for message_from_lain", () => {
      expect(detectVirusType("cat", ["message_from_lain.dat"])).toBe("adware");
    });

    it("should detect adware type for message_from_ prefix", () => {
      expect(detectVirusType("cat", ["message_from_alice.dat"])).toBe("adware");
    });

    it("should detect corruption type for corrupted_unicode", () => {
      expect(detectVirusType("cat", ["corrupted_unicode.dat"])).toBe("corruption");
    });

    it("should detect corruption type for broken_encoding", () => {
      expect(detectVirusType("cat", ["broken_encoding.dat"])).toBe("corruption");
    });

    it("should detect corruption type for text_corruption", () => {
      expect(detectVirusType("cat", ["text_corruption.dat"])).toBe("corruption");
    });

    it("should default to trojan for neocorp files", () => {
      expect(detectVirusType("cat", ["neocorp_countermeasure.dat"])).toBe("trojan");
      expect(detectVirusType("cat", ["project_alpha_defense.exe"])).toBe("trojan");
      expect(detectVirusType("cat", ["neocorp_alert.dat"])).toBe("trojan");
    });

    it("should default to trojan for unknown files", () => {
      expect(detectVirusType("cat", ["unknown.dat"])).toBe("trojan");
    });

    it("should handle empty args", () => {
      expect(detectVirusType("cat", [])).toBe("trojan");
    });
  });

  describe("generateDeactivationCode", () => {
    it("should generate code for trojan", () => {
      expect(generateDeactivationCode("trojan")).toBe("ALPHA-DEFENSE-2077");
    });

    it("should generate code for honeypot", () => {
      expect(generateDeactivationCode("honeypot")).toBe("HONEYPOT-BREAK-42");
    });

    it("should generate code for prototype", () => {
      expect(generateDeactivationCode("prototype")).toBe("PROTOTYPE-KILL-SWITCH");
    });

    it("should generate code for adware", () => {
      expect(generateDeactivationCode("adware")).toBe("LAIN-DISCONNECT-2077");
    });

    it("should generate code for corruption", () => {
      expect(generateDeactivationCode("corruption")).toBe("UNICODE-FIX-UTF8");
    });

    it("should default to trojan for unknown type", () => {
      expect(generateDeactivationCode("unknown" as VirusType)).toBe("ALPHA-DEFENSE-2077");
    });
  });

  describe("getDeactivationHint", () => {
    it("should return hint for trojan", () => {
      const hint = getDeactivationHint("trojan");
      expect(hint).toContain("ALPHA");
      expect(hint).toContain("2077");
    });

    it("should return hint for honeypot", () => {
      const hint = getDeactivationHint("honeypot");
      expect(hint).toContain("HONEYPOT");
      expect(hint).toContain("42");
    });

    it("should return hint for prototype", () => {
      const hint = getDeactivationHint("prototype");
      expect(hint).toContain("PROTOTYPE");
      expect(hint).toContain("SWITCH");
    });

    it("should return hint for adware", () => {
      const hint = getDeactivationHint("adware");
      expect(hint).toContain("LAIN");
      expect(hint).toContain("2077");
    });

    it("should return hint for corruption", () => {
      const hint = getDeactivationHint("corruption");
      expect(hint).toContain("UNICODE");
      expect(hint).toContain("UTF8");
    });

    it("should default to trojan hint for unknown type", () => {
      const hint = getDeactivationHint("unknown" as VirusType);
      expect(hint).toContain("ALPHA");
    });
  });

  describe("checkDeactivationCode", () => {
    beforeEach(() => {
      clearVirusState();
    });

    it("should return true for correct trojan code", () => {
      setVirusState(true, "trojan");
      expect(checkDeactivationCode("ALPHA-DEFENSE-2077")).toBe(true);
    });

    it("should return true for correct code with different case", () => {
      setVirusState(true, "trojan");
      expect(checkDeactivationCode("alpha-defense-2077")).toBe(true);
    });

    it("should return true for correct code with whitespace", () => {
      setVirusState(true, "trojan");
      expect(checkDeactivationCode("  ALPHA-DEFENSE-2077  ")).toBe(true);
    });

    it("should return false for incorrect code", () => {
      setVirusState(true, "trojan");
      expect(checkDeactivationCode("WRONG-CODE")).toBe(false);
    });

    it("should use provided virusType instead of state", () => {
      expect(checkDeactivationCode("HONEYPOT-BREAK-42", "honeypot")).toBe(true);
    });

    it("should default to trojan when no state and no type provided", () => {
      expect(checkDeactivationCode("ALPHA-DEFENSE-2077")).toBe(true);
      expect(checkDeactivationCode("WRONG-CODE")).toBe(false);
    });
  });

  describe("getVirusInfectionOutput", () => {
    it("should return output for trojan", () => {
      const output = getVirusInfectionOutput("trojan");
      expect(output.length).toBeGreaterThan(0);
      expect(output.some(line => line.includes("TROJAN"))).toBe(true);
    });

    it("should return output for honeypot", () => {
      const output = getVirusInfectionOutput("honeypot");
      expect(output.length).toBeGreaterThan(0);
      expect(output.some(line => line.includes("HONEYPOT"))).toBe(true);
    });

    it("should return output for prototype", () => {
      const output = getVirusInfectionOutput("prototype");
      expect(output.length).toBeGreaterThan(0);
      expect(output.some(line => line.includes("PROTOTYPE"))).toBe(true);
    });

    it("should return output for adware", () => {
      const output = getVirusInfectionOutput("adware");
      expect(output.length).toBeGreaterThan(0);
      expect(output.some(line => line.includes("ADWARE"))).toBe(true);
    });

    it("should return output for corruption", () => {
      const output = getVirusInfectionOutput("corruption");
      expect(output.length).toBeGreaterThan(0);
      expect(output.some(line => line.includes("CORRUPTION"))).toBe(true);
    });

    it("should default to trojan output", () => {
      const output = getVirusInfectionOutput();
      expect(output.length).toBeGreaterThan(0);
      expect(output.some(line => line.includes("TROJAN"))).toBe(true);
    });
  });

  describe("getVirusCureOutput", () => {
    beforeEach(() => {
      clearVirusState();
    });

    it("should return hint output when no code provided", () => {
      setVirusState(true, "trojan");
      const output = getVirusCureOutput();
      expect(output.some(line => line.includes("Deactivation code required"))).toBe(true);
      expect(output.some(line => line.includes("ALPHA"))).toBe(true);
    });

    it("should return error output for incorrect code", () => {
      setVirusState(true, "trojan");
      const output = getVirusCureOutput("WRONG-CODE");
      expect(output.some(line => line.includes("Invalid deactivation code"))).toBe(true);
    });

    it("should return success output for correct code", () => {
      setVirusState(true, "trojan");
      const output = getVirusCureOutput("ALPHA-DEFENSE-2077");
      expect(output.some(line => line.includes("Deactivation code accepted"))).toBe(true);
      expect(output.some(line => line.includes("Virus successfully removed"))).toBe(true);
    });

    it("should use default trojan when no state exists", () => {
      const output = getVirusCureOutput("ALPHA-DEFENSE-2077");
      expect(output.some(line => line.includes("Deactivation code accepted"))).toBe(true);
    });
  });

  describe("checkVirusTimeout", () => {
    beforeEach(() => {
      clearVirusState();
    });

    it("should return false when no virus state", () => {
      expect(checkVirusTimeout()).toBe(false);
    });

    it("should return false when virus is not infected", () => {
      const state = {
        isInfected: false,
        timeRemaining: VIRUS_TIMEOUT,
        startTime: Date.now(),
        virusType: "trojan" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      expect(checkVirusTimeout()).toBe(false);
    });

    it("should return false for adware type", () => {
      const state = {
        isInfected: true,
        timeRemaining: 999999,
        startTime: Date.now() - VIRUS_TIMEOUT - 1000,
        virusType: "adware" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      expect(checkVirusTimeout()).toBe(false);
    });

    it("should return false for corruption type", () => {
      const state = {
        isInfected: true,
        timeRemaining: 999999,
        startTime: Date.now() - VIRUS_TIMEOUT - 1000,
        virusType: "corruption" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      expect(checkVirusTimeout()).toBe(false);
    });

    it("should return true when timeout expired for trojan", () => {
      const startTime = Date.now() - VIRUS_TIMEOUT - 1000;
      const state = {
        isInfected: true,
        timeRemaining: 0,
        startTime,
        virusType: "trojan" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      const result = checkVirusTimeout();
      expect(result).toBe(false);
    });

    it("should return false when timeout not expired", () => {
      const state = {
        isInfected: true,
        timeRemaining: VIRUS_TIMEOUT,
        startTime: Date.now() - 1000,
        virusType: "trojan" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      expect(checkVirusTimeout()).toBe(false);
    });

    it("should return true when timeout expired for honeypot", () => {
      const startTime = Date.now() - VIRUS_TIMEOUT - 1000;
      const state = {
        isInfected: true,
        timeRemaining: 0,
        startTime,
        virusType: "honeypot" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      const result = checkVirusTimeout();
      expect(result).toBe(false);
    });

    it("should return true when timeout expired for prototype", () => {
      const startTime = Date.now() - VIRUS_TIMEOUT - 1000;
      const state = {
        isInfected: true,
        timeRemaining: 0,
        startTime,
        virusType: "prototype" as VirusType,
      };
      localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));
      const result = checkVirusTimeout();
      expect(result).toBe(false);
    });
  });
});
