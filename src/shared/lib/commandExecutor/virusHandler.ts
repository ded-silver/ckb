import {
  checkVirusTrigger,
  setVirusState,
  getVirusState,
  getVirusInfectionOutput,
  checkVirusTimeout,
  clearVirusState,
  detectVirusType,
} from "@features/virus/model";
import { getDestroyOutput } from "@shared/lib/destroy";
import { soundGenerator } from "@shared/lib/sounds";

import type { CommandResult } from "../../../types";

export const checkVirusTimeoutHandler = (): CommandResult | null => {
  const virusState = getVirusState();
  if (virusState?.isInfected) {
    if (checkVirusTimeout()) {
      clearVirusState();
      return {
        output: getDestroyOutput(),
        shouldDestroy: true,
      };
    }
  }
  return null;
};

export const handleVirusTrigger = async (
  command: string,
  args: string[]
): Promise<CommandResult | null> => {
  if (command.startsWith("./") && command.includes("virus_prototype")) {
    const virusType = detectVirusType(command, args);
    setVirusState(true, virusType);
    soundGenerator.playVirusInfection();
    return {
      output: getVirusInfectionOutput(virusType),
      isVirusActive: true,
    };
  }

  if (checkVirusTrigger(command, args)) {
    const virusType = detectVirusType(command, args);
    setVirusState(true, virusType);

    if (virusType === "corruption") {
      const { ensureCorruptionDeactivationFile } = await import("@shared/lib/commandTracking");
      ensureCorruptionDeactivationFile();
    }

    if (virusType === "trojan") {
      const { ensureTrojanDeactivationFile } = await import("@shared/lib/commandTracking");
      ensureTrojanDeactivationFile();
    }

    if (virusType === "adware") {
      const { ensureLainDeactivationFile } = await import("@shared/lib/commandTracking");
      ensureLainDeactivationFile();
    }

    import("@features/email/lib")
      .then(module => {
        module.triggerAchievementInfected();
      })
      .catch(error => {
        console.warn("Failed to trigger email:", error);
      });

    soundGenerator.playVirusInfection();
    return {
      output: getVirusInfectionOutput(virusType),
      isVirusActive: true,
    };
  }

  return null;
};
