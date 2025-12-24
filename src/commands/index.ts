import { networkCommands } from "./network";
import { utilityCommands } from "./utils";
import { secretCommands } from "./secrets";
import { missionsCommands } from "./missions";
import { statusCommand } from "./status";
import { crackCommand } from "./crack";
import { baseCommands } from "./base";
import { musicCommands } from "./music";

export const allCommands = {
  ...baseCommands,
  ...networkCommands,
  ...utilityCommands,
  ...musicCommands,
};

export {
  networkCommands,
  utilityCommands,
  secretCommands,
  missionsCommands,
  statusCommand,
  crackCommand,
  baseCommands,
  musicCommands,
};
