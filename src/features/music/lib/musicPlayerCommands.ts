import { getFilteredCommandHandler } from "@entities/command/model";
import type { CommandContext } from "@entities/command/types";

import { musicPlayer } from "./musicPlayer";
import type { CommandResult } from "../../../types";

// Разрешенные команды в плеере
export const ALLOWED_MUSIC_PLAYER_COMMANDS = [
  "help",
  "clear",
  "exit",
  "close",
  "size",
  "theme",
  "play",
  "stop",
  "pause",
  "next",
  "prev",
  "list",
  "info",
  "volume",
  "shuffle",
  "repeat",
  "search",
  "seek",
  "reload",
  "stats",
  "history",
  "jump",
  "visualization",
];

const musicCommands: Record<string, (args: string[]) => string[] | Promise<string[]>> = {
  help: () => {
    return [
      "",
      "MUSIC PLAYER COMMANDS:",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "MUSIC:",
      "  play [track]    - Play/Resume or play specific track",
      "  pause           - Pause playback",
      "  stop            - Stop playback",
      "  next            - Next track",
      "  prev            - Previous track",
      "  list [page]     - Show playlist (with pagination)",
      "  info            - Show current track info",
      "  volume [0-100]  - Set volume",
      "  shuffle [on|off] - Toggle shuffle mode",
      "  repeat [off|one|all] - Set repeat mode",
      "  search <query>  - Search tracks by name/artist",
      "  seek <time>     - Seek to position (seconds or MM:SS)",
      "  reload           - Reload playlist from metadata.json",
      "  stats            - Show playlist statistics",
      "  history [N|all]  - Show playback history (last N tracks)",
      "  jump <N|name>    - Jump to track by number or name",
      "  visualization [mode] - Set visualization mode (bars/waves/circles/spectrum)",
      "",
      "GENERAL:",
      "  help            - Show this help",
      "  clear           - Clear terminal",
      "  size <w> <h>    - Change player window size",
      "  close / exit    - Close player",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ];
  },
  play: args => {
    if (args.length > 0) {
      musicPlayer.play(args[0]);
      return [`Playing: ${args[0]}`, ""];
    } else {
      musicPlayer.play();
      return ["Resuming playback...", ""];
    }
  },
  pause: () => {
    musicPlayer.pause();
    return ["Paused", ""];
  },
  stop: () => {
    musicPlayer.stop();
    return ["Stopped", ""];
  },
  next: () => {
    musicPlayer.next();
    return ["Next track", ""];
  },
  prev: () => {
    musicPlayer.prev();
    return ["Previous track", ""];
  },
  list: args => {
    const playlist = musicPlayer.getPlaylist();
    if (playlist.length === 0) {
      return ["Playlist is empty", ""];
    }

    if (args.length >= 2 && args[0].toLowerCase() === "search") {
      const query = args.slice(1).join(" ");
      const results = musicPlayer.searchTracks(query);
      if (results.length === 0) {
        return [`No tracks found for: "${query}"`, ""];
      } else {
        const output = [`Found ${results.length} track(s):`, ""];
        results.forEach(track => {
          const playlistIndex = playlist.findIndex(t => t.filename === track.filename);
          const marker = playlistIndex === musicPlayer.getState().currentIndex ? ">" : " ";
          output.push(`${marker} ${playlistIndex + 1}. ${track.title} - ${track.artist}`);
        });
        output.push("");
        return output;
      }
    }

    const ITEMS_PER_PAGE = 15;
    const totalPages = Math.ceil(playlist.length / ITEMS_PER_PAGE);
    let page = 1;

    if (args.length > 0) {
      const pageNum = parseInt(args[0]);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
        page = pageNum;
      } else {
        return [`Invalid page number. Available pages: 1-${totalPages}`, ""];
      }
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, playlist.length);
    const currentIndex = musicPlayer.getState().currentIndex;

    const output = [`Playlist (${playlist.length} tracks, page ${page}/${totalPages}):`, ""];

    for (let i = startIndex; i < endIndex; i++) {
      const track = playlist[i];
      const marker = i === currentIndex ? ">" : " ";
      output.push(`${marker} ${i + 1}. ${track.title} - ${track.artist}`);
    }

    if (totalPages > 1) {
      output.push("");
      output.push(`Use "list ${page < totalPages ? page + 1 : page}" for next page`);
    }
    output.push("");
    return output;
  },
  info: () => {
    const track = musicPlayer.getCurrentTrack();
    if (track) {
      const state = musicPlayer.getState();
      return [
        `Current Track: ${track.title}`,
        `Artist: ${track.artist}`,
        `Duration: ${Math.floor(state.duration)}s`,
        `Position: ${Math.floor(state.position)}s`,
        `Status: ${state.status}`,
        `Volume: ${state.volume}%`,
        "",
      ];
    } else {
      return ["No track loaded", ""];
    }
  },
  volume: args => {
    if (args.length > 0) {
      const vol = parseInt(args[0]);
      if (!isNaN(vol) && vol >= 0 && vol <= 100) {
        musicPlayer.setVolume(vol);
        return [`Volume set to ${vol}%`, ""];
      } else {
        return ["Usage: volume <0-100>", ""];
      }
    } else {
      return [`Current volume: ${musicPlayer.getVolume()}%`, ""];
    }
  },
  shuffle: args => {
    if (args.length > 0) {
      const mode = args[0].toLowerCase();
      if (mode === "on" || mode === "true" || mode === "1") {
        musicPlayer.setShuffle(true);
        return ["Shuffle: ON", ""];
      } else if (mode === "off" || mode === "false" || mode === "0") {
        musicPlayer.setShuffle(false);
        return ["Shuffle: OFF", ""];
      } else {
        return ["Usage: shuffle <on|off>", ""];
      }
    } else {
      const isOn = musicPlayer.getShuffle();
      return [`Shuffle: ${isOn ? "ON" : "OFF"}`, ""];
    }
  },
  repeat: args => {
    if (args.length > 0) {
      const mode = args[0].toLowerCase();
      if (mode === "off" || mode === "one" || mode === "all") {
        musicPlayer.setRepeat(mode as "off" | "one" | "all");
        return [`Repeat: ${mode.toUpperCase()}`, ""];
      } else {
        return ["Usage: repeat <off|one|all>", ""];
      }
    } else {
      const mode = musicPlayer.getRepeat();
      return [`Repeat: ${mode.toUpperCase()}`, ""];
    }
  },
  search: args => {
    if (args.length === 0) {
      return ["Usage: search <query>", "Example: search mothra", ""];
    }
    const query = args.join(" ");
    const results = musicPlayer.searchTracks(query);
    if (results.length === 0) {
      return [`No tracks found for: "${query}"`, ""];
    } else {
      const output = [`Found ${results.length} track(s):`, ""];
      results.forEach(track => {
        output.push(`${track.title} - ${track.artist}`);
      });
      output.push("");
      return output;
    }
  },
  seek: args => {
    if (args.length === 0) {
      return [
        "Usage: seek <time>",
        "Examples:",
        "  seek 30      - Seek to 30 seconds",
        "  seek 1:30   - Seek to 1 minute 30 seconds",
        "",
      ];
    }
    const timeStr = args[0];
    const time = musicPlayer.parseTime(timeStr);
    if (time < 0) {
      return ["Invalid time format", "Use seconds (30) or MM:SS (1:30)", ""];
    }
    const success = musicPlayer.seek(time);
    if (success) {
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      return [`Seeked to ${mins}:${secs.toString().padStart(2, "0")}`, ""];
    } else {
      return ["Failed to seek. Make sure a track is loaded.", ""];
    }
  },
  reload: () => {
    musicPlayer.reloadMetadata();
    const playlist = musicPlayer.getPlaylist();
    return [`Playlist reloaded: ${playlist.length} track(s)`, ""];
  },
  stats: () => {
    const stats = musicPlayer.getStats();
    const formatTime = (seconds: number): string => {
      if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const output = [
      "Playlist Statistics:",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `Total tracks: ${stats.totalTracks}`,
      `Total duration: ${formatTime(stats.totalDuration)}`,
      "",
    ];

    if (stats.currentDuration > 0) {
      output.push(
        `Current track: ${formatTime(stats.currentPosition)} / ${formatTime(stats.currentDuration)}`
      );
      output.push("");
    }

    if (stats.artists.length > 0) {
      output.push("Artists:");
      stats.artists.forEach(artist => {
        output.push(
          `  ${artist.name}: ${artist.count} track(s) (${artist.percentage.toFixed(1)}%)`
        );
      });
    }

    output.push("");
    return output;
  },
  history: args => {
    const history = musicPlayer.getHistory();
    if (history.length === 0) {
      return ["Playback history is empty", ""];
    }

    let limit: number | undefined = 10;

    if (args.length > 0) {
      if (args[0].toLowerCase() === "all") {
        limit = undefined;
      } else {
        const num = parseInt(args[0]);
        if (!isNaN(num) && num > 0) {
          limit = num;
        } else {
          return [
            "Usage: history [N|all]",
            "Examples:",
            "  history      - Show last 10 tracks",
            "  history 20   - Show last 20 tracks",
            "  history all  - Show all history",
            "",
          ];
        }
      }
    }

    const historyToShow = limit ? history.slice(0, limit) : history;

    const output = [
      `Playback History (${historyToShow.length} of ${history.length} tracks):`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ];

    historyToShow.forEach((track, idx) => {
      output.push(`${idx + 1}. ${track.title} - ${track.artist}`);
    });

    output.push("");
    return output;
  },
  jump: async args => {
    if (args.length === 0) {
      return [
        "Usage: jump <N|name>",
        "Examples:",
        "  jump 5        - Jump to track #5",
        "  jump mothra   - Jump to track matching 'mothra'",
        "",
      ];
    }

    const query = args.join(" ");
    const isNumber = !isNaN(Number(query));
    const indexOrName = isNumber ? Number(query) : query;

    const result = await musicPlayer.jumpToTrack(indexOrName);

    if (result.success && result.track) {
      return [`Jumped to: ${result.track.title} - ${result.track.artist}`, ""];
    }

    if (result.matches && result.matches.length > 1) {
      const output = [`Multiple tracks found (${result.matches.length}):`, ""];
      result.matches.forEach(track => {
        const playlistIndex = musicPlayer
          .getPlaylist()
          .findIndex(t => t.filename === track.filename);
        output.push(`${playlistIndex + 1}. ${track.title} - ${track.artist}`);
      });
      output.push("");
      output.push('Use "jump <number>" to select a specific track');
      output.push("");
      return output;
    }

    if (result.matches && result.matches.length === 0) {
      return [`No tracks found matching: "${query}"`, ""];
    }

    return [`Failed to jump to track: "${query}"`, ""];
  },
  visualization: args => {
    if (args.length === 0) {
      const currentMode = musicPlayer.getVisualizationMode();
      return [
        `Current visualization mode: ${currentMode}`,
        "",
        "Available modes:",
        "  bars      - Vertical bars (default)",
        "  waves     - Horizontal waves",
        "  spectrum  - Spectrum line",
        "",
        "Usage: visualization <mode>",
        "",
      ];
    }

    const mode = args[0].toLowerCase();
    const validModes = ["bars", "waves", "spectrum"];

    if (!validModes.includes(mode)) {
      return [
        `Invalid visualization mode: ${mode}`,
        `Available modes: ${validModes.join(", ")}`,
        "",
      ];
    }

    musicPlayer.setVisualizationMode(mode as "bars" | "waves" | "spectrum");
    return [`Visualization mode set to: ${mode}`, ""];
  },
};

export const handleMusicPlayerCommand = async (
  command: string,
  args: string[],
  context: CommandContext
): Promise<CommandResult> => {
  const lowerCommand = command.toLowerCase();

  if (musicCommands[lowerCommand]) {
    const result = musicCommands[lowerCommand](args);
    const output = result instanceof Promise ? await result : result;
    return { output };
  }

  const getHandler = getFilteredCommandHandler(ALLOWED_MUSIC_PLAYER_COMMANDS);
  const handler = getHandler(lowerCommand);

  if (handler) {
    return await handler(args, context);
  }

  return {
    output: [`Command not found: ${command}`, 'Type "help" for available commands', ""],
    isError: true,
  };
};
