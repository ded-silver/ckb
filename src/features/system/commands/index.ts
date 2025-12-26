import { applicationsCommands } from "./applications";
import { basicCommands } from "./basic";
import { systemInfoCommands } from "./system-info";
import { textProcessingCommands } from "./text-processing";
import type { CommandFunction } from "../../../types";

export const baseCommands: Record<string, CommandFunction> = {
  ...basicCommands,
  ...systemInfoCommands,
  ...textProcessingCommands,
  ...applicationsCommands,
};
