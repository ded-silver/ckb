import type { Secret } from "../../types";

const STORAGE_KEY = "cyberpunk_secrets";

const loadDiscovered = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.warn("Failed to load discovered secrets", e);
  }
  return [];
};

const saveDiscovered = (secrets: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(secrets));
  } catch (e) {
    console.warn("Failed to save discovered secrets", e);
  }
};

export const getAllSecrets = (): Secret[] => {
  return [
    {
      id: "konami",
      name: "Konami Code",
      description: "Classic cheat code from retro games",
      trigger: {
        type: "command",
        condition: "konami",
      },
    },
    {
      id: "matrix",
      name: "Matrix Reference",
      description: "Wake up, Neo...",
      trigger: {
        type: "command",
        condition: "matrix",
      },
    },
    {
      id: "sudo",
      name: "Sudo Easter Egg",
      description: "Access denied joke",
      trigger: {
        type: "command",
        condition: "sudo",
      },
    },
    {
      id: "hacktheworld",
      name: "Hack the World",
      description: "Global hack sequence",
      trigger: {
        type: "command",
        condition: "hacktheworld",
      },
    },
    {
      id: "easteregg",
      name: "Easter Egg",
      description: "Hidden surprise",
      trigger: {
        type: "command",
        condition: "easteregg",
      },
    },
    {
      id: "first_secret",
      name: "First Discovery",
      description: "You discovered your first secret!",
      trigger: {
        type: "mission_complete",
        condition: "secret_hunter",
      },
    },
    {
      id: "ghost",
      name: "Ghost in the Shell",
      description: "Cyberbrain connection reference",
      trigger: {
        type: "command",
        condition: "ghost",
      },
    },
    {
      id: "blade",
      name: "Blade Runner",
      description: "Tears in rain quote",
      trigger: {
        type: "command",
        condition: "blade",
      },
    },
    {
      id: "tron",
      name: "Tron",
      description: "Greetings, Program!",
      trigger: {
        type: "command",
        condition: "tron",
      },
    },
    {
      id: "deus",
      name: "Deus Ex",
      description: "I never asked for this",
      trigger: {
        type: "command",
        condition: "deus",
      },
    },
    {
      id: "wake",
      name: "Wake Up",
      description: "Cyberpunk 2077 reference",
      trigger: {
        type: "command",
        condition: "wake",
      },
    },
    {
      id: "rosebud",
      name: "Rosebud",
      description: "The Sims cheat code",
      trigger: {
        type: "command",
        condition: "rosebud",
      },
    },
    {
      id: "idkfa",
      name: "IDKFA",
      description: "Doom cheat code",
      trigger: {
        type: "command",
        condition: "idkfa",
      },
    },
    {
      id: "thereisnospoon",
      name: "There Is No Spoon",
      description: "The Matrix reference",
      trigger: {
        type: "command",
        condition: "thereisnospoon",
      },
    },
  ];
};

export const isSecretDiscovered = (secretId: string): boolean => {
  return loadDiscovered().includes(secretId);
};

export const getDiscoveredSecrets = (): string[] => {
  return loadDiscovered();
};

export const discoverSecret = (secretId: string): boolean => {
  if (isSecretDiscovered(secretId)) {
    return false;
  }

  const discovered = loadDiscovered();
  discovered.push(secretId);
  saveDiscovered(discovered);
  return true;
};

export const checkSecretTriggers = (
  command: string,
  _args?: string[],
  missionId?: string
): string | null => {
  const allSecrets = getAllSecrets();
  const discovered = loadDiscovered();

  if (!Array.isArray(discovered)) {
    return null;
  }

  for (const secret of allSecrets) {
    if (!secret || !secret.id) {
      continue;
    }
    if (discovered.includes(secret.id)) {
      continue;
    }

    const trigger = secret.trigger;

    if (trigger.type === "command" && trigger.condition === command) {
      discoverSecret(secret.id);
      return secret.id;
    }

    if (trigger.type === "mission_complete" && missionId && trigger.condition === missionId) {
      discoverSecret(secret.id);
      return secret.id;
    }

    if (trigger.type === "combination") {
    }
  }

  return null;
};

export const getTotalSecretsCount = (): number => {
  return getAllSecrets().length;
};
