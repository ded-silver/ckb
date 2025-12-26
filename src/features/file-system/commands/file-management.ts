import { createDirectory, deleteNode, createFile } from "@entities/file/model";

import type { CommandFunction } from "../../../types";

export const fileManagementCommands: Record<string, CommandFunction> = {
  touch: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: touch <filename>",
        "Create an empty file or update its timestamp",
        "",
        "Example: touch newfile.txt",
        "",
      ];
    }
    const fileName = args[0];
    if (createFile(fileName, "")) {
      return [`File created: ${fileName}`, ""];
    }
    return [`File already exists: ${fileName}`, ""];
  },

  mkdir: args => {
    if (!args || args.length === 0) {
      return ["Usage: mkdir <directory_name>", ""];
    }
    const dirName = args[0];
    if (createDirectory(dirName)) {
      return [`Directory created: ${dirName}`, ""];
    }
    return [`Directory already exists: ${dirName}`, ""];
  },

  rm: args => {
    if (!args || args.length === 0) {
      return ["Usage: rm <file_or_directory>", "Warning: This will permanently delete!", ""];
    }
    const name = args[0];
    if (deleteNode(name)) {
      return [`Deleted: ${name}`, ""];
    }
    return [`File or directory not found: ${name}`, ""];
  },
};
