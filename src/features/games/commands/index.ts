/**
 * Команды для игр
 */

import { applicationManager } from "@shared/lib/applicationManager";
import { loadHighScores } from "@widgets/snake-game/model";

import type { CommandFunction } from "../../../types";

export const gamesCommands: Record<string, CommandFunction> = {
  snake: async args => {
    if (!args) {
      applicationManager.openApp("snake");
      return ["Opening Snake Game...", ""];
    }

    const scores = args.includes("--scores") || args.includes("-s");

    if (scores) {
      const highScores = loadHighScores();
      if (highScores.length === 0) {
        return ["No high scores yet. Play the game to set a record!", ""];
      }

      return [
        "SNAKE GAME - HIGH SCORES",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        ...highScores.map((hs, i) => {
          const date = new Date(hs.date).toLocaleDateString();
          return `${i + 1}. ${hs.score} points (Level ${hs.level}, ${hs.difficulty}, ${hs.mode}) - ${date}`;
        }),
        "",
      ];
    }

    applicationManager.openApp("snake");
    return ["Opening Snake Game...", ""];
  },

  "games snake": async args => {
    return gamesCommands.snake(args);
  },
};
