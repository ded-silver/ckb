import { generateRandomIP, generateRandomPort, generateRandomMAC } from "@shared/lib/networkUtils";

import type { CommandFunction } from "../../../types";
import { getServerByIP, isServerCracked } from "../lib/servers";
import {
  addSession,
  removeSession,
  getActiveSessions,
  hasActiveSession,
  clearAllSessions,
} from "../lib/sessions";

export const networkCommands: Record<string, CommandFunction> = {
  hack: args => {
    const target = args && args.length > 0 ? args[0] : null;

    const targetIP = target || generateRandomIP();
    const server = target ? getServerByIP(target) : null;
    const finalTarget = target || targetIP;

    if (server && server.requiresCrack && target) {
      if (isServerCracked(target)) {
        const ports = [22, 80, 443, 3389, generateRandomPort()].sort(() => Math.random() - 0.5);
        const dataSize = Math.floor(Math.random() * 5000) + 1000;

        addSession({
          targetIP: finalTarget,
          startTime: Date.now(),
          dataSize,
          accessLevel: "ADMIN",
        });

        return [
          `> Initializing hack sequence for target: ${target}`,
          "",
          "> [PHASE 1] Network reconnaissance",
          `> Scanning ${targetIP}...`,
          `> Found ${ports.length} open ports: ${ports.slice(0, 3).join(", ")}...`,
          "",
          "> [PHASE 2] Authentication",
          "> Using cracked credentials...",
          "> Access granted!",
          "",
          "> [PHASE 3] Data extraction",
          `> Extracting ${dataSize} KB of data...`,
          "> [████████████████████] 100%",
          "",
          `> Hack complete. System ${targetIP} compromised.`,
          `> Data extracted: ${dataSize} KB`,
          `> Session active. Type "disconnect" to close.`,
          "",
        ];
      } else {
        const ports = [22, 80, 443, 3389, generateRandomPort()].sort(() => Math.random() - 0.5);
        return [
          `> Initializing hack sequence for target: ${target}`,
          "",
          "> [PHASE 1] Network reconnaissance",
          `> Scanning ${targetIP}...`,
          `> Found ${ports.length} open ports: ${ports.slice(0, 3).join(", ")}...`,
          "",
          "> [PHASE 2] Authentication",
          "> Password required!",
          "",
          `> Server ${target} requires password cracking.`,
          `> Use "crack ${target} <password>" to crack it first.`,
          "",
        ];
      }
    }

    if (target && hasActiveSession(target)) {
      return [
        `> Session already active for ${target}`,
        `> Type "disconnect ${target}" to close it first.`,
        "",
      ];
    }

    const ports = [22, 80, 443, 3389, generateRandomPort()].sort(() => Math.random() - 0.5);
    const dataSize = Math.floor(Math.random() * 5000) + 1000;
    const macAddress = generateRandomMAC();

    if (target) {
      addSession({
        targetIP: finalTarget,
        startTime: Date.now(),
        dataSize,
        accessLevel: "USER",
      });
    }

    return [
      `> Initializing hack sequence${target ? ` for target: ${target}` : ""}`,
      "",
      "> [PHASE 1] Network reconnaissance",
      `> Scanning ${targetIP}...`,
      `> Found ${ports.length} open ports: ${ports.slice(0, 3).join(", ")}...`,
      `> MAC Address: ${macAddress}`,
      "",
      "> [PHASE 2] Vulnerability scanning",
      "> Checking for known exploits...",
      "> Buffer overflow detected (CVE-2077-1337)",
      "> SQL injection point found",
      "",
      "> [PHASE 3] Exploitation",
      "> Injecting payload...",
      "> [████████████████] 75%",
      "> Bypassing firewall...",
      "> [████████████████████] 100%",
      "",
      "> [PHASE 4] Access gained",
      `> System ${targetIP} compromised.`,
      `> Data extracted: ${dataSize} KB`,
      "",
      target
        ? `> Session active. Type "disconnect ${target}" to close.`
        : "> Random target hacked. No session created.",
      "",
    ];
  },

  scan: () => {
    const servers = [
      { ip: "192.168.1.1", name: "Router", status: "PROTECTED" },
      { ip: "192.168.1.42", name: "Workstation", status: "VULNERABLE" },
      { ip: "192.168.1.100", name: "NeoCorp Vault", status: "ENCRYPTED" },
      {
        ip: generateRandomIP(),
        name: "Unknown",
        status: "UNKNOWN",
      },
    ];

    const output = [
      "",
      "NETWORK SCAN",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "Scanning local network...",
      "",
    ];

    servers.forEach(server => {
      output.push(`  ${server.ip.padEnd(15)} ${server.name.padEnd(20)} [${server.status}]`);
    });

    output.push("");
    output.push(`Found ${servers.length} host(s)`);
    output.push("");
    output.push('Use "hack <ip>" to attempt a breach');
    output.push("");

    return output;
  },

  connect: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: connect <target_ip>",
        "Connect to a previously hacked system",
        "",
        "Example: connect 192.168.1.42",
        "",
      ];
    }

    const target = args[0];
    if (!hasActiveSession(target)) {
      return [
        `No active session found for ${target}`,
        `Use "hack ${target}" first to establish a connection.`,
        "",
      ];
    }

    const sessions = getActiveSessions();
    const session = sessions.find(s => s.targetIP === target);
    if (!session) {
      return [`Session not found for ${target}`, ""];
    }

    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);

    return [
      `> Connected to ${target}`,
      `> Session started: ${elapsed} seconds ago`,
      `> Data extracted: ${session.dataSize} KB`,
      `> Access level: ${session.accessLevel}`,
      "",
      "> You are now connected to the remote system.",
      '> Type "disconnect" to close the connection.',
      "",
    ];
  },

  disconnect: args => {
    const target = args && args.length > 0 ? args[0] : null;

    if (target) {
      if (hasActiveSession(target)) {
        removeSession(target);
        return [`> Disconnected from ${target}`, "> Session closed.", ""];
      }
      return [`> No active session found for ${target}`, ""];
    }

    const sessions = getActiveSessions();
    if (sessions.length === 0) {
      return ["> No active sessions", ""];
    }

    clearAllSessions();
    return [`> Disconnected from ${sessions.length} session(s)`, "> All sessions closed.", ""];
  },

  sessions: () => {
    const sessions = getActiveSessions();

    if (sessions.length === 0) {
      return [
        "",
        "ACTIVE SESSIONS",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "No active sessions.",
        "",
        'Use "hack <target>" to create a session.',
        "",
      ];
    }

    const output = [
      "",
      "ACTIVE SESSIONS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "TARGET IP          DURATION    DATA SIZE    ACCESS",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ];

    sessions.forEach(session => {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      output.push(
        `${session.targetIP.padEnd(17)} ${duration.padEnd(
          11
        )} ${session.dataSize.toString().padEnd(12)} KB    ${session.accessLevel}`
      );
    });

    output.push("");
    output.push(`Total: ${sessions.length} active session(s)`);
    output.push("");
    output.push('Use "disconnect <target>" to close a session');
    output.push("");

    return output;
  },
};
