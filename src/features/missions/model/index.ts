import { getFileSystem, saveFileSystem } from "@entities/file/model";

import type { Mission } from "../../../types";

const STORAGE_KEY = "cyberpunk_missions";

interface MissionProgress {
  completed: string[];
  progress: Record<string, Record<string, number>>; // missionId -> requirementId -> count
}

const loadProgress = (): MissionProgress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
      };
    }
  } catch (e) {
    console.warn("Failed to load mission progress", e);
  }
  return { completed: [], progress: {} };
};

const saveProgress = (progress: MissionProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn("Failed to save mission progress", e);
  }
};

export const getMissions = (): Mission[] => {
  return [
    {
      id: "first_steps",
      title: "First Steps",
      description: "Learn basic terminal commands",
      hint: "Try commands like 'help', 'ls', 'pwd', and 'whoami'",
      requirements: [
        { type: "command", target: "help" },
        { type: "command", target: "ls" },
        { type: "command", target: "pwd" },
        { type: "command", target: "whoami" },
      ],
      reward: {
        unlockFile: "/home/user/documents/tutorial.txt",
      },
      nextMission: "network_scan",
    },
    {
      id: "network_scan",
      title: "Network Scan",
      description: "Scan the network and perform your first hack",
      hint: "Use 'scan' to find targets, then 'hack' to breach them",
      requirements: [
        { type: "scan", target: "scan", count: 3 },
        { type: "hack", target: "hack", count: 1 },
      ],
      reward: {
        unlockFile: "/home/user/secrets/network_map.txt",
      },
      nextMission: "server_breach",
    },
    {
      id: "server_breach",
      title: "Server Breach",
      description: "Hack and connect to a server",
      hint: "Hack a server, then use 'connect' to establish a connection",
      requirements: [
        { type: "hack", target: "hack" },
        { type: "connect", target: "connect" },
      ],
      reward: {
        unlockFile: "/home/user/logs/hack_attempts.log",
      },
      nextMission: "file_explorer",
    },
    {
      id: "file_explorer",
      title: "File Explorer",
      description: "Read important files to uncover secrets",
      hint: "Use 'cat' to read files. Try reading files in documents and secrets directories",
      requirements: [
        { type: "file_read", target: "/home/user/documents/notes.txt" },
        { type: "file_read", target: "/home/user/secrets/network_map.txt" },
      ],
      reward: {
        unlockFile: "/home/user/documents/contacts.txt",
      },
      nextMission: "secret_hunter",
    },
    {
      id: "secret_hunter",
      title: "Secret Hunter",
      description: "Discover your first secret command",
      hint: "Try typing 'konami' or explore secret commands",
      requirements: [{ type: "command", target: "konami" }],
      reward: {
        unlockSecret: "first_secret",
      },
    },
  ];
};

export const getCompletedMissions = (): string[] => {
  const progress = loadProgress();
  return Array.isArray(progress.completed) ? progress.completed : [];
};

export const isMissionCompleted = (missionId: string): boolean => {
  return getCompletedMissions().includes(missionId);
};

export const getActiveMissions = (): Mission[] => {
  const completed = getCompletedMissions();
  const allMissions = getMissions();

  if (!Array.isArray(completed)) {
    return allMissions.length > 0 ? [allMissions[0]] : [];
  }

  return allMissions.filter(mission => {
    if (completed.includes(mission.id)) {
      return false;
    }
    const missionIndex = allMissions.findIndex(m => m.id === mission.id);
    if (missionIndex === 0) {
      return true;
    }
    if (missionIndex === -1) {
      return false;
    }
    const prevMission = allMissions[missionIndex - 1];
    if (!prevMission) {
      return false;
    }
    return completed.includes(prevMission.id);
  });
};

export const getMissionProgress = (missionId: string): Record<string, number> => {
  const progress = loadProgress();
  return progress.progress[missionId] || {};
};

