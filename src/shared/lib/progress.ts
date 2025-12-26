import type { ProgressStats } from "../../types";

const STORAGE_KEY = "cyberpunk_progress";

const defaultStats: ProgressStats = {
  missionsCompleted: 0,
  secretsFound: 0,
  serversHacked: 0,
  filesRead: 0,
};

const loadStats = (): ProgressStats => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultStats, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Failed to load progress stats", e);
  }
  return { ...defaultStats };
};

const saveStats = (stats: ProgressStats): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("Failed to save progress stats", e);
  }
};

export const getProgressStats = (): ProgressStats => {
  const stats = loadStats();

  try {
    const missionsData = localStorage.getItem("cyberpunk_missions");
    if (missionsData) {
      const missions = JSON.parse(missionsData);
      stats.missionsCompleted = missions.completed?.length || 0;
    }
  } catch (error) {
    console.warn("Failed to load missions data:", error);
  }

  try {
    const secretsData = localStorage.getItem("cyberpunk_secrets");
    if (secretsData) {
      const secrets = JSON.parse(secretsData);
      stats.secretsFound = Array.isArray(secrets) ? secrets.length : 0;
    }
  } catch (error) {
    console.warn("Failed to load secrets data:", error);
  }

  saveStats(stats);
  return stats;
};

export const incrementStat = (statType: keyof ProgressStats): void => {
  const stats = loadStats();
  stats[statType] = (stats[statType] || 0) + 1;
  saveStats(stats);
};

export const trackFileRead = (filePath: string): void => {
  try {
    const readFilesKey = "cyberpunk_files_read";
    const readFiles = localStorage.getItem(readFilesKey);
    const files = readFiles ? JSON.parse(readFiles) : [];

    if (!files.includes(filePath)) {
      files.push(filePath);
      localStorage.setItem(readFilesKey, JSON.stringify(files));
      incrementStat("filesRead");
    }
  } catch (e) {
    console.warn("Failed to track file read", e);
  }
};

export const trackHack = (serverIP?: string): void => {
  try {
    const hackedServersKey = "cyberpunk_servers_hacked";
    const hackedServers = localStorage.getItem(hackedServersKey);
    const servers = hackedServers ? JSON.parse(hackedServers) : [];

    const serverId = serverIP || `server_${Date.now()}`;
    if (!servers.includes(serverId)) {
      servers.push(serverId);
      localStorage.setItem(hackedServersKey, JSON.stringify(servers));
      incrementStat("serversHacked");
    }
  } catch (e) {
    console.warn("Failed to track hack", e);
  }
};

export const resetProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("cyberpunk_files_read");
    localStorage.removeItem("cyberpunk_servers_hacked");
  } catch (e) {
    console.warn("Failed to reset progress", e);
  }
};
