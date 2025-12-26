import { getCurrentDirContents, getFileSystem } from "@entities/file/model";
import {
  parseCommandArgs,
  hasOption,
  getFirstPositionalArg,
  getOptionValue,
} from "@shared/lib/commandArgs";
import { validateFileReadable } from "@shared/lib/fileValidator";

import type { CommandFunction, FileSystemNode } from "../../../types";

export const fileOperationsCommands: Record<string, CommandFunction> = {
  cat: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: cat <filename> [options]",
        "",
        "Options:",
        "  -n, --number    Number all output lines",
        "  -h, --help      Show this help",
        "",
      ];
    }

    const { options } = parseCommandArgs(args);
    const showHelp = hasOption(options, "h", "help");
    if (showHelp) {
      return [
        "Usage: cat <filename> [options]",
        "",
        "Options:",
        "  -n, --number    Number all output lines",
        "  -h, --help      Show this help",
        "",
      ];
    }

    const numberLines = hasOption(options, "n", "number");
    const fileName = getFirstPositionalArg(args);

    if (!fileName) {
      return ["Usage: cat <filename> [options]", ""];
    }

    if (fileName === "/dev/null" || fileName === "dev/null") {
      return ["", "Nothing to see here.", "", "The void consumes all input.", ""];
    }

    const result = validateFileReadable(fileName);
    if (result.error) {
      return [result.error, ""];
    }

    const file = result.file!;
    if (!file.content) {
      return [""];
    }

    const lines = file.content.split("\n");
    if (numberLines) {
      return lines
        .map((line, index) => `${(index + 1).toString().padStart(4)}  ${line}`)
        .concat([""]);
    }
    return lines.concat([""]);
  },

  head: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: head <filename> [options]",
        "",
        "Options:",
        "  -n <num>    Show first N lines (default: 10)",
        "",
        "Example: head readme.txt -n 5",
        "",
      ];
    }
    const fileName = getFirstPositionalArg(args);
    if (!fileName) {
      return ["Usage: head <filename> [options]", ""];
    }

    const nValue = getOptionValue(args, "n");
    const numLines = nValue ? parseInt(nValue) : 10;

    const result = validateFileReadable(fileName);
    if (result.error) {
      return [result.error, ""];
    }

    const file = result.file!;
    const lines = file.content!.split("\n");
    return [`==> ${fileName} <==`, "", ...lines.slice(0, numLines), ""];
  },

  tail: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: tail <filename> [options]",
        "",
        "Options:",
        "  -n <num>    Show last N lines (default: 10)",
        "",
        "Example: tail log.dat -n 20",
        "",
      ];
    }
    const fileName = getFirstPositionalArg(args);
    if (!fileName) {
      return ["Usage: tail <filename> [options]", ""];
    }

    const nValue = getOptionValue(args, "n");
    const numLines = nValue ? parseInt(nValue) : 10;

    const result = validateFileReadable(fileName);
    if (result.error) {
      return [result.error, ""];
    }

    const file = result.file!;
    const lines = file.content!.split("\n");
    return [`==> ${fileName} <==`, "", ...lines.slice(-numLines), ""];
  },

  grep: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: grep <pattern> [file]",
        "Search for pattern in files",
        "",
        "Example: grep hello readme.txt",
        "         grep system (searches all files in current dir)",
        "",
      ];
    }
    const pattern = args[0].toLowerCase();
    const fileName = args[1];
    const dir = getCurrentDirContents();
    const results: string[] = [];

    if (fileName) {
      // Поиск в конкретном файле
      const result = validateFileReadable(fileName);
      if (result.error) {
        return [result.error, ""];
      }
      const file = result.file!;
      const lines = file.content!.split("\n");
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(pattern)) {
          results.push(`${fileName}:${index + 1}:${line}`);
        }
      });
    } else {
      // Поиск во всех файлах
      if (!dir || !dir.contents) {
        return ["No files to search", ""];
      }
      Object.keys(dir.contents).forEach(name => {
        const item = dir.contents![name];
        if (item.type === "file" && item.content) {
          const lines = item.content.split("\n");
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(pattern)) {
              results.push(`${name}:${index + 1}:${line}`);
            }
          });
        }
      });
    }

    if (results.length === 0) {
      return [`No matches found for: ${pattern}`, ""];
    }

    return [`Found ${results.length} match(es):`, "", ...results, ""];
  },

  find: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: find <name>",
        "Search for files and directories by name",
        "",
        "Example: find readme",
        "",
      ];
    }
    const searchTerm = args[0].toLowerCase();
    const fileSystem = getFileSystem();
    const results: string[] = [];

    const searchRecursive = (path: string, node: FileSystemNode) => {
      if (node.type === "dir" && node.contents) {
        const contents = node.contents;
        Object.keys(contents).forEach(name => {
          const fullPath = path === "/" ? `/${name}` : `${path}/${name}`;
          if (name.toLowerCase().includes(searchTerm)) {
            results.push(fullPath);
          }
          if (contents[name].type === "dir") {
            searchRecursive(fullPath, contents[name]);
          }
        });
      }
    };

    Object.keys(fileSystem).forEach(path => {
      const node = fileSystem[path];
      const name = path.split("/").pop() || "";
      if (name.toLowerCase().includes(searchTerm)) {
        results.push(path);
      }
      if (node.type === "dir") {
        searchRecursive(path, node);
      }
    });

    if (results.length === 0) {
      return [`No files or directories found matching: ${searchTerm}`, ""];
    }

    return [`Found ${results.length} result(s):`, "", ...results.map(path => `  ${path}`), ""];
  },

  wc: args => {
    if (!args || args.length === 0) {
      return [
        "Usage: wc <filename>",
        "Count lines, words, and characters in a file",
        "",
        "Example: wc readme.txt",
        "",
      ];
    }
    const fileName = args[0];
    const result = validateFileReadable(fileName);
    if (result.error) {
      return [result.error, ""];
    }

    const file = result.file!;
    const content = file.content!;
    const lines = content.split("\n");
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const characters = content.length;
    const bytes = new Blob([content]).size;

    return [
      `  ${lines.length.toString().padStart(6)} ${words.length
        .toString()
        .padStart(6)} ${characters.toString().padStart(6)} ${bytes
        .toString()
        .padStart(6)} ${fileName}`,
      "",
      `Lines: ${lines.length}`,
      `Words: ${words.length}`,
      `Characters: ${characters}`,
      `Bytes: ${bytes}`,
      "",
    ];
  },
};
