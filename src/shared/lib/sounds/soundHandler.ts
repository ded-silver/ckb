import { SUCCESS_COMMANDS, HACK_COMMANDS, SCAN_COMMANDS } from "@shared/config/commands";

import { soundGenerator } from "./index";

export const playCommandSound = (command: string, isError: boolean) => {
  const trimmedCmd = command.trim().toLowerCase();
  const commandName = trimmedCmd.split(" ")[0];

  if (isError) {
    soundGenerator.playError();
    return;
  }

  if (SUCCESS_COMMANDS.some(cmd => cmd === commandName)) {
    soundGenerator.playSuccess();
  }

  if (HACK_COMMANDS.some(cmd => trimmedCmd === cmd || trimmedCmd.startsWith(`${cmd} `))) {
    soundGenerator.playHack();
  }

  if (SCAN_COMMANDS.some(cmd => trimmedCmd === cmd)) {
    soundGenerator.playScan();
  }
};
