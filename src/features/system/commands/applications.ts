import type { CommandFunction } from "../../../types";

export const applicationsCommands: Record<string, CommandFunction> = {
  open: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: open <application>",
        "",
        "Available applications:",
        "  player.exe    - Open music player",
        "  mail.exe      - Open mail client",
        "",
        "Example: open player.exe",
        "Example: open mail.exe",
        "",
      ];
    }

    const app = args[0];
    if (app === "player.exe" || app === "./player.exe") {
      import("@features/music/lib/musicPlayerManager").then(module => {
        module.openMusicPlayer();
      });
      return ["Opening music player...", ""];
    }

    if (app === "mail.exe" || app === "./mail.exe") {
      import("@shared/lib/applicationManager").then(module => {
        module.applicationManager.openApp("email");
      });
      return ["Opening mail client...", ""];
    }

    return [`Unknown application: ${app}`, 'Type "open" for available applications', ""];
  },
};
