export interface ServerInfo {
  ip: string;
  name: string;
  password: string;
  difficulty: "easy" | "medium" | "hard";
  hintFiles: string[];
  unlockFiles: string[];
  description: string;
  requiresCrack: boolean;
}

export const SERVERS: ServerInfo[] = [
  {
    ip: "192.168.1.42",
    name: "weak-password",
    password: "ADMIN123",
    difficulty: "easy",
    hintFiles: [
      "/home/user/documents/notes.txt",
      "/home/user/logs/system_access.log",
    ],
    unlockFiles: ["/home/user/secrets/server_42_access.log"],
    description: "Old admin server with weak security",
    requiresCrack: true,
  },
  {
    ip: "192.168.1.100",
    name: "corp-vault",
    password: "N3OC0RP2077",
    difficulty: "medium",
    hintFiles: [
      "/home/user/documents/notes.txt",
      "/home/user/secrets/network_map.txt",
    ],
    unlockFiles: ["/home/user/secrets/vault_blueprint.txt"],
    description: "NeoCorp corporate vault server",
    requiresCrack: true,
  },
  {
    ip: "10.0.0.50",
    name: "research-lab",
    password: "MATRIX2024",
    difficulty: "hard",
    hintFiles: [
      "/home/user/documents/contacts.txt",
      "/home/user/logs/hack_attempts.log",
    ],
    unlockFiles: ["/home/user/secrets/research_data.txt"],
    description: "Research laboratory server",
    requiresCrack: true,
  },
];

export const getServerByIP = (ip: string): ServerInfo | undefined => {
  return SERVERS.find((s) => s.ip === ip);
};

export const getServersRequiringCrack = (): ServerInfo[] => {
  return SERVERS.filter((s) => s.requiresCrack);
};

export const isServerCracked = (ip: string): boolean => {
  try {
    const cracked = localStorage.getItem("cyberpunk_cracked_servers");
    if (cracked) {
      const servers = JSON.parse(cracked);
      return Array.isArray(servers) && servers.includes(ip);
    }
  } catch (e) {
    console.warn("Failed to check cracked servers", e);
  }
  return false;
};

export const markServerAsCracked = (ip: string): void => {
  try {
    const cracked = localStorage.getItem("cyberpunk_cracked_servers");
    const servers = cracked ? JSON.parse(cracked) : [];
    if (!servers.includes(ip)) {
      servers.push(ip);
      localStorage.setItem(
        "cyberpunk_cracked_servers",
        JSON.stringify(servers)
      );
    }
  } catch (e) {
    console.warn("Failed to mark server as cracked", e);
  }
};
