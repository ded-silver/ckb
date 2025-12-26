import type { CommandFunction } from "../../../types";
import {
  getMissions,
  getActiveMissions,
  getCompletedMissions,
  getMissionProgress,
  isMissionCompleted,
} from "../model";

export const missionsCommands: Record<string, CommandFunction> = {
  missions: args => {
    if (args && args.length > 0) {
      const missionId = args[0];
      const mission = getMissions().find(m => m.id === missionId);

      if (!mission) {
        return [`Mission not found: ${missionId}`, 'Type "missions" to see all missions', ""];
      }

      const completed = isMissionCompleted(missionId);
      const progress = getMissionProgress(missionId);

      const output = [
        "",
        `MISSION: ${mission.title.toUpperCase()}`,
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `Status: ${completed ? "COMPLETED" : "IN PROGRESS"}`,
        `Description: ${mission.description}`,
        `Hint: ${mission.hint}`,
        "",
        "Requirements:",
      ];

      for (const req of mission.requirements) {
        const reqId = `${req.type}_${req.target}`;
        const currentCount = progress[reqId] || 0;
        const requiredCount = req.count || 1;
        const status = currentCount >= requiredCount ? "✓" : " ";
        const progressText = requiredCount > 1 ? ` (${currentCount}/${requiredCount})` : "";

        output.push(`  [${status}] ${req.type}: ${req.target}${progressText}`);
      }

      if (completed && mission.reward) {
        output.push("");
        output.push("Rewards:");
        if (mission.reward.unlockFile) {
          output.push(`  - File unlocked: ${mission.reward.unlockFile}`);
        }
        if (mission.reward.unlockCommand) {
          output.push(`  - Command unlocked: ${mission.reward.unlockCommand}`);
        }
        if (mission.reward.unlockSecret) {
          output.push(`  - Secret unlocked: ${mission.reward.unlockSecret}`);
        }
      }

      output.push("");
      return output;
    }

    const activeMissions = getActiveMissions();
    const completedMissions = getCompletedMissions();
    const allMissions = getMissions();

    const output = ["", "MISSIONS", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", ""];

    if (activeMissions.length > 0) {
      output.push("ACTIVE MISSIONS:");
      output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      for (const mission of activeMissions) {
        const progress = getMissionProgress(mission.id);
        let completedReqs = 0;
        let totalReqs = mission.requirements.length;

        for (const req of mission.requirements) {
          const reqId = `${req.type}_${req.target}`;
          const currentCount = progress[reqId] || 0;
          const requiredCount = req.count || 1;
          if (currentCount >= requiredCount) {
            completedReqs++;
          }
        }

        output.push(`[${activeMissions.indexOf(mission) + 1}] ${mission.title}`);
        output.push(`    Description: ${mission.description}`);
        output.push(`    Progress: ${completedReqs}/${totalReqs} requirements`);
        output.push(`    Hint: ${mission.hint}`);
        output.push("");
      }
    } else {
      output.push("No active missions.");
      output.push("");
    }

    if (completedMissions.length > 0) {
      output.push("COMPLETED MISSIONS:");
      output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      for (const missionId of completedMissions) {
        const mission = allMissions.find(m => m.id === missionId);
        if (mission) {
          output.push(`[DONE] ${mission.title}`);
        }
      }
      output.push("");
    }

    output.push("Usage: missions <id> - Show mission details");
    output.push("");
    return output;
  },

  quest: args => {
    return missionsCommands.missions(args);
  },
};
