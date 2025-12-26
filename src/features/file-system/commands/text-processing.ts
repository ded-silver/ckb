import { createFile, writeFile } from "@entities/file/model";
import { parseCommandArgs, hasOption, getFirstPositionalArg } from "@shared/lib/commandArgs";
import { validateFileReadable } from "@shared/lib/fileValidator";

import type { CommandFunction } from "../../../types";

export const textProcessingCommands: Record<string, CommandFunction> = {
  echo: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: echo [options] <text> [> filename]",
        "",
        "Options:",
        "  -n    Do not output trailing newline",
        "  -e    Enable interpretation of escape sequences",
        "  -h    Show this help",
        "",
        "Examples:",
        "  echo Hello World",
        "  echo 'Hello\\nWorld' -e",
        "  echo 'Hello' > file.txt",
        "",
      ];
    }

    const { options } = parseCommandArgs(args);
    const showHelp = hasOption(options, "h", "help");
    if (showHelp) {
      return [
        "Usage: echo [options] <text> [> filename]",
        "",
        "Options:",
        "  -n    Do not output trailing newline",
        "  -e    Enable interpretation of escape sequences",
        "  -h    Show this help",
        "",
        "Escape sequences (with -e):",
        "  \\n    New line",
        "  \\t    Tab",
        "  \\\\    Backslash",
        "",
        "File redirection:",
        "  echo 'text' > file.txt  - Write text to file",
        "",
      ];
    }

    const noNewline = hasOption(options, "n");
    const enableEscape = hasOption(options, "e");
    const redirectIndex = args.indexOf(">");

    if (redirectIndex !== -1 && redirectIndex < args.length - 1) {
      const textArgs = args.slice(0, redirectIndex).filter(arg => !arg.startsWith("-"));
      const fileName = args[redirectIndex + 1];

      let text = textArgs.join(" ");
      if (enableEscape) {
        text = text.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\");
      }

      if (createFile(fileName, text) || writeFile(fileName, text)) {
        return [`Text written to: ${fileName}`, ""];
      }
      return [`Error: Could not write to ${fileName}`, ""];
    }

    const textArgs = args.filter(arg => !arg.startsWith("-"));
    let text = textArgs.join(" ");

    const lowerText = text.toLowerCase();
    if (lowerText === "hello world" || lowerText === '"hello world"') {
      return [
        "Hello, World!",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "Classic programming tradition detected!",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "The first program many developers write.",
        "Welcome to the club!",
        "",
      ];
    }

    if (text === "42" || text === '"42"') {
      return [
        "42",
        "",
        "The Answer to the Ultimate Question of Life,",
        "the Universe, and Everything.",
        "",
        "But what is the question?",
        "",
      ];
    }

    if (enableEscape) {
      text = text.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\");
    }

    return noNewline ? [text] : [text, ""];
  },

  sort: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: sort <filename> [options]",
        "",
        "Options:",
        "  -r, --reverse    Reverse the result of comparisons",
        "  -n, --numeric    Compare according to string numerical value",
        "  -u, --unique     Output only the first of an equal run",
        "",
        "Example: sort file.txt",
        "         sort file.txt -r",
        "",
      ];
    }

    const { options } = parseCommandArgs(args);
    const fileName = getFirstPositionalArg(args || []);
    if (!fileName) {
      return ["Usage: sort <filename> [options]", ""];
    }

    const reverse = hasOption(options, "r", "reverse");
    const numeric = hasOption(options, "n", "numeric");
    const unique = hasOption(options, "u", "unique");

    const result = validateFileReadable(fileName);
    if (result.error) {
      return [result.error, ""];
    }

    const file = result.file!;
    let lines = file.content!.split("\n");

    while (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }

    // Сортировка
    if (numeric) {
      lines.sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
      });
    } else {
      lines.sort((a, b) => a.localeCompare(b));
    }

    // Удаление дубликатов
    if (unique) {
      const seen = new Set<string>();
      lines = lines.filter(line => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
    }

    // Реверс
    if (reverse) {
      lines.reverse();
    }

    return [...lines, ""];
  },

  diff: args => {
    if (!args || args.length < 2) {
      return [
        "Usage: diff <file1> <file2>",
        "Compare two files line by line",
        "",
        "Example: diff file1.txt file2.txt",
        "",
      ];
    }

    const [file1Name, file2Name] = args;

    const result1 = validateFileReadable(file1Name);
    if (result1.error) {
      return [result1.error, ""];
    }

    const result2 = validateFileReadable(file2Name);
    if (result2.error) {
      return [result2.error, ""];
    }

    const file1 = result1.file!;
    const file2 = result2.file!;

    const lines1 = (file1.content || "").split("\n");
    const lines2 = (file2.content || "").split("\n");

    const result: string[] = [];
    result.push(`--- ${file1Name}`);
    result.push(`+++ ${file2Name}`);
    result.push("");

    const maxLen = Math.max(lines1.length, lines2.length);
    let diffCount = 0;

    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined) {
        result.push(`+${i + 1}    +${line2}`);
        diffCount++;
      } else if (line2 === undefined) {
        result.push(`-${i + 1}    -${line1}`);
        diffCount++;
      } else if (line1 !== line2) {
        result.push(`${i + 1}c${i + 1}`);
        result.push(`< ${line1}`);
        result.push(`---`);
        result.push(`> ${line2}`);
        diffCount++;
      }
    }

    if (diffCount === 0) {
      result.push("Files are identical");
    } else {
      result.push(`Total differences: ${diffCount}`);
    }

    result.push("");
    return result;
  },
};
