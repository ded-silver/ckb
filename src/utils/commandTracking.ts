import {
  checkMissionRequirements,
  completeMission,
  getActiveMissions,
  getMissions,
} from "./missions";
import { trackFileRead, trackHack } from "./progress";
import { markNeoCorpHacked, isNeoCorpHacked } from "./virus";
import { getFileSystem, saveFileSystem } from "./filesystem";

export const trackCommandForMissions = (command: string): string | null => {
  const activeMissions = getActiveMissions();
  if (!Array.isArray(activeMissions)) return null;

  for (const mission of activeMissions) {
    if (mission && mission.id) {
      if (checkMissionRequirements(mission.id, "command", command)) {
        if (completeMission(mission.id)) {
          return mission.id;
        }
      }
    }
  }
  return null;
};

export const trackHackCommand = (args: string[] = []): string | null => {
  const target = args && args[0] ? args[0] : undefined;
  trackHack(target);

  // NeoCorp Vault - создаем countermeasure файл
  if (target === "192.168.1.100" && !isNeoCorpHacked()) {
    markNeoCorpHacked();
    createNeoCorpCountermeasureFile();
  }

  if (target === "192.168.1.42" || target === "192.168.1.100") {
    createHackedServerFiles(target);
  }

  const activeMissions = getActiveMissions();
  if (!Array.isArray(activeMissions)) return null;

  for (const mission of activeMissions) {
    if (mission && mission.id) {
      if (checkMissionRequirements(mission.id, "hack", "hack")) {
        if (completeMission(mission.id)) {
          return mission.id;
        }
      }
    }
  }
  return null;
};

