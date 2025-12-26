import { fileManagementCommands } from "./file-management";
import { fileOperationsCommands } from "./file-operations";
import { navigationCommands } from "./navigation";
import { textProcessingCommands } from "./text-processing";
import type { CommandFunction } from "../../../types";

export const fileSystemCommands: Record<string, CommandFunction> = {
  ...navigationCommands,
  ...fileOperationsCommands,
  ...fileManagementCommands,
  ...textProcessingCommands,
};
