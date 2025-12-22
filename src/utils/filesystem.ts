import { FileSystemNode } from "../types";

let currentDirectory = "/home/user";

const defaultFileSystem: Record<string, FileSystemNode> = {
  "/home/user": {
    type: "dir",
    contents: {
      documents: {
        type: "dir",
        contents: {
          "notes.txt": {
            type: "file",
            content:
              "[2077-03-15 14:23] First Entry\nStarted investigating NeoCorp activities.\nSomething's wrong with their new 'Alpha' project.\n\n[2077-03-16 09:45] Anomaly Detected\nNetwork scan showed strange activity\non server 192.168.1.100. Need to investigate.\n\n[2077-03-17 22:10] Breakthrough!\nHacked into NeoCorp server. Found encrypted files.\nNeed to find a way to decrypt them.\n\n[2077-03-18 11:30] Password Discovery\nFound admin credentials for 192.168.1.42:\nAdmin always uses simple passwords: ADMIN + numbers\nPattern: ADMIN123 (8 chars, uppercase + digits)",
          },
        },
      },
      projects: {
        type: "dir",
        contents: {
          "virus_prototype.asm": {
            type: "file",
            content:
              "; VIRUS PROTOTYPE - DO NOT EXECUTE\n; Author: Unknown\n; Date: 2077-03-10\n\nsection .text\n    global _start\n\n_start:\n    ; Self-replication code\n    ; WARNING: This is experimental\n    ; Use at your own risk\n\n    mov eax, 1\n    int 0x80",
          },
          "exploit_framework.c": {
            type: "file",
            content:
              '/* EXPLOIT FRAMEWORK v2.0 */\n/* Framework for testing vulnerabilities */\n\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Buffer overflow test\n    char buffer[64];\n    printf("Testing buffer overflow...\\n");\n    \n    // SQL injection test\n    printf("Testing SQL injection...\\n");\n    \n    return 0;\n}',
          },
        },
      },
      secrets: {
        type: "dir",
        contents: {},
      },
      logs: {
        type: "dir",
        contents: {
          "system_access.log": {
            type: "file",
            content:
              "SYSTEM ACCESS LOG\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-15 14:20] Login: user@cyberpunk\n[2077-03-15 14:21] Command: help\n[2077-03-15 14:22] Command: ls\n[2077-03-15 14:23] File accessed: notes.txt\n[2077-03-16 09:40] Command: scan\n[2077-03-16 09:45] Command: hack 192.168.1.42\n[2077-03-17 22:10] Command: hack 192.168.1.100\n[2077-03-17 22:11] File accessed: network_map.txt\n\n[2077-03-18 12:00] Password Hint Found\nServer 192.168.1.42 uses default admin password\nFormat: ADMIN + 3 digits\n\n[2077-03-18 12:15] NeoCorp Vault Info\nServer 192.168.1.100 password pattern:\nCompany name (NEO) + CORP + year (2077)\nAll uppercase, no spaces",
          },
        },
      },
      "readme.txt": {
        type: "file",
        content:
          "WELCOME TO CYBERPUNK TERMINAL\n\nThis is a retro cyberpunk terminal interface\ninspired by 80s-90s computing aesthetics.\n\nEnjoy the nostalgia!",
      },
      "config.ini": {
        type: "file",
        content:
          "[SYSTEM]\nOS=CyberOS v2.0.2077\nKernel=4.20.69-cyber\nStatus=OPERATIONAL",
      },
      "log.dat": {
        type: "file",
        content:
          "2024-01-01 00:00:00 - System initialized\n2024-01-01 00:01:00 - Matrix mode enabled\n2024-01-01 00:02:00 - Terminal ready",
      },
    },
  },
  "/home/user/documents": {
    type: "dir",
    contents: {
      "notes.txt": {
        type: "file",
        content:
          "[2077-03-15 14:23] First Entry\nStarted investigating NeoCorp activities.\nSomething's wrong with their new 'Alpha' project.\n\n[2077-03-16 09:45] Anomaly Detected\nNetwork scan showed strange activity\non server 192.168.1.100. Need to investigate.\n\n[2077-03-17 22:10] Breakthrough!\nHacked into NeoCorp server. Found encrypted files.\nNeed to find a way to decrypt them.",
      },
    },
  },
  "/home/user/documents/notes.txt": {
    type: "file",
    content:
      "[2077-03-15 14:23] First Entry\nStarted investigating NeoCorp activities.\nSomething's wrong with their new 'Alpha' project.\n\n[2077-03-16 09:45] Anomaly Detected\nNetwork scan showed strange activity\non server 192.168.1.100. Need to investigate.\n\n[2077-03-17 22:10] Breakthrough!\nHacked into NeoCorp server. Found encrypted files.\nNeed to find a way to decrypt them.",
  },
  "/home/user/projects": {
    type: "dir",
    contents: {
      "virus_prototype.asm": {
        type: "file",
        content:
          "; VIRUS PROTOTYPE - DO NOT EXECUTE\n; Author: Unknown\n; Date: 2077-03-10\n\nsection .text\n    global _start\n\n_start:\n    ; Self-replication code\n    ; WARNING: This is experimental\n    ; Use at your own risk\n\n    mov eax, 1\n    int 0x80",
      },
      "exploit_framework.c": {
        type: "file",
        content:
          '/* EXPLOIT FRAMEWORK v2.0 */\n/* Framework for testing vulnerabilities */\n\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Buffer overflow test\n    char buffer[64];\n    printf("Testing buffer overflow...\\n");\n    \n    // SQL injection test\n    printf("Testing SQL injection...\\n");\n    \n    return 0;\n}',
      },
    },
  },
  "/home/user/projects/virus_prototype.asm": {
    type: "file",
    content:
      "; VIRUS PROTOTYPE - DO NOT EXECUTE\n; Author: Unknown\n; Date: 2077-03-10\n\nsection .text\n    global _start\n\n_start:\n    ; Self-replication code\n    ; WARNING: This is experimental\n    ; Use at your own risk\n\n    mov eax, 1\n    int 0x80",
  },
  "/home/user/projects/exploit_framework.c": {
    type: "file",
    content:
      '/* EXPLOIT FRAMEWORK v2.0 */\n/* Framework for testing vulnerabilities */\n\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Buffer overflow test\n    char buffer[64];\n    printf("Testing buffer overflow...\\n");\n    \n    // SQL injection test\n    printf("Testing SQL injection...\\n");\n    \n    return 0;\n}',
  },
  "/home/user/secrets": {
    type: "dir",
    contents: {},
  },
  "/home/user/logs": {
    type: "dir",
    contents: {
      "system_access.log": {
        type: "file",
        content:
          "SYSTEM ACCESS LOG\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-15 14:20] Login: user@cyberpunk\n[2077-03-15 14:21] Command: help\n[2077-03-15 14:22] Command: ls\n[2077-03-15 14:23] File accessed: notes.txt\n[2077-03-16 09:40] Command: scan\n[2077-03-16 09:45] Command: hack 192.168.1.42\n[2077-03-17 22:10] Command: hack 192.168.1.100\n[2077-03-17 22:11] File accessed: network_map.txt",
      },
    },
  },
  "/home/user/logs/system_access.log": {
    type: "file",
    content:
      "SYSTEM ACCESS LOG\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n[2077-03-15 14:20] Login: user@cyberpunk\n[2077-03-15 14:21] Command: help\n[2077-03-15 14:22] Command: ls\n[2077-03-15 14:23] File accessed: notes.txt\n[2077-03-16 09:40] Command: scan\n[2077-03-16 09:45] Command: hack 192.168.1.42\n[2077-03-17 22:10] Command: hack 192.168.1.100\n[2077-03-17 22:11] File accessed: network_map.txt",
  },
  "/home/user/readme.txt": {
    type: "file",
    content:
      "WELCOME TO CYBERPUNK TERMINAL\n\nThis is a retro cyberpunk terminal interface\ninspired by 80s-90s computing aesthetics.\n\nEnjoy the nostalgia!",
  },
  "/home/user/config.ini": {
    type: "file",
    content:
      "[SYSTEM]\nOS=CyberOS v2.0.2077\nKernel=4.20.69-cyber\nStatus=OPERATIONAL",
  },
  "/home/user/log.dat": {
    type: "file",
    content:
      "2024-01-01 00:00:00 - System initialized\n2024-01-01 00:01:00 - Matrix mode enabled\n2024-01-01 00:02:00 - Terminal ready",
  },
};

