import { getCurrentDirContents, changeDirectory, getCurrentDirectory } from "@entities/file/model";
import { parseCommandArgs, hasOption } from "@shared/lib/commandArgs";

import type { CommandFunction } from "../../../types";

export const navigationCommands: Record<string, CommandFunction> = {
  pwd: () => {
    return [getCurrentDirectory(), ""];
  },

  cd: args => {
    if (!args || args.length === 0) {
      return ["Usage: cd <directory>", "Example: cd documents", ""];
    }
    const result = changeDirectory(args[0]);
    if (result.success) {
      return [`Changed to: ${result.path}`, ""];
    }
    return [`Directory not found: ${args[0]}`, ""];
  },

  ls: args => {
    const dir = getCurrentDirContents();
    if (!dir || !dir.contents) {
      return ["Directory is empty", ""];
    }

    const { options } = parseCommandArgs(args);
    const showAll = hasOption(options, "a", "all");
    const longFormat = hasOption(options, "l", "long");
    const showHelp = hasOption(options, "h", "help");

    if (showHelp) {
      return [
        "Usage: ls [options]",
        "",
        "Options:",
        "  -a, --all     Show all files (including hidden)",
        "  -l, --long    Use long format",
        "  -h, --help    Show this help",
        "",
      ];
    }

    const listing: string[] = [];

    if (longFormat) {
      listing.push("Directory listing (long format):", "");
      listing.push("TYPE  NAME                    SIZE");
      listing.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } else {
      listing.push("Directory listing:", "");
    }

    const items = Object.keys(dir.contents)
      .filter(name => showAll || !name.startsWith("."))
      .sort();

    items.forEach(name => {
      const item = dir.contents![name];
      if (longFormat) {
        const type = item.type === "dir" ? "DIR " : "FILE";
        const size =
          item.type === "file" && item.content
            ? `${item.content.length} B`
            : item.type === "dir"
              ? "-"
              : "0 B";
        listing.push(`${type}  ${name.padEnd(22)} ${size}`);
      } else {
        if (item.type === "dir") {
          listing.push(`  [DIR]  ${name}`);
        } else {
          listing.push(`  [FILE] ${name}`);
        }
      }
    });

    listing.push("");
    if (longFormat) {
      listing.push(`Total: ${items.length} items`);
      listing.push("");
    }
    return listing;
  },
};
