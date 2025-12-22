import { CommandFunction } from "../types";
import {
  getServersRequiringCrack,
  getServerByIP,
  isServerCracked,
} from "../utils/servers";
import {
  addSession,
  removeSession,
  getActiveSessions,
  hasActiveSession,
  clearAllSessions,
} from "../utils/sessions";

export const networkCommands: Record<string, CommandFunction> = {
  hack: (args) => {
    const target = args && args.length > 0 ? args[0] : null;

    const randomIP = () => {
      return `${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    };

    const randomPort = () => Math.floor(Math.random() * 65535);
    const randomMAC = () => {
      const hex = "0123456789ABCDEF";
      return Array.from({ length: 6 }, () =>
        Array.from(
          { length: 2 },
          () => hex[Math.floor(Math.random() * 16)]
        ).join("")
      ).join(":");
    };

    const targetIP = target || randomIP();
    const server = target ? getServerByIP(target) : null;
    const finalTarget = target || targetIP;

    if (server && server.requiresCrack && target) {
      if (isServerCracked(target)) {
        const ports = [22, 80, 443, 3389, randomPort()].sort(
          () => Math.random() - 0.5
        );
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
          `> Found ${ports.length} open ports: ${ports
            .slice(0, 3)
            .join(", ")}...`,
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
        return [
          `> Initializing hack sequence for target: ${target}`,
          "",
          "> [PHASE 1] Network reconnaissance",
          `> Scanning ${targetIP}...`,
          `> Server identified: ${server.name}`,
          `> Description: ${server.description}`,
          "",
          "> [PHASE 2] Vulnerability assessment",
          "> Analyzing security protocols...",
          "> Password-protected SSH access detected",
          "> Standard exploits failed - password required",
          "",
          "> [PHASE 3] Authentication required",
          "> PASSWORD PROTECTION DETECTED",
          "",
          `> This server requires password cracking.`,
          `> Use: crack ${target} <password>`,
          "",
          `> Hint: Check files for password clues:`,
          ...server.hintFiles.map((f) => `>   - ${f}`),
          "",
        ];
      }
    }

    const ports = [22, 80, 443, 3389, randomPort()].sort(
      () => Math.random() - 0.5
    );
    const macAddress = randomMAC();
    const vulnerability = [
      "SQL Injection",
      "Buffer Overflow",
      "XSS",
      "RCE",
      "Privilege Escalation",
    ][Math.floor(Math.random() * 5)];
    const dataSize = Math.floor(Math.random() * 5000) + 1000;

    const steps = [
      target
        ? `> Initializing hack sequence for target: ${target}`
        : `> Initializing hack sequence...`,
      "",
      "> [PHASE 1] Network reconnaissance",
      `> Scanning ${targetIP}...`,
      `> Found ${ports.length} open ports: ${ports.slice(0, 3).join(", ")}...`,
      `> MAC Address: ${macAddress}`,
      "",
      "> [PHASE 2] Vulnerability assessment",
      `> Analyzing port ${ports[0]}...`,
      `> Vulnerability detected: ${vulnerability}`,
      `> Exploit compatibility: ${Math.floor(Math.random() * 30) + 70}%`,
      "",
      "> [PHASE 3] Exploitation",
      "> Loading exploit module...",
      "> Bypassing firewall rules...",
      "> Injecting payload...",
      `> Connection established on port ${ports[0]}`,
      "",
      "> [PHASE 4] Privilege escalation",
      "> Attempting root access...",
      "> Bypassing security protocols...",
      "> Access level: ADMIN",
      "",
      "> [PHASE 5] Data extraction",
      `> Extracting ${dataSize} KB of data...`,
      "> [                    ] 0%",
      "> [██                  ] 20%",
      "> [█████               ] 40%",
      "> [███████             ] 60%",
      "> [██████████          ] 80%",
      "> [████████████████████] 100%",
      "",
      `> Hack complete. System ${targetIP} compromised.`,
      `> Data extracted: ${dataSize} KB`,
      `> Session active. Type "disconnect" to close.`,
      "",
    ];

    addSession({
      targetIP: finalTarget,
      startTime: Date.now(),
      dataSize,
      accessLevel: "ADMIN",
    });

    return steps;
  },

  disconnect: (args) => {
    const target = args && args.length > 0 ? args[0] : null;
    const sessions = getActiveSessions();

    if (sessions.length === 0) {
      return [
        "> No active sessions found.",
        "> Use 'hack <target>' to establish a connection.",
        "",
      ];
    }

    if (target) {
      if (target.toLowerCase() === "all") {
        const count = sessions.length;
        clearAllSessions();
        return [
          `> Disconnecting from all sessions...`,
          `> ${count} connection(s) closed.`,
          "> All sessions terminated.",
          "",
        ];
      }

      const removed = removeSession(target);
      if (removed) {
        return [
          `> Disconnecting from ${target}...`,
          "> Connection closed.",
          "> Session terminated.",
          "",
        ];
      } else {
        return [
          `> No active session found for ${target}.`,
          "> Use 'sessions' to view active connections.",
          "",
        ];
      }
    } else {
      if (sessions.length === 1) {
        const session = sessions[0];
        removeSession(session.targetIP);
        return [
          `> Disconnecting from ${session.targetIP}...`,
          "> Connection closed.",
          "> Session terminated.",
          "",
        ];
      } else {
        return [
          "> Multiple active sessions found:",
          "",
          ...sessions.map((s) => `>   ${s.targetIP}`),
          "",
          "> Specify target: disconnect <target>",
          "> Or use: disconnect all",
          "",
        ];
      }
    }
  },

  sessions: () => {
    const sessions = getActiveSessions();

    if (sessions.length === 0) {
      return [
        "> No active sessions.",
        "> Use 'hack <target>' to establish a connection.",
        "",
      ];
    }

    const result = [
      "ACTIVE HACK SESSIONS:",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ];

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const duration = Math.floor((Date.now() - session.startTime) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      result.push(`  [SESSION ${i + 1}]`);
      result.push(`  Target: ${session.targetIP}`);
      result.push(`  Access Level: ${session.accessLevel}`);
      result.push(`  Data Extracted: ${session.dataSize} KB`);
      result.push(`  Duration: ${timeStr}`);

      if (i < sessions.length - 1) {
        result.push("");
        result.push("  ───────────────────────────────");
        result.push("");
      }
    }

    result.push("");
    result.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    result.push("");
    result.push("> Use 'disconnect <target>' to close a session.");
    result.push("");

    return result;
  },

  scan: async () => {
    try {
      const { getMyIP } = await import("../utils/api");
      const ipInfo = await getMyIP();
      const servers = getServersRequiringCrack();

      const result = [
        "> Scanning network...",
        "",
        "FOUND TARGETS:",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `  ${ipInfo.ip.padEnd(15)} - YOUR IP (${ipInfo.country || "UNKNOWN"})`,
      ];

      if (ipInfo.city) {
        result.push(
          `  Location: ${ipInfo.city}${
            ipInfo.region ? `, ${ipInfo.region}` : ""
          }${ipInfo.country ? `, ${ipInfo.country}` : ""}`
        );
      }

      result.push("");
      result.push("  VULNERABLE SERVERS:");
      for (const server of servers) {
        const status = isServerCracked(server.ip)
          ? "[CRACKED]"
          : `[${server.name}]`;
        result.push(
          `  ${server.ip.padEnd(15)} - ${status} ${server.description}`
        );
      }

      result.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      result.push("");

      return result;
    } catch (error) {
      return [
        "> Scanning network...",
        "",
        "FOUND TARGETS:",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        ...getServersRequiringCrack().map(
          (s) => `  ${s.ip.padEnd(15)} - [${s.name}] ${s.description}`
        ),
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
      ];
    }
  },

  connect: (args) => {
    if (!args || args.length === 0) {
      return ["Usage: connect <target>", "Example: connect 192.168.1.42", ""];
    }
    const target = args[0];

    if (hasActiveSession(target)) {
      return [
        `> Already connected to ${target}.`,
        "> Use 'disconnect' to close the connection first.",
        "",
      ];
    }

    addSession({
      targetIP: target,
      startTime: Date.now(),
      dataSize: 0,
      accessLevel: "GUEST",
    });

    return [
      `> Connecting to ${target}...`,
      "> Establishing secure connection...",
      `> Connected to ${target}`,
      `> Access level: GUEST`,
      `> Type "disconnect" to close connection`,
      "",
    ];
  },

  ping: async (args) => {
    if (!args || args.length === 0) {
      return ["Usage: ping <host>", "Example: ping 192.168.1.1", ""];
    }

    const host = args[0];

    if (host.toLowerCase() === "myip" || host.toLowerCase() === "ip") {
      try {
        const { getMyIP } = await import("../utils/api");
        const ipInfo = await getMyIP();

        const result = [
          "> Fetching your IP address...",
          "",
          `Your IP: ${ipInfo.ip}`,
        ];

        if (ipInfo.city || ipInfo.country) {
          const location = [ipInfo.city, ipInfo.region, ipInfo.country]
            .filter(Boolean)
            .join(", ");
          result.push(`Location: ${location}`);
        }

        result.push("");
        return result;
      } catch (error: any) {
        return [`Error: ${error?.message || "Failed to fetch IP address"}`, ""];
      }
    }

    try {
      const { pingHost } = await import("../utils/api");
      const pingResult = await pingHost(host);

      if (pingResult.success && pingResult.latency) {
        const latency = pingResult.latency;
        const latency2 = latency + Math.floor(Math.random() * 10) - 5;
        const latency3 = latency + Math.floor(Math.random() * 10) - 5;

        return [
          `Pinging ${host}...`,
          "",
          `Reply from ${host}: bytes=32 time=${Math.max(latency, 1)}ms TTL=64`,
          `Reply from ${host}: bytes=32 time=${Math.max(latency2, 1)}ms TTL=64`,
          `Reply from ${host}: bytes=32 time=${Math.max(latency3, 1)}ms TTL=64`,
          "",
          `Ping statistics for ${host}:`,
          `  Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)`,
          `  Approximate round trip times in milli-seconds:`,
          `    Minimum = ${Math.min(
            latency,
            latency2,
            latency3
          )}ms, Maximum = ${Math.max(
            latency,
            latency2,
            latency3
          )}ms, Average = ${Math.floor((latency + latency2 + latency3) / 3)}ms`,
          "",
        ];
      } else {
        return [
          `Pinging ${host}...`,
          "",
          `Request timed out.`,
          `Host ${host} is unreachable.`,
          "",
        ];
      }
    } catch (error: any) {
      const latency = Math.floor(Math.random() * 50) + 10;
      return [
        `Pinging ${host}...`,
        "",
        `Reply from ${host}: bytes=32 time=${latency}ms TTL=64`,
        `Reply from ${host}: bytes=32 time=${
          latency + Math.floor(Math.random() * 10)
        }ms TTL=64`,
        `Reply from ${host}: bytes=32 time=${
          latency - Math.floor(Math.random() * 5)
        }ms TTL=64`,
        "",
        `Ping statistics for ${host}:`,
        `  Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)`,
        "",
      ];
    }
  },
};
