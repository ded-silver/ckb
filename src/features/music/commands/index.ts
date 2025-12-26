import type { CommandFunction } from "../../../types";
import { openMusicPlayer } from "../lib/musicPlayerManager";

export const musicCommands: Record<string, CommandFunction> = {
  music: args => {
    if (!args || args.length === 0) {
      return [
        "",
        "MUSIC PLAYER",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "Usage: music <command>",
        "",
        "Commands:",
        "  open    - Open music player",
        "  close   - Close music player (use 'close' or 'exit' inside player)",
        "  help    - Show this help",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
      ];
    }

    const command = args[0].toLowerCase();

    switch (command) {
      case "open":
        openMusicPlayer();
        return ["Opening music player...", ""];
      case "help":
        return [
          "",
          "MUSIC PLAYER",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "",
          "Usage: music <command>",
          "",
          "Commands:",
          "  open    - Open music player",
          "  close   - Close music player (use 'close' or 'exit' inside player)",
          "  help    - Show this help",
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "",
        ];
      default:
        return [`Unknown command: ${command}`, 'Type "music help" for help', ""];
    }
  },
};
