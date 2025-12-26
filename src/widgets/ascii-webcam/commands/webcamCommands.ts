import { getFilteredCommandHandler } from "@entities/command/model";
import type { CommandContext } from "@entities/command/types";

import type { CommandResult } from "../../../types";
import type { ASCIIStyle, Resolution } from "../model/types";
import { ASCII_STYLES, MAX_RESOLUTION } from "../ui/constants";
import { calculateOptimalResolution } from "../utils/resolutionUtils";

export const ALLOWED_WEBCAM_COMMANDS = [
  "help",
  "clear",
  "exit",
  "close",
  "size",
  "theme",
  "start",
  "stop",
  "on",
  "off",
  "resolution",
  "res",
  "style",
  "invert",
  "stats",
  "status",
];

interface WebcamState {
  isStreaming: boolean;
  fps: number;
  resolution: Resolution;
  style: ASCIIStyle;
  invert: boolean;
  size: { width: number; height: number };
}

interface WebcamCallbacks {
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  setResolution: (res: Resolution) => void;
  setStyle: (style: ASCIIStyle) => void;
  setInvert: (invert: boolean) => void;
}

const webcamCommands: Record<
  string,
  (args: string[], state: WebcamState, callbacks: WebcamCallbacks) => string[] | Promise<string[]>
> = {
  start: async (_args, _state, callbacks) => {
    await callbacks.startWebcam();
    return ["Webcam started", ""];
  },
  on: async (_args, _state, callbacks) => {
    await callbacks.startWebcam();
    return ["Webcam started", ""];
  },
  stop: (_args, _state, callbacks) => {
    callbacks.stopWebcam();
    return ["Webcam stopped", ""];
  },
  off: (_args, _state, callbacks) => {
    callbacks.stopWebcam();
    return ["Webcam stopped", ""];
  },
  resolution: (args, state, callbacks) => {
    if (args.length === 2) {
      const width = parseInt(args[0]);
      const height = parseInt(args[1]);
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        if (width > MAX_RESOLUTION.width || height > MAX_RESOLUTION.height) {
          return [
            `Error: Resolution too high. Maximum: ${MAX_RESOLUTION.width}x${MAX_RESOLUTION.height}`,
            "High resolution may cause performance issues.",
            "",
          ];
        }
        callbacks.setResolution({ width, height });
        return [`Resolution set to ${width}x${height}`, ""];
      }
    }
    if (args.length === 1 && args[0] === "auto") {
      const optimal = calculateOptimalResolution(state.size.width);
      callbacks.setResolution(optimal);
      return [
        `Auto resolution set to ${optimal.width}x${optimal.height}`,
        `Based on window size: ${state.size.width}x${state.size.height}`,
        "",
      ];
    }
    return [
      `Current resolution: ${state.resolution.width}x${state.resolution.height}`,
      "",
      "Usage: resolution <width> <height>",
      "       resolution auto - Auto-detect optimal resolution",
      "",
      "Example: resolution 120 60",
      "         resolution auto",
      "",
      `Note: Maximum recommended: ${MAX_RESOLUTION.width}x${MAX_RESOLUTION.height}`,
      "",
    ];
  },
  res: (args, state, callbacks) => {
    return webcamCommands.resolution(args, state, callbacks);
  },
  style: (args, state, callbacks) => {
    if (args.length === 1 && ASCII_STYLES.includes(args[0] as ASCIIStyle)) {
      callbacks.setStyle(args[0] as ASCIIStyle);
      return [`Style set to ${args[0]}`, ""];
    }
    return [
      `Current style: ${state.style}`,
      "",
      `Available styles: ${ASCII_STYLES.join(", ")}`,
      "Usage: style <name>",
      "",
    ];
  },
  invert: (_args, state, callbacks) => {
    callbacks.setInvert(!state.invert);
    return [`Invert ${!state.invert ? "enabled" : "disabled"}`, ""];
  },
  stats: (_args, state, _callbacks) => {
    return [
      "ASCII Webcam Statistics:",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `  Status:        ${state.isStreaming ? "● Streaming" : "○ Stopped"}`,
      `  FPS:           ${state.fps}`,
      `  Resolution:    ${state.resolution.width}x${state.resolution.height}`,
      `  Style:         ${state.style}`,
      `  Invert:        ${state.invert ? "Yes" : "No"}`,
      `  Window Size:   ${state.size.width}x${state.size.height}`,
      "",
    ];
  },
  status: (args, state, callbacks) => {
    return webcamCommands.stats(args, state, callbacks);
  },
  help: (_args, _state, _callbacks) => {
    return [
      "ASCII Webcam Commands:",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "  start / on          - Start webcam",
      "  stop / off          - Stop webcam",
      "  resolution <w> <h>  - Set ASCII resolution",
      "  resolution auto    - Auto-detect optimal resolution",
      "  style <name>        - Change ASCII style",
      "  invert              - Toggle invert colors",
      "  stats / status      - Show statistics",
      "  theme <name>        - Change theme",
      "  size <w> <h>        - Resize window",
      "  close / exit        - Close application",
      "",
      "Examples:",
      "  start",
      "  resolution auto",
      "  resolution 100 50",
      "  style dense",
      "  invert",
      "  stats",
      "",
    ];
  },
};

export const handleWebcamCommand = async (
  command: string,
  args: string[],
  context: CommandContext,
  state: WebcamState,
  callbacks: WebcamCallbacks
): Promise<CommandResult> => {
  const lowerCommand = command.toLowerCase();

  if (webcamCommands[lowerCommand]) {
    const result = webcamCommands[lowerCommand](args, state, callbacks);
    const output = result instanceof Promise ? await result : result;
    return { output };
  }

  const getHandler = getFilteredCommandHandler(ALLOWED_WEBCAM_COMMANDS);
  const handler = getHandler(lowerCommand);

  if (handler) {
    return await handler(args, context);
  }

  return {
    output: [`Command not found: ${command}`, 'Type "help" for available commands', ""],
    isError: true,
  };
};
