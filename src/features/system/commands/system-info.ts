import type { CommandFunction } from "../../../types";

interface PerformanceNavigation {
  startTime?: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    jsHeapSizeLimit: number;
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export const systemInfoCommands: Record<string, CommandFunction> = {
  stats: args => {
    try {
      const statsData = localStorage.getItem("cyberpunk_command_stats");
      const stats = statsData ? JSON.parse(statsData) : {};

      if (args && args.length > 0 && args[0] === "reset") {
        localStorage.removeItem("cyberpunk_command_stats");
        return ["Command statistics reset", ""];
      }

      if (Object.keys(stats).length === 0) {
        return [
          "No command statistics available yet.",
          "Statistics are tracked automatically.",
          "",
          "Usage: stats reset - Clear statistics",
          "",
        ];
      }

      const sorted = Object.entries(stats)
        .map(([cmd, count]) => ({ cmd, count: count as number }))
        .sort((a, b) => b.count - a.count);

      const total = sorted.reduce((sum, item) => sum + item.count, 0);

      return [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "COMMAND USAGE STATISTICS",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        `Total commands executed: ${total}`,
        `Unique commands: ${sorted.length}`,
        "",
        "Top commands:",
        ...sorted
          .slice(0, 10)
          .map(
            (item, idx) =>
              `  ${(idx + 1).toString().padStart(2)}. ${item.cmd.padEnd(20)} ${item.count} times`
          ),
        "",
        "Usage: stats reset - Clear statistics",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
      ];
    } catch (e) {
      return ["Error loading statistics", ""];
    }
  },

  ps: () => {
    const processes = [
      {
        pid: 1,
        name: "init",
        cpu: "0.0%",
        mem: "1.2%",
        status: "S",
        time: "00:00:01",
      },
      {
        pid: 42,
        name: "terminal",
        cpu: "2.3%",
        mem: "4.5%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 133,
        name: "matrix-rain",
        cpu: "1.1%",
        mem: "2.1%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 256,
        name: "browser-engine",
        cpu: "5.2%",
        mem: "8.3%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 512,
        name: "network-daemon",
        cpu: "0.5%",
        mem: "1.8%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 789,
        name: "file-system",
        cpu: "0.3%",
        mem: "1.5%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 1024,
        name: "crypto-service",
        cpu: "0.2%",
        mem: "0.9%",
        status: "S",
        time: "00:05:23",
      },
    ];

    const result = [
      "   PID  NAME                CPU    MEM    STATUS    TIME",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      ...processes.map(
        p =>
          `${p.pid.toString().padStart(5)}  ${p.name.padEnd(
            18
          )} ${p.cpu.padStart(6)} ${p.mem.padStart(6)} ${p.status.padStart(6)}    ${p.time}`
      ),
      "",
      `Total processes: ${processes.length}`,
      "",
    ];

    return result;
  },

  uptime: () => {
    const nav = performance.navigation as unknown as PerformanceNavigation;
    const timing = performance.timing;

    let uptimeSeconds = 0;
    if (timing && timing.navigationStart) {
      uptimeSeconds = Math.floor((Date.now() - timing.navigationStart) / 1000);
    } else if (nav && nav.startTime) {
      uptimeSeconds = Math.floor((Date.now() - nav.startTime) / 1000);
    }

    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    const uptimeStr =
      days > 0
        ? `${days} day${days > 1 ? "s" : ""}, ${hours}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        : `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    const loadAvg = (Math.random() * 0.5 + 0.3).toFixed(2);

    return [
      ` ${uptimeStr} up`,
      ` load average: ${loadAvg}, ${(parseFloat(loadAvg) + 0.1).toFixed(2)}, ${(
        parseFloat(loadAvg) + 0.2
      ).toFixed(2)}`,
      "",
    ];
  },

  free: () => {
    const nav = navigator as NavigatorWithMemory;
    const perf = performance as PerformanceWithMemory;

    let totalMem = 0;
    let usedMem = 0;
    let freeMem = 0;

    if (perf.memory) {
      // Chrome/Edge
      const memInfo = perf.memory;
      totalMem = Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024);
      usedMem = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);
      freeMem = totalMem - usedMem;
    } else if (nav.deviceMemory) {
      // Если доступна информация об устройстве
      totalMem = nav.deviceMemory * 1024; // GB to MB
      usedMem = Math.round(totalMem * 0.3);
      freeMem = totalMem - usedMem;
    } else {
      // Симуляция
      totalMem = 8192; // 8 GB
      usedMem = Math.round(totalMem * 0.35);
      freeMem = totalMem - usedMem;
    }

    const shared = Math.round(totalMem * 0.05);
    const buffCache = Math.round(totalMem * 0.1);
    const available = freeMem + buffCache;

    const result = [
      "              total        used        free      shared  buff/cache   available",
      "Mem:",
      `        ${totalMem.toString().padStart(10)} ${usedMem
        .toString()
        .padStart(10)} ${freeMem.toString().padStart(10)} ${shared
        .toString()
        .padStart(10)} ${buffCache.toString().padStart(10)} ${available.toString().padStart(10)}`,
      "",
    ];

    // Swap (симуляция)
    const swapTotal = 2048;
    const swapUsed = Math.round(swapTotal * 0.1);
    const swapFree = swapTotal - swapUsed;

    result.push("Swap:");
    result.push(
      `        ${swapTotal.toString().padStart(10)} ${swapUsed
        .toString()
        .padStart(10)} ${swapFree.toString().padStart(10)}`
    );
    result.push("");

    return result;
  },

  df: () => {
    let used = 0;
    let total = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || "";
          used += key.length + value.length;
        }
      }
      total = 5 * 1024 * 1024; // 5 MB
    } catch (e) {
      total = 5 * 1024 * 1024;
    }

    const usedMB = (used / 1024 / 1024).toFixed(2);
    const totalMB = (total / 1024 / 1024).toFixed(2);
    const availableMB = ((total - used) / 1024 / 1024).toFixed(2);
    const usePercent = ((used / total) * 100).toFixed(1);

    const result = [
      "Filesystem      Size  Used Avail Use% Mounted on",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `localStorage    ${totalMB}M  ${usedMB}M  ${availableMB}M  ${usePercent}% /`,
      "",
    ];

    const filesystems = [
      {
        name: "tmpfs",
        size: "512M",
        used: "12M",
        avail: "500M",
        use: "3%",
        mount: "/tmp",
      },
      {
        name: "devtmpfs",
        size: "256M",
        used: "0",
        avail: "256M",
        use: "0%",
        mount: "/dev",
      },
      {
        name: "proc",
        size: "0",
        used: "0",
        avail: "0",
        use: "-",
        mount: "/proc",
      },
    ];

    filesystems.forEach(fs => {
      result.push(
        `${fs.name.padEnd(14)} ${fs.size.padStart(6)} ${fs.used.padStart(
          6
        )} ${fs.avail.padStart(6)} ${fs.use.padStart(4)} ${fs.mount}`
      );
    });

    result.push("");
    return result;
  },
};
