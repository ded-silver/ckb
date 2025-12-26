import { attemptCrack, getCrackStatus, clearCrackAttempts } from "@features/network/lib/crack";
import {
  getServerByIP,
  getServersRequiringCrack,
  isServerCracked,
} from "@features/network/lib/servers";

import type { CommandFunction } from "../../../types";

export const crackCommand: CommandFunction = args => {
  if (!args || args.length === 0) {
    const servers = getServersRequiringCrack();
    const attempts = getCrackStatus();

    const output: string[] = [];
    output.push("");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("  PASSWORD CRACKING SYSTEM");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("");
    output.push("  Available targets:");
    output.push("");

    for (const server of servers) {
      const cracked = isServerCracked(server.ip);
      const attempt = attempts.find(a => a.target === server.ip);
      const status = cracked
        ? "[CRACKED]"
        : attempt
          ? `[${attempt.attempts}/${attempt.maxAttempts} attempts]`
          : "[NOT STARTED]";

      output.push(`  ${server.ip.padEnd(15)} - ${server.name.padEnd(15)} ${status}`);
      if (attempt && !cracked) {
        output.push(`    Last mask: ${attempt.mask}`);
      }
    }

    output.push("");
    output.push("  Usage: crack <target> <password>");
    output.push("         crack status [target]");
    output.push("         crack clear [target]");
    output.push("");
    output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    output.push("");

    return output;
  }

  const firstArg = args[0].toLowerCase();

  if (firstArg === "status") {
    const target = args[1];
    const attempts = getCrackStatus(target);
    const output: string[] = [];

    if (target) {
      const server = getServerByIP(target);
      if (!server) {
        return ["", `Server ${target} not found.`, ""];
      }

      const attempt = attempts[0];
      const cracked = isServerCracked(target);

      output.push("");
      output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      output.push(`  CRACK STATUS: ${target}`);
      output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      output.push("");
      output.push(`  Server: ${server.name}`);
      output.push(`  Description: ${server.description}`);
      output.push(`  Difficulty: ${server.difficulty.toUpperCase()}`);
      output.push(`  Status: ${cracked ? "[CRACKED]" : "[NOT CRACKED]"}`);
      output.push("");

      if (attempt) {
        output.push(`  Attempts: ${attempt.attempts}/${attempt.maxAttempts}`);
        if (attempt.attempts > 0) {
          output.push(`  Last mask: ${attempt.mask}`);
        }
      } else {
        output.push("  Attempts: 0");
      }

      output.push("");
      output.push("  Hint files:");
      for (const file of server.hintFiles) {
        output.push(`    - ${file}`);
      }

      output.push("");
      output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      output.push("");
    } else {
      output.push("");
      output.push("  All crack attempts:");
      output.push("");
      for (const attempt of attempts) {
        output.push(
          `  ${attempt.target.padEnd(15)} - ${attempt.attempts}/${attempt.maxAttempts} attempts`
        );
        if (attempt.mask) {
          output.push(`    Last mask: ${attempt.mask}`);
        }
      }
      output.push("");
    }

    return output;
  }

  if (firstArg === "clear") {
    const target = args[1];
    clearCrackAttempts(target);
    return ["", target ? `Cleared attempts for ${target}.` : "Cleared all attempts.", ""];
  }

  if (args.length < 2) {
    return [
      "",
      "Usage: crack <target> <password>",
      "Example: crack 192.168.1.42 ADMIN123",
      "",
      "Use 'scan' to find targets, then 'hack <target>' to see if password is required.",
      "",
    ];
  }

  const target = args[0];
  const password = args.slice(1).join(" ");

  const result = attemptCrack(target, password);

  const output: string[] = [];
  output.push("");
  output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  output.push(`  CRACK ATTEMPT: ${target}`);
  output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  output.push("");
  output.push(`  Password: ${password.toUpperCase()}`);

  if (result.attempt) {
    output.push(`  Attempts: ${result.attempt.attempts}/${result.attempt.maxAttempts}`);
    output.push(`  Mask:     ${result.mask}`);
  }

  output.push("");
  output.push(`  Result: ${result.message}`);

  if (result.success) {
    const server = getServerByIP(target);
    if (server) {
      output.push("");
      output.push("  Files unlocked:");
      for (const file of server.unlockFiles) {
        output.push(`    - ${file}`);
      }
      output.push("");
      output.push("  You can now use 'hack' to access this server.");
    }
  } else if (result.attempt && !result.success) {
    output.push("");
    output.push("  Hint: Check these files for password clues:");
    const server = getServerByIP(target);
    if (server) {
      for (const file of server.hintFiles) {
        output.push(`    - ${file}`);
      }
    }
  }

  output.push("");
  output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  output.push("");

  return output;
};
