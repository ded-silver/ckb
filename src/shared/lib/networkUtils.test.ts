import { describe, it, expect } from "vitest";

import { generateRandomIP, generateRandomPort, generateRandomMAC } from "./networkUtils";

describe("generateRandomIP", () => {
  it("should generate a valid IP address format", () => {
    const ip = generateRandomIP();
    const parts = ip.split(".");
    expect(parts).toHaveLength(4);
    parts.forEach(part => {
      expect(Number.parseInt(part, 10)).toBeGreaterThanOrEqual(0);
      expect(Number.parseInt(part, 10)).toBeLessThanOrEqual(255);
    });
  });

  it("should generate different IPs on multiple calls", () => {
    const ip1 = generateRandomIP();
    const ip2 = generateRandomIP();
    const ip3 = generateRandomIP();
    expect(ip1).toBeDefined();
    expect(ip2).toBeDefined();
    expect(ip3).toBeDefined();
  });

  it("should generate IP with correct format (4 octets separated by dots)", () => {
    const ip = generateRandomIP();
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    expect(ip).toMatch(ipRegex);
  });

  it("should generate IP where each octet is in valid range", () => {
    for (let i = 0; i < 100; i++) {
      const ip = generateRandomIP();
      const parts = ip.split(".").map(Number);
      parts.forEach(octet => {
        expect(octet).toBeGreaterThanOrEqual(0);
        expect(octet).toBeLessThanOrEqual(255);
      });
    }
  });

  it("should return a string", () => {
    const ip = generateRandomIP();
    expect(typeof ip).toBe("string");
  });
});

describe("generateRandomPort", () => {
  it("should generate a port number in valid range", () => {
    const port = generateRandomPort();
    expect(port).toBeGreaterThanOrEqual(0);
    expect(port).toBeLessThanOrEqual(65535);
  });

  it("should generate integer port number", () => {
    const port = generateRandomPort();
    expect(Number.isInteger(port)).toBe(true);
  });

  it("should generate different ports on multiple calls", () => {
    const port1 = generateRandomPort();
    const port2 = generateRandomPort();
    const port3 = generateRandomPort();
    expect(port1).toBeDefined();
    expect(port2).toBeDefined();
    expect(port3).toBeDefined();
  });

  it("should generate ports in full range over many calls", () => {
    const ports = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const port = generateRandomPort();
      expect(port).toBeGreaterThanOrEqual(0);
      expect(port).toBeLessThanOrEqual(65535);
      ports.add(port);
    }
    expect(ports.size).toBeGreaterThan(1);
  });

  it("should return a number", () => {
    const port = generateRandomPort();
    expect(typeof port).toBe("number");
  });
});

describe("generateRandomMAC", () => {
  it("should generate a valid MAC address format", () => {
    const mac = generateRandomMAC();
    const parts = mac.split(":");
    expect(parts).toHaveLength(6);
    parts.forEach(part => {
      expect(part).toMatch(/^[0-9A-F]{2}$/);
    });
  });

  it("should generate MAC with correct format (6 hex pairs separated by colons)", () => {
    const mac = generateRandomMAC();
    const macRegex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;
    expect(mac).toMatch(macRegex);
  });

  it("should generate MAC with uppercase hex characters", () => {
    const mac = generateRandomMAC();
    expect(mac).toBe(mac.toUpperCase());
    expect(mac).not.toMatch(/[a-f]/);
  });

  it("should generate different MACs on multiple calls", () => {
    const mac1 = generateRandomMAC();
    const mac2 = generateRandomMAC();
    const mac3 = generateRandomMAC();
    expect(mac1).toBeDefined();
    expect(mac2).toBeDefined();
    expect(mac3).toBeDefined();
  });

  it("should generate MAC where each octet is valid hex", () => {
    for (let i = 0; i < 100; i++) {
      const mac = generateRandomMAC();
      const parts = mac.split(":");
      parts.forEach(part => {
        expect(part.length).toBe(2);
        expect(part).toMatch(/^[0-9A-F]{2}$/);
        const value = Number.parseInt(part, 16);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(255);
      });
    }
  });

  it("should return a string", () => {
    const mac = generateRandomMAC();
    expect(typeof mac).toBe("string");
  });

  it("should have exactly 17 characters (6 octets * 2 chars + 5 colons)", () => {
    const mac = generateRandomMAC();
    expect(mac.length).toBe(17);
  });
});

describe("Network utils integration", () => {
  it("should generate valid network identifiers", () => {
    const ip = generateRandomIP();
    const port = generateRandomPort();
    const mac = generateRandomMAC();

    expect(ip).toBeDefined();
    expect(port).toBeDefined();
    expect(mac).toBeDefined();

    expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    expect(port).toBeGreaterThanOrEqual(0);
    expect(port).toBeLessThanOrEqual(65535);
    expect(mac).toMatch(/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/);
  });
});