// Создать папку с выкачанными файлами после взлома сервера
const createHackedServerFiles = (serverIP: string): void => {
  try {
    const fs = getFileSystem();
    const homeDir = "/home/user";

    if (!fs[homeDir]) {
      return;
    }

    const extractedDir = `${homeDir}/extracted`;
    const serverDirName = serverIP.replace(/\./g, "_");
    const serverDir = `${extractedDir}/${serverDirName}`;

    if (fs[serverDir]) {
      return;
    }

    if (!fs[extractedDir]) {
      fs[extractedDir] = { type: "dir", contents: {} };
      if (fs[homeDir].type === "dir" && fs[homeDir].contents) {
        fs[homeDir].contents["extracted"] = { type: "dir", contents: {} };
      }
    }

    if (!fs[extractedDir].contents) {
      fs[extractedDir].contents = {};
    }

    if (!fs[serverDir]) {
      fs[serverDir] = { type: "dir", contents: {} };
      if (fs[extractedDir].contents) {
        fs[extractedDir].contents[serverDirName] = {
          type: "dir",
          contents: {},
        };
      }
    }

    if (!fs[serverDir].contents) {
      fs[serverDir].contents = {};
    }

    const files: Record<string, string> = {};

    if (serverIP === "192.168.1.42") {
      files["server_logs.txt"] = `SERVER LOGS - ${serverIP}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 08:15] System boot
[2077-03-20 08:16] User login: admin
[2077-03-20 09:30] Network connection established
[2077-03-20 10:45] File access: project_alpha_backup.zip
[2077-03-20 11:20] Warning: Unauthorized access attempt detected
[2077-03-20 12:00] System backup initiated
[2077-03-20 14:30] Connection to 192.168.1.100 established

Note: This server contains backup copies of Project Alpha data.
All files are encrypted with AES-256.`;

      files["user_credentials.txt"] = `USER CREDENTIALS - ${serverIP}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found cached credentials:
  Username: admin
  Password: ADMIN123
  Access Level: ROOT

Warning: These credentials are outdated.
Server was compromised on 2077-03-18.`;

      files["extracted_data.dat"] = `EXTRACTED DATA - PROJECT ALPHA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:32] Data extraction from ${serverIP}
[2077-03-20 14:32] Source: Backup server
[2077-03-20 14:32] File size: 2.4 MB

This file contains extracted Project Alpha research data.
NeoCorp uses honeypot technology - attractive files with
Project Alpha data are actually traps for hackers.

WARNING: This file contains a hidden trojan payload.
Reading this file will activate TROJAN.ALPHA.2077.

The server you hacked contained not only data, but also
a hidden trojan. NeoCorp uses honeypot technology:
attractive files with Project Alpha data are actually
traps for hackers.

To decrypt: cat this file (WARNING: Will activate virus!)
To stop virus: type 'antivirus' before system destruction

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE TYPE: Honeypot Payload
VIRUS: TROJAN.ALPHA.2077
STATUS: DORMANT (activates on read/execute)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      files["deactivation_code.txt"] = `HONEYPOT DECRYPTION KEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:32] Found in server backup files
[2077-03-20 14:32] Source: ${serverIP}
[2077-03-20 14:32] Classification: INTERNAL USE ONLY

This file contains the deactivation code for honeypot
trojans deployed by NeoCorp security systems.

If you have activated a honeypot virus, use this code
to deactivate it:

HONEYPOT-BREAK-42

Usage: antivirus HONEYPOT-BREAK-42

Note: This code only works for honeypot-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Honeypot
DECRYPTION CODE: HONEYPOT-BREAK-42
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    } else if (serverIP === "192.168.1.100") {
      files["project_alpha_notes.txt"] = `PROJECT ALPHA RESEARCH NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-15] Initial research phase
Neural interface development shows promising results.
Test subjects show 87% compatibility rate.

[2077-03-16] Breakthrough
Successfully implanted false memories in test subject #42.
Subject believes they are a different person.

[2077-03-17] Security concern
Research data is being accessed by unauthorized personnel.
Implementing counter-intrusion measures.

[2077-03-18] Project Alpha Defense
All research files now contain embedded security payloads.
Unauthorized access will trigger neural interface backdoor.`;

      files["employee_list.csv"] = `EMPLOYEE DATABASE - NEO CORP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name,Department,Access Level,Status
John Smith,Research,LEVEL_5,ACTIVE
Sarah Johnson,Security,LEVEL_7,ACTIVE
Mike Chen,IT,LEVEL_3,ACTIVE
Lisa Wang,Research,LEVEL_4,TERMINATED
David Brown,Security,LEVEL_6,ACTIVE

Note: This is a partial list. Full database is encrypted.`;

      files["extracted_data.dat"] = `EXTRACTED DATA - NEO CORP VAULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:35] Data extraction from ${serverIP}
[2077-03-20 14:35] Source: NeoCorp Vault
[2077-03-20 14:35] File size: 15.7 MB

This file contains critical Project Alpha data extracted
from the NeoCorp Vault. The vault contained not only
research data, but also a hidden trojan payload.

NeoCorp uses honeypot technology - attractive files with
Project Alpha data are actually traps for hackers.

WARNING: This file contains a hidden trojan payload.
Reading this file will activate TROJAN.ALPHA.2077.

The server you hacked contained not only data, but also
a hidden trojan. NeoCorp uses honeypot technology:
attractive files with Project Alpha data are actually
traps for hackers.

To decrypt: cat this file (WARNING: Will activate virus!)
To stop virus: type 'antivirus' before system destruction

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE TYPE: Honeypot Payload
VIRUS: TROJAN.ALPHA.2077
STATUS: DORMANT (activates on read/execute)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      files["deactivation_code.txt"] = `HONEYPOT DECRYPTION KEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:35] Found in NeoCorp Vault files
[2077-03-20 14:35] Source: ${serverIP}
[2077-03-20 14:35] Classification: INTERNAL USE ONLY

This file contains the deactivation code for honeypot
trojans deployed by NeoCorp security systems.

If you have activated a honeypot virus, use this code
to deactivate it:

HONEYPOT-BREAK-42

Usage: antivirus HONEYPOT-BREAK-42

Note: This code only works for honeypot-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Honeypot
DECRYPTION CODE: HONEYPOT-BREAK-42
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    for (const [fileName, content] of Object.entries(files)) {
      const filePath = `${serverDir}/${fileName}`;
      if (fs[serverDir].type === "dir" && fs[serverDir].contents) {
        fs[serverDir].contents[fileName] = { type: "file", content };
        fs[filePath] = { type: "file", content };
      }
    }

    saveFileSystem(fs);
  } catch (e) {
    console.warn("Failed to create hacked server files", e);
  }
};

