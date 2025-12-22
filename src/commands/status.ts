import { CommandFunction } from "../types";
import { getProgressStats } from "../utils/progress";
import { getMissions, getCompletedMissions } from "../utils/missions";
import { getAllSecrets, getDiscoveredSecrets } from "../utils/secrets";

export const statusCommand: CommandFunction = () => {
  const stats = getProgressStats();
  const totalMissions = getMissions().length;
  const completedMissions = getCompletedMissions().length;
  const totalSecrets = getAllSecrets().length;
  const discoveredSecrets = getDiscoveredSecrets().length;

  return [
    "",
    "╔═══════════════════════════════════╗",
    "║        HACKER PROFILE             ║",
    "╠═══════════════════════════════════╣",
    `║ Missions:     ${completedMissions}/${totalMissions}${" ".repeat(
      20 - String(completedMissions).length - String(totalMissions).length - 1
    )}║`,
    `║ Secrets:      ${discoveredSecrets}/${totalSecrets}${" ".repeat(
      20 - String(discoveredSecrets).length - String(totalSecrets).length - 1
    )}║`,
    `║ Servers:      ${stats.serversHacked}${" ".repeat(
      20 - String(stats.serversHacked).length
    )}║`,
    `║ Files Read:   ${stats.filesRead}${" ".repeat(
      20 - String(stats.filesRead).length
    )}║`,
    "╚═══════════════════════════════════╝",
    "",
  ];
};