const migrateFileSystem = (
  fs: Record<string, FileSystemNode>
): Record<string, FileSystemNode> => {
  const migrated = { ...fs };

  for (const [path, node] of Object.entries(defaultFileSystem)) {
    if (!migrated[path]) {
      migrated[path] = JSON.parse(JSON.stringify(node));
    } else if (node.type === "dir" && migrated[path].type === "dir") {
      if (!migrated[path].contents) {
        migrated[path].contents = {};
      }
      if (node.contents) {
        for (const [name, child] of Object.entries(node.contents)) {
          if (!migrated[path].contents![name]) {
            migrated[path].contents![name] = JSON.parse(JSON.stringify(child));
          }
        }
      }
    }
  }

  return migrated;
};

const loadFileSystem = (): Record<string, FileSystemNode> => {
  try {
    const saved = localStorage.getItem("cyberpunk_filesystem");
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated = migrateFileSystem(parsed);
      try {
        localStorage.setItem("cyberpunk_filesystem", JSON.stringify(migrated));
      } catch (e) {
        console.warn("Failed to save migrated filesystem", e);
      }
      return migrated;
    }
  } catch (e) {
    console.warn("Failed to load filesystem from localStorage", e);
  }
  return JSON.parse(JSON.stringify(defaultFileSystem));
};

export const saveFileSystem = (fs: Record<string, FileSystemNode>): void => {
  try {
    localStorage.setItem("cyberpunk_filesystem", JSON.stringify(fs));
    fileSystem = fs;
  } catch (e) {
    console.warn("Failed to save filesystem to localStorage", e);
  }
};

let fileSystem = loadFileSystem();