export const ensureCorruptionDeactivationFile = (): void => {
  try {
    const fs = getFileSystem();
    const secretsDir = "/home/user/secrets";
    const deactivationCodePath = `${secretsDir}/unicode_fix_code.txt`;

    if (!fs[secretsDir] || fs[deactivationCodePath]) {
      return;
    }

    const deactivationCodeContent = `UNICODE FIX CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 15:00] Found in system encoding logs
[2077-03-20 15:00] Source: System encoding repair tool
[2077-03-20 15:00] Classification: INTERNAL USE ONLY

This file contains the fix code for corruption
viruses that corrupt Unicode text encoding.

If you have activated a corruption virus, use this code
to deactivate it and restore text encoding:

UNICODE-FIX-UTF8

Usage: antivirus UNICODE-FIX-UTF8

Note: This code only works for corruption-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Corruption
FIX CODE: UNICODE-FIX-UTF8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    if (fs[secretsDir].type === "dir" && fs[secretsDir].contents) {
      fs[secretsDir].contents["unicode_fix_code.txt"] = {
        type: "file",
        content: deactivationCodeContent,
      };
      fs[deactivationCodePath] = {
        type: "file",
        content: deactivationCodeContent,
      };
      saveFileSystem(fs);
    }
  } catch (e) {
    console.warn("Failed to ensure corruption deactivation file", e);
  }
};

const createCorruptionVirusFile = (): void => {
  try {
    const fs = getFileSystem();
    const secretsDir = "/home/user/secrets";

    if (!fs[secretsDir]) {
      return;
    }

    const filePath = `${secretsDir}/corrupted_unicode.dat`;
    const deactivationCodePath = `${secretsDir}/unicode_fix_code.txt`;

    if (fs[filePath] && !fs[deactivationCodePath]) {
      const deactivationCodeContent = `UNICODE FIX CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 15:00] Found in system encoding logs
[2077-03-20 15:00] Source: System encoding repair tool
[2077-03-20 15:00] Classification: INTERNAL USE ONLY

This file contains the fix code for corruption
viruses that corrupt Unicode text encoding.

If you have activated a corruption virus, use this code
to deactivate it and restore text encoding:

UNICODE-FIX-UTF8

Usage: antivirus UNICODE-FIX-UTF8

Note: This code only works for corruption-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Corruption
FIX CODE: UNICODE-FIX-UTF8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      if (fs[secretsDir].type === "dir" && fs[secretsDir].contents) {
        fs[secretsDir].contents["unicode_fix_code.txt"] = {
          type: "file",
          content: deactivationCodeContent,
        };
        fs[deactivationCodePath] = {
          type: "file",
          content: deactivationCodeContent,
        };
        saveFileSystem(fs);
      }
      return;
    }

    if (fs[filePath]) {
      return;
    }

    const fileContent = `CORRUPTED UNICODE FILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 15:00] File encoding corrupted
[2077-03-20 15:00] Source: Unknown
[2077-03-20 15:00] Encoding: UTF-8 (CORRUPTED)

WARNING: This file contains corrupted Unicode data.
Reading this file will trigger text corruption virus.

This file was found in a compromised server. It appears
to contain corrupted Unicode characters that will spread
through your system, replacing normal text with similar
but incorrect Unicode characters.

The corruption virus CORRUPTION.UNICODE.2077 is embedded
in this file. Reading or executing this file will activate
the virus, causing all text in your terminal to become
corrupted and unreadable.

To decrypt: cat this file (WARNING: Will activate virus!)
To stop virus: type 'antivirus <code>' before system destruction

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE TYPE: Corrupted Unicode Payload
VIRUS: CORRUPTION.UNICODE.2077
STATUS: DORMANT (activates on read/execute)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    if (fs[secretsDir].type === "dir" && fs[secretsDir].contents) {
      fs[secretsDir].contents["corrupted_unicode.dat"] = {
        type: "file",
        content: fileContent,
      };
      fs[filePath] = {
        type: "file",
        content: fileContent,
      };

      const deactivationCodePath = `${secretsDir}/unicode_fix_code.txt`;
      const deactivationCodeContent = `UNICODE FIX CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 15:00] Found in system encoding logs
[2077-03-20 15:00] Source: System encoding repair tool
[2077-03-20 15:00] Classification: INTERNAL USE ONLY

This file contains the fix code for corruption
viruses that corrupt Unicode text encoding.

If you have activated a corruption virus, use this code
to deactivate it and restore text encoding:

UNICODE-FIX-UTF8

Usage: antivirus UNICODE-FIX-UTF8

Note: This code only works for corruption-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Corruption
FIX CODE: UNICODE-FIX-UTF8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      fs[secretsDir].contents["unicode_fix_code.txt"] = {
        type: "file",
        content: deactivationCodeContent,
      };
      fs[deactivationCodePath] = {
        type: "file",
        content: deactivationCodeContent,
      };

      saveFileSystem(fs);
    }
  } catch (e) {
    console.warn("Failed to create corruption virus file", e);
  }
};

