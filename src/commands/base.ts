import {
  getCurrentDirContents,
  changeDirectory,
  createDirectory,
  deleteNode,
  getCurrentDirectory,
  createFile,
  writeFile,
  getFileSystem,
} from "../utils/filesystem";
import {
  getBrowserInfo,
  formatUserInfo,
  formatSystemInfo,
} from "../utils/browser";

export const baseCommands: Record<string, (args?: string[]) => string[]> = {
  help: (args) => {
    if (args && (args.includes("--secret") || args.includes("--hidden"))) {
      return [
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "SECRET COMMANDS",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "You found the secret help menu!",
        "",
        "Try these hidden commands:",
        "  konami          - Classic cheat code (Konami Code)",
        "  matrix          - Wake up, Neo... (The Matrix)",
        "  sudo            - Access denied joke",
        "  hacktheworld    - Global hack sequence",
        "  easteregg       - You found one!",
        "  ghost           - Ghost in the Shell reference",
        "  blade           - Blade Runner (Tears in rain)",
        "  tron            - Greetings, Program! (Tron)",
        "  deus            - Deus Ex reference",
        "  wake            - Wake up, samurai (Cyberpunk 2077)",
        "  rosebud         - The Sims cheat code",
        "  idkfa           - Doom cheat code",
        "  thereisnospoon  - The Matrix (Bend the spoon)",
        "",
        "Also try:",
        "  echo 'hello world'  - Classic programming",
        "  echo '42'           - The Answer",
        "  cat /dev/null       - Nothing to see",
        "",
        "Keep exploring! There's more to discover.",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
      ];
    }

    return [
      "",
      "AVAILABLE COMMANDS:",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "BASIC:",
      "  help, clear, whoami, date, system",
      "",
      "FILESYSTEM:",
      "  ls [options]      - List directory (-a: all, -l: long)",
      "  cd <dir>          - Change directory",
      "  pwd               - Print working directory",
      "  mkdir <name>      - Create directory",
      "  rm <name>         - Remove file/directory",
      "  touch <file>      - Create empty file",
      "",
      "FILE OPERATIONS:",
      "  cat <file>        - Display file contents",
      "  head <file> [-n]  - Show first N lines",
      "  tail <file> [-n]  - Show last N lines",
      "  grep <pattern>    - Search text in files",
      "  find <name>       - Search files/directories",
      "  wc <file>         - Count lines, words, chars",
      "",
      "TEXT PROCESSING:",
      "  echo <text>       - Echo text",
      "  echo <text> > file - Write to file",
      "  sort <file>       - Sort lines",
      "  diff <file1> <file2> - Compare files",
      "",
      "NETWORK:",
      "  ping <host>       - Ping host",
      "  hack [target]     - Simulate hacking",
      "  scan              - Scan network",
      "  connect <target>  - Connect to target",
      "  disconnect [target] - Close active session",
      "  sessions          - Show active hack sessions",
      "",
      "GAMES:",
      "  crack <target> <password> - Crack server password",
      "  crack status [target]     - Show crack status",
      "",
      "GAMIFICATION:",
      "  missions [id]     - Show missions/quests",
      "  quest [id]        - Alias for missions",
      "  status            - Show progress statistics",
      "",
      "SYSTEM:",
      "  ps                - List processes",
      "  uptime            - Show uptime",
      "  free              - Memory usage",
      "  df                - Disk usage",
      "  stats [reset]    - Command statistics",
      "  history [search]  - Command history",
      "",
      "UTILITIES:",
      "  crypto <text>     - Encrypt text",
      "  weather [loc]     - Show weather",
      "  quote             - Random quote",
      "  neofetch          - System info (ASCII)",
      "  cowsay <text>     - Make cow say text",
      "  figlet <text>     - ASCII art text",
      "  dice [sides]      - Roll dice",
      "  joke              - Random joke",
      "  notify <msg>      - Show notification",
      "",
      "APPLICATIONS:",
      "  open <app>        - Open application (e.g., open player.exe)",
      "  music <command>   - Music player commands",
      "",
      "TERMINAL:",
      "  theme <name>      - Change theme",
      "  size <w> <h>      - Change size",
      "  su <user> [host]  - Switch user",
      "  config            - Show configuration",
      "  about             - About terminal",
      "  exit              - Exit terminal",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ];
  },

  clear: () => [],

  whoami: () => {
    const browserInfo = getBrowserInfo();
    return formatUserInfo(browserInfo);
  },

  date: () => {
    const now = new Date();
    const browserInfo = getBrowserInfo();

    const localDate = now.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const localTime = now.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const utcTime = now.toUTCString();

    const pageLoadTime = performance.timing
      ? Math.floor(
          (Date.now() - performance.timing.navigationStart) / 1000 / 60
        )
      : null;

    const result = [
      `Current Date: ${localDate}`,
      `Current Time: ${localTime}`,
      `UTC Time: ${utcTime}`,
      `Timezone: ${browserInfo.timezone}`,
    ];

    if (pageLoadTime !== null) {
      result.push(`Page Uptime: ${pageLoadTime} minutes`);
    }

    result.push("");
    return result;
  },

  system: () => {
    const browserInfo = getBrowserInfo();
    return formatSystemInfo(browserInfo);
  },

  matrix: () => [
    "Matrix mode already active.",
    "Background process running...",
    "Status: ENABLED",
    "",
  ],

  about: () => [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "CYBERPUNK TERMINAL v2.0.2077",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "A retro cyberpunk terminal interface",
    "Built with React + TypeScript",
    "",
    "Features:",
    "  - Matrix Rain background effect",
    "  - ASCII art logo",
    "  - Command system",
    "  - CRT monitor effects",
    "  - Retro 4:3 aspect ratio",
    "",
    "Welcome to the future of the past!",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ],

  pwd: () => {
    return [getCurrentDirectory(), ""];
  },

  cd: (args) => {
    if (!args || args.length === 0) {
      return ["Usage: cd <directory>", "Example: cd documents", ""];
    }
    const result = changeDirectory(args[0]);
    if (result.success) {
      return [`Changed to: ${result.path}`, ""];
    }
    return [`Directory not found: ${args[0]}`, ""];
  },

  ls: (args) => {
    const dir = getCurrentDirContents();
    if (!dir || !dir.contents) {
      return ["Directory is empty", ""];
    }

    const showAll = args?.includes("-a") || args?.includes("--all");
    const longFormat = args?.includes("-l") || args?.includes("--long");
    const showHelp = args?.includes("-h") || args?.includes("--help");

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
      .filter((name) => showAll || !name.startsWith("."))
      .sort();

    items.forEach((name) => {
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

  cat: (args) => {
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

    const showHelp = args.includes("-h") || args.includes("--help");
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

    const numberLines = args.includes("-n") || args.includes("--number");
    const fileName = args.find((arg) => !arg.startsWith("-"));

    if (!fileName) {
      return ["Usage: cat <filename> [options]", ""];
    }

    if (fileName === "/dev/null" || fileName === "dev/null") {
      return [
        "",
        "Nothing to see here.",
        "",
        "The void consumes all input.",
        "",
      ];
    }

    let filePath: string;
    if (fileName.startsWith("/")) {
      filePath = fileName;
    } else {
      const currentDir = getCurrentDirectory();
      const parts = fileName.split("/");
      let resolvedPath = currentDir;
      for (const part of parts) {
        if (part === "..") {
          const pathParts = resolvedPath.split("/").filter((p) => p);
          if (pathParts.length > 1) {
            pathParts.pop();
            resolvedPath = "/" + pathParts.join("/");
          } else {
            resolvedPath = "/";
          }
        } else if (part !== "." && part !== "") {
          resolvedPath =
            resolvedPath === "/" ? `/${part}` : `${resolvedPath}/${part}`;
        }
      }
      filePath = resolvedPath;
    }

    const fileSystem = getFileSystem();
    if (!fileSystem[filePath]) {
      return [`File not found: ${fileName}`, ""];
    }

    const file = fileSystem[filePath];
    if (file.type !== "file") {
      return [`${fileName} is not a file`, ""];
    }

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

  echo: (args) => {
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

    const showHelp = args.includes("-h") || args.includes("--help");
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

    const noNewline = args.includes("-n");
    const enableEscape = args.includes("-e");
    const redirectIndex = args.indexOf(">");

    if (redirectIndex !== -1 && redirectIndex < args.length - 1) {
      const textArgs = args
        .slice(0, redirectIndex)
        .filter((arg) => !arg.startsWith("-"));
      const fileName = args[redirectIndex + 1];

      let text = textArgs.join(" ");
      if (enableEscape) {
        text = text
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(/\\\\/g, "\\");
      }

      if (createFile(fileName, text) || writeFile(fileName, text)) {
        return [`Text written to: ${fileName}`, ""];
      }
      return [`Error: Could not write to ${fileName}`, ""];
    }

    const textArgs = args.filter((arg) => !arg.startsWith("-"));
    let text = textArgs.join(" ");

    // Easter egg: "hello world" variations
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

    // Easter egg: "42" reference
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
      text = text
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\");
    }

    return noNewline ? [text] : [text, ""];
  },

  touch: (args) => {
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

  find: (args) => {
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

    const searchRecursive = (path: string, node: any) => {
      if (node.type === "dir" && node.contents) {
        Object.keys(node.contents).forEach((name) => {
          const fullPath = path === "/" ? `/${name}` : `${path}/${name}`;
          if (name.toLowerCase().includes(searchTerm)) {
            results.push(fullPath);
          }
          if (node.contents[name].type === "dir") {
            searchRecursive(fullPath, node.contents[name]);
          }
        });
      }
    };

    Object.keys(fileSystem).forEach((path) => {
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

    return [
      `Found ${results.length} result(s):`,
      "",
      ...results.map((path) => `  ${path}`),
      "",
    ];
  },

  grep: (args) => {
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
      if (!dir || !dir.contents || !dir.contents[fileName]) {
        return [`File not found: ${fileName}`, ""];
      }
      const file = dir.contents[fileName];
      if (file.type !== "file" || !file.content) {
        return [`${fileName} is not a readable file`, ""];
      }
      const lines = file.content.split("\n");
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
      Object.keys(dir.contents).forEach((name) => {
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

  head: (args) => {
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
    const fileName = args.find((arg) => !arg.startsWith("-"));
    if (!fileName) {
      return ["Usage: head <filename> [options]", ""];
    }

    const nIndex = args.indexOf("-n");
    const numLines =
      nIndex !== -1 && args[nIndex + 1] ? parseInt(args[nIndex + 1]) : 10;

    const dir = getCurrentDirContents();
    if (!dir || !dir.contents || !dir.contents[fileName]) {
      return [`File not found: ${fileName}`, ""];
    }
    const file = dir.contents[fileName];
    if (file.type !== "file" || !file.content) {
      return [`${fileName} is not a readable file`, ""];
    }

    const lines = file.content.split("\n");
    return [`==> ${fileName} <==`, "", ...lines.slice(0, numLines), ""];
  },

  tail: (args) => {
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
    const fileName = args.find((arg) => !arg.startsWith("-"));
    if (!fileName) {
      return ["Usage: tail <filename> [options]", ""];
    }

    const nIndex = args.indexOf("-n");
    const numLines =
      nIndex !== -1 && args[nIndex + 1] ? parseInt(args[nIndex + 1]) : 10;

    const dir = getCurrentDirContents();
    if (!dir || !dir.contents || !dir.contents[fileName]) {
      return [`File not found: ${fileName}`, ""];
    }
    const file = dir.contents[fileName];
    if (file.type !== "file" || !file.content) {
      return [`${fileName} is not a readable file`, ""];
    }

    const lines = file.content.split("\n");
    return [`==> ${fileName} <==`, "", ...lines.slice(-numLines), ""];
  },

  wc: (args) => {
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
    const dir = getCurrentDirContents();
    if (!dir || !dir.contents || !dir.contents[fileName]) {
      return [`File not found: ${fileName}`, ""];
    }
    const file = dir.contents[fileName];
    if (file.type !== "file" || !file.content) {
      return [`${fileName} is not a readable file`, ""];
    }

    const content = file.content;
    const lines = content.split("\n");
    const words = content.split(/\s+/).filter((w) => w.length > 0);
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

  stats: (args) => {
    try {
      const statsData = localStorage.getItem("cyberpunk_command_stats");
      const stats = statsData ? JSON.parse(statsData) : {};

      if (args && args.length > 0 && args[0] === "reset") {
        localStorage.removeItem("cyberpunk_command_stats");
        return ["Command statistics reset", ""];
      }

      if (Object.keys(stats).length === 0) {
        return [
          "No command statistics available yet.",
          "Statistics are tracked automatically.",
          "",
          "Usage: stats reset - Clear statistics",
          "",
        ];
      }

      const sorted = Object.entries(stats)
        .map(([cmd, count]) => ({ cmd, count: count as number }))
        .sort((a, b) => b.count - a.count);

      const total = sorted.reduce((sum, item) => sum + item.count, 0);

      return [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "COMMAND USAGE STATISTICS",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        `Total commands executed: ${total}`,
        `Unique commands: ${sorted.length}`,
        "",
        "Top commands:",
        ...sorted
          .slice(0, 10)
          .map(
            (item, idx) =>
              `  ${(idx + 1).toString().padStart(2)}. ${item.cmd.padEnd(20)} ${
                item.count
              } times`
          ),
        "",
        "Usage: stats reset - Clear statistics",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
      ];
    } catch (e) {
      return ["Error loading statistics", ""];
    }
  },

  mkdir: (args) => {
    if (!args || args.length === 0) {
      return ["Usage: mkdir <directory_name>", ""];
    }
    const dirName = args[0];
    if (createDirectory(dirName)) {
      return [`Directory created: ${dirName}`, ""];
    }
    return [`Directory already exists: ${dirName}`, ""];
  },

  rm: (args) => {
    if (!args || args.length === 0) {
      return [
        "Usage: rm <file_or_directory>",
        "Warning: This will permanently delete!",
        "",
      ];
    }
    const name = args[0];
    if (deleteNode(name)) {
      return [`Deleted: ${name}`, ""];
    }
    return [`File or directory not found: ${name}`, ""];
  },

  exit: () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return ["Exiting terminal...", "Goodbye!", ""];
  },

  sort: (args) => {
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

    const fileName = args.find((arg) => !arg.startsWith("-"));
    if (!fileName) {
      return ["Usage: sort <filename> [options]", ""];
    }

    const reverse = args.includes("-r") || args.includes("--reverse");
    const numeric = args.includes("-n") || args.includes("--numeric");
    const unique = args.includes("-u") || args.includes("--unique");

    const dir = getCurrentDirContents();
    if (!dir || !dir.contents || !dir.contents[fileName]) {
      return [`File not found: ${fileName}`, ""];
    }
    const file = dir.contents[fileName];
    if (file.type !== "file" || !file.content) {
      return [`${fileName} is not a readable file`, ""];
    }

    let lines = file.content.split("\n");

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
      lines = lines.filter((line) => {
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

  uniq: (args) => {
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

    const fileName = args.find((arg) => !arg.startsWith("-"));
    if (!fileName) {
      return ["Usage: uniq <filename> [options]", ""];
    }

    const showCount = args.includes("-c") || args.includes("--count");
    const repeated = args.includes("-d") || args.includes("--repeated");
    const unique = args.includes("-u") || args.includes("--unique");

    const dir = getCurrentDirContents();
    if (!dir || !dir.contents || !dir.contents[fileName]) {
      return [`File not found: ${fileName}`, ""];
    }
    const file = dir.contents[fileName];
    if (file.type !== "file" || !file.content) {
      return [`${fileName} is not a readable file`, ""];
    }

    const lines = file.content.split("\n");
    const result: string[] = [];
    const lineCounts = new Map<string, number>();
    const seen = new Set<string>();

    lines.forEach((line) => {
      if (line.trim() === "") return;
      lineCounts.set(line, (lineCounts.get(line) || 0) + 1);
    });

    lines.forEach((line) => {
      const count = lineCounts.get(line) || 0;

      if (repeated && count < 2) return;
      if (unique && count > 1) return;
      if (seen.has(line)) return;

      seen.add(line);

      if (showCount) {
        result.push(`${count.toString().padStart(7)} ${line}`);
      } else {
        result.push(line);
      }
    });

    return [...result, ""];
  },

  diff: (args) => {
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
    const dir = getCurrentDirContents();

    if (!dir || !dir.contents || !dir.contents[file1Name]) {
      return [`File not found: ${file1Name}`, ""];
    }
    if (!dir.contents[file2Name]) {
      return [`File not found: ${file2Name}`, ""];
    }

    const file1 = dir.contents[file1Name];
    const file2 = dir.contents[file2Name];

    if (file1.type !== "file" || file2.type !== "file") {
      return ["Both arguments must be files", ""];
    }

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

  ps: () => {
    const processes = [
      {
        pid: 1,
        name: "init",
        cpu: "0.0%",
        mem: "1.2%",
        status: "S",
        time: "00:00:01",
      },
      {
        pid: 42,
        name: "terminal",
        cpu: "2.3%",
        mem: "4.5%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 133,
        name: "matrix-rain",
        cpu: "1.1%",
        mem: "2.1%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 256,
        name: "browser-engine",
        cpu: "5.2%",
        mem: "8.3%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 512,
        name: "network-daemon",
        cpu: "0.5%",
        mem: "1.8%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 789,
        name: "file-system",
        cpu: "0.3%",
        mem: "1.5%",
        status: "S",
        time: "00:05:23",
      },
      {
        pid: 1024,
        name: "crypto-service",
        cpu: "0.2%",
        mem: "0.9%",
        status: "S",
        time: "00:05:23",
      },
    ];

    const result = [
      "   PID  NAME                CPU    MEM    STATUS    TIME",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      ...processes.map(
        (p) =>
          `${p.pid.toString().padStart(5)}  ${p.name.padEnd(
            18
          )} ${p.cpu.padStart(6)} ${p.mem.padStart(6)} ${p.status.padStart(
            6
          )}    ${p.time}`
      ),
      "",
      `Total processes: ${processes.length}`,
      "",
    ];

    return result;
  },

  uptime: () => {
    const nav = performance.navigation as any;
    const timing = performance.timing;

    let uptimeSeconds = 0;
    if (timing && timing.navigationStart) {
      uptimeSeconds = Math.floor((Date.now() - timing.navigationStart) / 1000);
    } else if (nav && nav.startTime) {
      uptimeSeconds = Math.floor((Date.now() - nav.startTime) / 1000);
    }

    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    const uptimeStr =
      days > 0
        ? `${days} day${days > 1 ? "s" : ""}, ${hours}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        : `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;

    const loadAvg = (Math.random() * 0.5 + 0.3).toFixed(2);

    return [
      ` ${uptimeStr} up`,
      ` load average: ${loadAvg}, ${(parseFloat(loadAvg) + 0.1).toFixed(2)}, ${(
        parseFloat(loadAvg) + 0.2
      ).toFixed(2)}`,
      "",
    ];
  },

  free: () => {
    const nav = navigator as any;
    const perf = performance as any;

    let totalMem = 0;
    let usedMem = 0;
    let freeMem = 0;

    if (perf.memory) {
      // Chrome/Edge
      const memInfo = perf.memory;
      totalMem = Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024);
      usedMem = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);
      freeMem = totalMem - usedMem;
    } else if (nav.deviceMemory) {
      // Если доступна информация об устройстве
      totalMem = nav.deviceMemory * 1024; // GB to MB
      usedMem = Math.round(totalMem * 0.3);
      freeMem = totalMem - usedMem;
    } else {
      // Симуляция
      totalMem = 8192; // 8 GB
      usedMem = Math.round(totalMem * 0.35);
      freeMem = totalMem - usedMem;
    }

    const shared = Math.round(totalMem * 0.05);
    const buffCache = Math.round(totalMem * 0.1);
    const available = freeMem + buffCache;

    const result = [
      "              total        used        free      shared  buff/cache   available",
      "Mem:",
      `        ${totalMem.toString().padStart(10)} ${usedMem
        .toString()
        .padStart(10)} ${freeMem.toString().padStart(10)} ${shared
        .toString()
        .padStart(10)} ${buffCache.toString().padStart(10)} ${available
        .toString()
        .padStart(10)}`,
      "",
    ];

    // Swap (симуляция)
    const swapTotal = 2048;
    const swapUsed = Math.round(swapTotal * 0.1);
    const swapFree = swapTotal - swapUsed;

    result.push("Swap:");
    result.push(
      `        ${swapTotal.toString().padStart(10)} ${swapUsed
        .toString()
        .padStart(10)} ${swapFree.toString().padStart(10)}`
    );
    result.push("");

    return result;
  },

  df: () => {
    let used = 0;
    let total = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || "";
          used += key.length + value.length;
        }
      }
      total = 5 * 1024 * 1024; // 5 MB
    } catch (e) {
      total = 5 * 1024 * 1024;
    }

    const usedMB = (used / 1024 / 1024).toFixed(2);
    const totalMB = (total / 1024 / 1024).toFixed(2);
    const availableMB = ((total - used) / 1024 / 1024).toFixed(2);
    const usePercent = ((used / total) * 100).toFixed(1);

    const result = [
      "Filesystem      Size  Used Avail Use% Mounted on",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `localStorage    ${totalMB}M  ${usedMB}M  ${availableMB}M  ${usePercent}% /`,
      "",
    ];

    const filesystems = [
      {
        name: "tmpfs",
        size: "512M",
        used: "12M",
        avail: "500M",
        use: "3%",
        mount: "/tmp",
      },
      {
        name: "devtmpfs",
        size: "256M",
        used: "0",
        avail: "256M",
        use: "0%",
        mount: "/dev",
      },
      {
        name: "proc",
        size: "0",
        used: "0",
        avail: "0",
        use: "-",
        mount: "/proc",
      },
    ];

    filesystems.forEach((fs) => {
      result.push(
        `${fs.name.padEnd(14)} ${fs.size.padStart(6)} ${fs.used.padStart(
          6
        )} ${fs.avail.padStart(6)} ${fs.use.padStart(4)} ${fs.mount}`
      );
    });

    result.push("");
    return result;
  },

  open: (args) => {
    if (!args || args.length === 0) {
      return [
        "Usage: open <application>",
        "",
        "Available applications:",
        "  player.exe    - Open music player",
        "",
        "Example: open player.exe",
        "",
      ];
    }

    const app = args[0];
    if (app === "player.exe" || app === "./player.exe") {
      // Импортируем динамически, чтобы избежать циклических зависимостей
      import("../utils/musicPlayerManager").then((module) => {
        module.openMusicPlayer();
      });
      return ["Opening music player...", ""];
    }

    return [
      `Unknown application: ${app}`,
      'Type "open" for available applications',
      "",
    ];
  },
};
