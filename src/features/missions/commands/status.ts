import { getMissions, getCompletedMissions } from "@features/missions/model";
import { getProgressStats } from "@shared/lib/progress";
import { getAllSecrets, getDiscoveredSecrets } from "@shared/lib/secrets";

import type { CommandFunction } from "../../../types";

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
    `║ Servers:      ${stats.serversHacked}${" ".repeat(20 - String(stats.serversHacked).length)}║`,
    `║ Files Read:   ${stats.filesRead}${" ".repeat(20 - String(stats.filesRead).length)}║`,
    "╚═══════════════════════════════════╝",
    "",
  ];
};