const createNeoCorpCountermeasureFile = (): void => {
  try {
    const fs = getFileSystem();
    const secretsDir = "/home/user/secrets";

    if (!fs[secretsDir]) {
      return;
    }

    const filePath = `${secretsDir}/neocorp_countermeasure.dat`;
    if (fs[filePath]) {
      return;
    }

    const fileContent = `NEO CORP SECURITY ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:32] Unauthorized access detected
[2077-03-20 14:32] Source: 192.168.1.100 (Vault breach)
[2077-03-20 14:32] Counter-intrusion protocol: ALPHA.DEFENSE.2077

WARNING: This file contains Project Alpha security data.
Accessing this file will trigger neural interface backdoor.

Project Alpha is not just research data.
It's a weapon. And you just activated it.

After successful NeoCorp Vault breach, the system
detected unauthorized access and activated
'Project Alpha Defense' protocol.

The trojan TROJAN.ALPHA.2077 is embedded in this file.
Reading or executing this file will activate the virus.

To decrypt: cat this file (WARNING: Will activate virus!)
To stop virus: type 'antivirus' before system destruction

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE TYPE: Counter-Intrusion Payload
VIRUS: TROJAN.ALPHA.2077
STATUS: DORMANT (activates on read/execute)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    if (fs[secretsDir].type === "dir" && fs[secretsDir].contents) {
      fs[secretsDir].contents["neocorp_countermeasure.dat"] = {
        type: "file",
        content: fileContent,
      };
      fs[filePath] = {
        type: "file",
        content: fileContent,
      };

      const deactivationCodePath = `${secretsDir}/security_protocols.txt`;
      const deactivationCodeContent = `NEO CORP SECURITY PROTOCOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:32] Security Protocol Documentation
[2077-03-20 14:32] Classification: CONFIDENTIAL

Project Alpha Defense Protocol - Deactivation Codes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In case of unauthorized activation of TROJAN.ALPHA.2077,
use the following deactivation code:

ALPHA-DEFENSE-2077

This code can be used with the antivirus command to
deactivate the counter-intrusion system.

Usage: antivirus ALPHA-DEFENSE-2077

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROTOCOL: ALPHA.DEFENSE.2077
STATUS: ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      fs[secretsDir].contents["security_protocols.txt"] = {
        type: "file",
        content: deactivationCodeContent,
      };
      fs[deactivationCodePath] = {
        type: "file",
        content: deactivationCodeContent,
      };

      saveFileSystem(fs);
    }
  } catch (e) {
    console.warn("Failed to create NeoCorp countermeasure file", e);
  }
};

export const trackScanCommand = (): string | null => {
  const activeMissions = getActiveMissions();
  if (!Array.isArray(activeMissions)) return null;

  for (const mission of activeMissions) {
    if (mission && mission.id) {
      if (checkMissionRequirements(mission.id, "scan", "scan")) {
        if (completeMission(mission.id)) {
          return mission.id;
        }
      }
    }
  }
  return null;
};

export const trackConnectCommand = (): string | null => {
  const activeMissions = getActiveMissions();
  if (!Array.isArray(activeMissions)) return null;

  for (const mission of activeMissions) {
    if (mission && mission.id) {
      if (checkMissionRequirements(mission.id, "connect", "connect")) {
        if (completeMission(mission.id)) {
          return mission.id;
        }
      }
    }
  }
  return null;
};

export const trackFileReadCommand = async (
  fileName: string,
  currentDir: string
): Promise<string | null> => {
  const { getFileSystem } = await import("./filesystem");
  const { markContactsRead } = await import("./contacts");

  let filePath: string;
  if (fileName.startsWith("/")) {
    filePath = fileName;
  } else {
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

  const fs = getFileSystem();
  if (fs[filePath] && fs[filePath].type === "file") {
    trackFileRead(filePath);

    if (
      filePath.includes("contacts.txt") ||
      filePath.endsWith("/contacts.txt")
    ) {
      markContactsRead();
    }

    if (
      (filePath.includes("system_access") || filePath.includes("log")) &&
      Math.random() < 0.3
    ) {
      createCorruptionVirusFile();
    }

    const activeMissions = getActiveMissions();
    if (Array.isArray(activeMissions)) {
      for (const mission of activeMissions) {
        if (mission && mission.id) {
          if (checkMissionRequirements(mission.id, "file_read", filePath)) {
            if (completeMission(mission.id)) {
              return mission.id;
            }
          }
        }
      }
    }
  }
  return null;
};

export const getMissionNotification = (
  missionId: string | null
): string | null => {
  if (!missionId) return null;
  const allMissions = getMissions();
  const mission = allMissions.find((m) => m.id === missionId);
  return mission ? `Mission completed: ${mission.title}!` : null;
};
