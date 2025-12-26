import { getBrowserInfo, formatUserInfo, formatSystemInfo } from "@shared/lib/browser";

import type { CommandFunction } from "../../../types";

export const basicCommands: Record<string, CommandFunction> = {
  help: args => {
    if (args && (args.includes("--secret") || args.includes("--hidden"))) {
      return [
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "SECRET COMMANDS",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "You found the secret help menu!",
        "",
        "Try these hidden commands:",
        "  konami          - Classic cheat code (Konami Code)",
        "  matrix          - Wake up, Neo... (The Matrix)",
        "  sudo            - Access denied joke",
        "  hacktheworld    - Global hack sequence",
        "  easteregg       - You found one!",
        "  ghost           - Ghost in the Shell reference",
        "  blade           - Blade Runner (Tears in rain)",
        "  tron            - Greetings, Program! (Tron)",
        "  deus            - Deus Ex reference",
        "  wake            - Wake up, samurai (Cyberpunk 2077)",
        "  rosebud         - The Sims cheat code",
        "  idkfa           - Doom cheat code",
        "  thereisnospoon  - The Matrix (Bend the spoon)",
        "",
        "Also try:",
        "  echo 'hello world'  - Classic programming",
        "  echo '42'           - The Answer",
        "  cat /dev/null       - Nothing to see",
        "",
        "Keep exploring! There's more to discover.",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
      ];
    }

    return [
      "",
      "AVAILABLE COMMANDS:",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "BASIC:",
      "  help, clear, whoami, date, system",
      "",
      "NETWORK:",
      "  ping <host>       - Ping host",
      "  hack [target]     - Simulate hacking",
      "  scan              - Scan network",
      "  connect <target>  - Connect to target",
      "  disconnect [target] - Close active session",
      "  sessions          - Show active hack sessions",
      "",
      "GAMES:",
      "  crack <target> <password> - Crack server password",
      "  crack status [target]     - Show crack status",
      "",
      "GAMIFICATION:",
      "  missions [id]     - Show missions/quests",
      "  quest [id]        - Alias for missions",
      "  status            - Show progress statistics",
      "",
      "SYSTEM:",
      "  ps                - List processes",
      "  uptime            - Show uptime",
      "  free              - Memory usage",
      "  df                - Disk usage",
      "  stats [reset]    - Command statistics",
      "  history [search]  - Command history",
      "",
      "UTILITIES:",
      "  crypto <text>     - Encrypt text",
      "  weather [loc]     - Show weather",
      "  quote             - Random quote",
      "  neofetch          - System info (ASCII)",
      "  cowsay <text>     - Make cow say text",
      "  figlet <text>     - ASCII art text",
      "  dice [sides]      - Roll dice",
      "  joke              - Random joke",
      "  notify <msg>      - Show notification",
      "",
      "APPLICATIONS:",
      "  open <app>        - Open application (e.g., open player.exe)",
      "  music <command>   - Music player commands",
      "",
      "TERMINAL:",
      "  theme <name>      - Change theme",
      "  size <w> <h>      - Change size",
      "  su <user> [host]  - Switch user",
      "  config            - Show configuration",
      "  about             - About terminal",
      "  exit              - Exit terminal",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ];
  },

  clear: () => [],

  whoami: () => {
    const browserInfo = getBrowserInfo();
    return formatUserInfo(browserInfo);
  },

  date: () => {
    const now = new Date();
    const browserInfo = getBrowserInfo();

    const localDate = now.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const localTime = now.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const utcTime = now.toUTCString();

    const pageLoadTime = performance.timing
      ? Math.floor((Date.now() - performance.timing.navigationStart) / 1000 / 60)
      : null;

    const result = [
      `Current Date: ${localDate}`,
      `Current Time: ${localTime}`,
      `UTC Time: ${utcTime}`,
      `Timezone: ${browserInfo.timezone}`,
    ];

    if (pageLoadTime !== null) {
      result.push(`Page Uptime: ${pageLoadTime} minutes`);
    }

    result.push("");
    return result;
  },

  system: () => {
    const browserInfo = getBrowserInfo();
    return formatSystemInfo(browserInfo);
  },

  matrix: () => [
    "Matrix mode already active.",
    "Background process running...",
    "Status: ENABLED",
    "",
  ],

  about: () => [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "CYBERPUNK TERMINAL v2.0.2077",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "A retro cyberpunk terminal interface",
    "Built with React + TypeScript",
    "",
    "Features:",
    "  - Matrix Rain background effect",
    "  - ASCII art logo",
    "  - Command system",
    "  - CRT monitor effects",
    "  - Retro 4:3 aspect ratio",
    "",
    "Welcome to the future of the past!",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ],

  exit: () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return ["Exiting terminal...", "Goodbye!", ""];
  },
};
