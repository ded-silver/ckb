import { parseCommandArgs, hasOption } from "@shared/lib/commandArgs";
import { validateFileReadable } from "@shared/lib/fileValidator";

import type { CommandFunction } from "../../../types";

export const textProcessingCommands: Record<string, CommandFunction> = {
  uniq: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: uniq <filename> [options]",
        "",
        "Options:",
        "  -c, --count      Prefix lines by the number of occurrences",
        "  -d, --repeated   Only print duplicate lines",
        "  -u, --unique     Only print unique lines",
        "",
        "Example: uniq file.txt",
        "         uniq file.txt -c",
        "",
      ];
    }

    const { options } = parseCommandArgs(args);
    const fileName = args.find(arg => !arg.startsWith("-"));
    if (!fileName) {
      return ["Usage: uniq <filename> [options]", ""];
    }

    const showCount = hasOption(options, "c", "count");
    const repeated = hasOption(options, "d", "repeated");
    const unique = hasOption(options, "u", "unique");

    const result = validateFileReadable(fileName);
    if (result.error) {
      return [result.error, ""];
    }

    const file = result.file!;
    const lines = file.content!.split("\n");
    const output: string[] = [];
    const lineCounts = new Map<string, number>();
    const seen = new Set<string>();

    lines.forEach(line => {
      if (line.trim() === "") return;
      lineCounts.set(line, (lineCounts.get(line) || 0) + 1);
    });

    lines.forEach(line => {
      const count = lineCounts.get(line) || 0;

      if (repeated && count < 2) return;
      if (unique && count > 1) return;
      if (seen.has(line)) return;

      seen.add(line);

      if (showCount) {
        output.push(`${count.toString().padStart(7)} ${line}`);
      } else {
        output.push(line);
      }
    });

    return [...output, ""];
  },
};