try {
  const savedDir = localStorage.getItem("cyberpunk_current_dir");
  if (savedDir && fileSystem[savedDir]) {
    currentDirectory = savedDir;
  }
} catch (e) {}

export const getCurrentDirectory = (): string => currentDirectory;

export const setCurrentDirectory = (path: string): void => {
  currentDirectory = path;
};

export const getFileSystem = (): Record<string, FileSystemNode> => {
  return loadFileSystem();
};

export const getCurrentDirContents = (): FileSystemNode | undefined => {
  const fs = getFileSystem();
  return fs[currentDirectory];
};

export const createDirectory = (name: string): boolean => {
  fileSystem = getFileSystem();
  const newPath = currentDirectory + "/" + name;
  if (fileSystem[newPath]) {
    return false;
  }
  const parent = fileSystem[currentDirectory];
  if (parent && parent.contents) {
    parent.contents[name] = { type: "dir", contents: {} };
    fileSystem[newPath] = { type: "dir", contents: {} };
    saveFileSystem(fileSystem);
    return true;
  }
  return false;
};

export const createFile = (name: string, content: string = ""): boolean => {
  fileSystem = getFileSystem();
  const parent = fileSystem[currentDirectory];
  if (parent && parent.contents) {
    if (parent.contents[name]) {
      return false; // Файл уже существует
    }
    parent.contents[name] = { type: "file", content };
    const filePath = currentDirectory + "/" + name;
    fileSystem[filePath] = { type: "file", content };
    saveFileSystem(fileSystem);
    return true;
  }
  return false;
};

export const writeFile = (name: string, content: string): boolean => {
  fileSystem = getFileSystem();
  const parent = fileSystem[currentDirectory];
  if (parent && parent.contents && parent.contents[name]) {
    const file = parent.contents[name];
    if (file.type === "file") {
      file.content = content;
      const filePath = currentDirectory + "/" + name;
      if (fileSystem[filePath]) {
        fileSystem[filePath].content = content;
      }
      saveFileSystem(fileSystem);
      return true;
    }
  }
  return false;
};

export const deleteNode = (name: string): boolean => {
  fileSystem = getFileSystem();
  const targetPath = currentDirectory + "/" + name;
  const parent = fileSystem[currentDirectory];
  if (parent && parent.contents && parent.contents[name]) {
    const node = parent.contents[name];
    if (node.type === "dir" && node.contents) {
      const deleteRecursive = (path: string) => {
        const node = fileSystem[path];
        if (node && node.type === "dir" && node.contents) {
          Object.keys(node.contents).forEach((childName) => {
            deleteRecursive(path + "/" + childName);
          });
        }
        delete fileSystem[path];
      };
      deleteRecursive(targetPath);
    }
    delete parent.contents[name];
    delete fileSystem[targetPath];
    saveFileSystem(fileSystem);
    return true;
  }
  return false;
};

export const changeDirectory = (
  target: string
): { success: boolean; path: string } => {
  fileSystem = getFileSystem();

  if (target.includes("/") && !target.startsWith("/")) {
    const parts = target.split("/");
    let resolvedPath = currentDirectory;
    for (const part of parts) {
      if (part === "..") {
        const pathParts = resolvedPath.split("/").filter((p) => p);
        if (pathParts.length > 1) {
          pathParts.pop();
          resolvedPath = "/" + pathParts.join("/");
        } else {
          resolvedPath = "/";
        }
      } else if (part === ".") {
        continue;
      } else if (part !== "") {
        resolvedPath =
          resolvedPath === "/" ? `/${part}` : `${resolvedPath}/${part}`;
      }
    }
    if (fileSystem[resolvedPath] && fileSystem[resolvedPath].type === "dir") {
      currentDirectory = resolvedPath;
      try {
        localStorage.setItem("cyberpunk_current_dir", currentDirectory);
      } catch (e) {}
      return { success: true, path: currentDirectory };
    }
    return { success: false, path: currentDirectory };
  }

  if (target === ".." || target === "../") {
    const parts = currentDirectory.split("/").filter((p) => p);
    if (parts.length > 1) {
      parts.pop();
      currentDirectory = "/" + parts.join("/");
    } else {
      currentDirectory = "/";
    }
    try {
      localStorage.setItem("cyberpunk_current_dir", currentDirectory);
    } catch (e) {}
    return { success: true, path: currentDirectory };
  }

  if (target === "." || target === "./") {
    return { success: true, path: currentDirectory };
  }

  if (target.startsWith("/")) {
    if (fileSystem[target] && fileSystem[target].type === "dir") {
      currentDirectory = target;
      try {
        localStorage.setItem("cyberpunk_current_dir", currentDirectory);
      } catch (e) {}
      return { success: true, path: currentDirectory };
    }
    return { success: false, path: currentDirectory };
  }

  const newPath = currentDirectory + "/" + target;
  if (fileSystem[newPath] && fileSystem[newPath].type === "dir") {
    currentDirectory = newPath;
    try {
      localStorage.setItem("cyberpunk_current_dir", currentDirectory);
    } catch (e) {}
    return { success: true, path: currentDirectory };
  }
  return { success: false, path: currentDirectory };
};
