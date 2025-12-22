import {
  checkMissionRequirements,
  completeMission,
  getActiveMissions,
  getMissions,
} from "./missions";
import { trackFileRead, trackHack } from "./progress";

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