export const checkMissionRequirements = (
  missionId: string,
  actionType: string,
  actionTarget: string
): boolean => {
  const mission = getMissions().find(m => m.id === missionId);
  if (!mission || isMissionCompleted(missionId)) {
    return false;
  }

  const progress = loadProgress();
  if (!progress.progress[missionId]) {
    progress.progress[missionId] = {};
  }

  let requirementUpdated = false;

  for (const req of mission.requirements) {
    const reqId = `${req.type}_${req.target}`;
    const currentCount = progress.progress[missionId][reqId] || 0;
    const requiredCount = req.count || 1;

    if (req.type === actionType && req.target === actionTarget) {
      if (currentCount < requiredCount) {
        progress.progress[missionId][reqId] = currentCount + 1;
        requirementUpdated = true;
      }
    }
  }

  if (requirementUpdated) {
    saveProgress(progress);
  }

  let allMet = true;
  for (const req of mission.requirements) {
    const reqId = `${req.type}_${req.target}`;
    const currentCount = progress.progress[missionId][reqId] || 0;
    const requiredCount = req.count || 1;
    if (currentCount < requiredCount) {
      allMet = false;
      break;
    }
  }

  return allMet;
};

export const completeMission = (missionId: string): boolean => {
  if (isMissionCompleted(missionId)) {
    return false;
  }

  const mission = getMissions().find(m => m.id === missionId);
  if (!mission) {
    return false;
  }

  const progress = loadProgress();
  progress.completed.push(missionId);
  saveProgress(progress);

  if (mission.reward.unlockFile) {
    unlockFile(mission.reward.unlockFile);
  }

  const completedCount = progress.completed.length;
  if (completedCount >= 3) {
    import("@features/email/lib")
      .then(module => {
        module.triggerResistanceRecruit();
      })
      .catch(error => {
        console.warn("Failed to trigger email:", error);
      });
  }

  return true;
};

export const unlockCompletedMissionFiles = (): void => {
  const completed = getCompletedMissions();
  const allMissions = getMissions();

  for (const missionId of completed) {
    const mission = allMissions.find(m => m.id === missionId);
    if (mission && mission.reward.unlockFile) {
      unlockFile(mission.reward.unlockFile);
    }
  }
};

export const unlockFile = (filePath: string): void => {
  const fs = getFileSystem();
  const parts = filePath.split("/").filter(p => p);
  const fileName = parts.pop()!;
  const dirPath = "/" + parts.join("/");

  if (!fs[dirPath] || !fs[dirPath].contents) {
    return;
  }

  if (fs[filePath]) {
    return;
  }

  const content = getDefaultFileContent(filePath);
  if (content) {
    fs[dirPath].contents![fileName] = {
      type: "file",
      content,
    };
    fs[filePath] = {
      type: "file",
      content,
    };
    saveFileSystem(fs);
  }
};

const getDefaultFileContent = (filePath: string): string => {
  const contentMap: Record<string, string> = {
    "/home/user/documents/tutorial.txt": `TERMINAL TUTORIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to the cyberpunk terminal!

BASIC COMMANDS:
  help    - Show available commands
  ls      - List directory contents
  cd      - Change directory
  pwd     - Print working directory
  cat     - Display file contents

NETWORK COMMANDS:
  scan    - Scan network for targets
  hack    - Hack into a system
  connect - Connect to a target

Keep exploring to discover more secrets!`,

    "/home/user/secrets/network_map.txt": `NETWORK TOPOLOGY MAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROUTER: 192.168.1.1
  Status: PROTECTED (Firewall Level 5)
  Access: DENIED

WORKSTATION: 192.168.1.42
  Status: VULNERABLE (Old OS, no updates)
  Access: PASSWORD REQUIRED
  Exploit: Buffer Overflow (CVE-2077-1337)
  Password Hint: Check system_access.log for admin pattern

SERVER: 192.168.1.100
  Status: ENCRYPTED (NeoCorp Internal)
  Access: PASSWORD REQUIRED
  Note: Contains Project Alpha data
  Password Hint: Company name + CORP + founding year (all caps, no spaces)

DATABASE: 10.0.0.5
  Status: UNKNOWN
  Access: UNKNOWN`,

    "/home/user/logs/hack_attempts.log": `HACK ATTEMPT LOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-15 14:23] Attempt #001
Target: 192.168.1.42
Status: SUCCESS
Method: Buffer Overflow
Data Extracted: 2.3 MB

[2077-03-16 09:45] Attempt #002
Target: 192.168.1.100
Status: FAILED
Reason: Firewall detected intrusion

[2077-03-17 22:10] Attempt #003
Target: 192.168.1.100
Status: SUCCESS
Method: SQL Injection
Data Extracted: 15.7 MB`,

    "/home/user/documents/contacts.txt": `HACKER CONTACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAIN
  Handle: @lain_iwakura
  Status: Connected to Wired
  Specialty: Reality manipulation
  Last seen: Present everywhere, Present nowhere
  Note: "Present day, present time. HAHAHAHA."
  WARNING: Do not attempt to understand. Present it.

V
  Handle: @v_nomad
  Status: Active
  Specialty: Netrunning & Solo operations
  Last seen: 2077-12-10
  Location: Night City
  Note: Former streetkid, now legend. Has engram of Johnny Silverhand.

JOHNNY
  Handle: @silverhand_2077
  Status: ENGRAM (Active in V's head)
  Specialty: Rockerboy, revolutionary
  Last seen: 2023 (original), 2077 (as engram)
  Note: "Wake the fuck up, samurai. We have a city to burn."
  WARNING: Unstable engram, may cause personality conflicts

JUDY
  Handle: @judy_alvarez
  Status: Active
  Specialty: Braindance editing, netrunning
  Last seen: 2077-12-15
  Location: Night City (Pacifica)
  Note: Best BD editor in NC. Trustworthy, but watch for Mox connections.

KILLY
  Handle: @killy_seeker
  Status: Wandering
  Specialty: Gravitational Beam Emitter, survival
  Last seen: Unknown (time dilation active)
  Location: The City (possibly Earth, possibly future)
  Note: Searching for Net Terminal Genes. Has been traveling for 3000+ years.
  WARNING: Do not interfere with mission. Extremely dangerous.

CIBO
  Handle: @cibo_researcher
  Status: UNKNOWN (last seen with Killy)
  Specialty: Genetic research, Net Terminal access
  Last seen: Unknown
  Location: The City, deep levels
  Note: Former Safeguard scientist. May have Net Terminal Genes.
  WARNING: Status uncertain after last contact with Safeguard`,

    "/home/user/secrets/server_42_access.log": `SERVER ACCESS LOG - 192.168.1.42
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-18 12:30] Access granted via password crack
[2077-03-18 12:31] Files extracted:
  - admin_notes.txt
  - system_config.ini
  - user_database.csv

[2077-03-18 12:32] Found reference to Project Alpha
  Location: /mnt/neocorp/projects/alpha/
  Requires: Vault access (192.168.1.100)

[2077-03-18 12:35] Session terminated`,

    "/home/user/secrets/vault_blueprint.txt": `NEO CORP VAULT BLUEPRINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server: 192.168.1.100
Security Level: MAXIMUM
Access Method: Password + Biometric

VAULT CONTENTS:
  - Project Alpha source code
  - Employee database (encrypted)
  - Financial records
  - Research data

WARNING: Unauthorized access detected will trigger
         automatic system lockdown.

[2077-03-18 13:00] Access granted via password crack
[2077-03-18 13:01] Extracting critical data...
[2077-03-18 13:05] Data extraction complete`,

    "/home/user/secrets/research_data.txt": `RESEARCH LAB DATA - 10.0.0.50
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-19 10:00] Access granted

RESEARCH PROJECTS:
  - Neural Interface Development
  - AI Consciousness Research
  - Memory Implantation Technology

KEY FINDINGS:
  NeoCorp is developing technology to control
  human consciousness through neural interfaces.

  Project Alpha is the main initiative.

  Morpheus mentioned: "Follow the white rabbit"
  Password pattern: MATRIX + year

[2077-03-19 10:15] Data backed up to secure location`,
  };

  return contentMap[filePath] || "";
};
