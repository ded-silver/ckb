import { getServerByIP, markServerAsCracked, isServerCracked } from "./servers";
import { unlockFile } from "./missions";

export interface CrackAttempt {
  target: string;
  password: string;
  mask: string;
  attempts: number;
  maxAttempts: number;
  isCracked: boolean;
}

const STORAGE_KEY = "cyberpunk_crack_attempts";

export const generateMask = (guess: string, password: string): string => {
  const guessUpper = guess.toUpperCase();
  const passwordUpper = password.toUpperCase();
  const mask: string[] = [];

  const passwordMatched = new Array(password.length).fill(false);

  for (let i = 0; i < guessUpper.length && i < passwordUpper.length; i++) {
    if (guessUpper[i] === passwordUpper[i]) {
      mask[i] = guessUpper[i];
      passwordMatched[i] = true;
    } else {
      mask[i] = "_";
    }
  }

  for (let i = 0; i < guessUpper.length && i < passwordUpper.length; i++) {
    if (mask[i] === "_") {
      for (let j = 0; j < passwordUpper.length; j++) {
        if (
          !passwordMatched[j] &&
          passwordUpper[j] === guessUpper[i] &&
          j !== i
        ) {
          mask[i] = "?";
          passwordMatched[j] = true;
          break;
        }
      }
    }
  }

  while (mask.length < password.length) {
    mask.push("_");
  }

  return mask.join("");
};

export const attemptCrack = (
  target: string,
  password: string
): {
  success: boolean;
  mask: string;
  message: string;
  attempt: CrackAttempt | null;
} => {
  const server = getServerByIP(target);
  if (!server) {
    return {
      success: false,
      mask: "",
      message: `Server ${target} not found. Use 'scan' to find targets.`,
      attempt: null,
    };
  }

  if (isServerCracked(target)) {
    return {
      success: false,
      mask: "",
      message: `Server ${target} is already cracked.`,
      attempt: null,
    };
  }

  let attempts: Record<string, CrackAttempt> = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      attempts = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load crack attempts", e);
  }

  const existingAttempt = attempts[target];
  const maxAttempts =
    server.difficulty === "easy" ? 5 : server.difficulty === "medium" ? 8 : 12;
  const currentAttempts = existingAttempt ? existingAttempt.attempts + 1 : 1;

  if (currentAttempts > maxAttempts) {
    return {
      success: false,
      mask: "",
      message: `Maximum attempts (${maxAttempts}) reached for ${target}. Server locked.`,
      attempt: existingAttempt || null,
    };
  }

  const passwordUpper = password.toUpperCase();
  const serverPasswordUpper = server.password.toUpperCase();

  if (passwordUpper.length !== serverPasswordUpper.length) {
    const mask = generateMask(passwordUpper, serverPasswordUpper);
    const attempt: CrackAttempt = {
      target,
      password: passwordUpper,
      mask,
      attempts: currentAttempts,
      maxAttempts,
      isCracked: false,
    };
    attempts[target] = attempt;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch (e) {
      console.warn("Failed to save crack attempt", e);
    }

    return {
      success: false,
      mask,
      message: `Password length mismatch. Expected ${serverPasswordUpper.length} characters.`,
      attempt,
    };
  }

  if (passwordUpper === serverPasswordUpper) {
    markServerAsCracked(target);

    for (const filePath of server.unlockFiles) {
      unlockFile(filePath);
    }

    const attempt: CrackAttempt = {
      target,
      password: passwordUpper,
      mask: passwordUpper,
      attempts: currentAttempts,
      maxAttempts,
      isCracked: true,
    };
    attempts[target] = attempt;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch (e) {
      console.warn("Failed to save crack attempt", e);
    }

    return {
      success: true,
      mask: passwordUpper,
      message: `Password cracked! Access granted to ${target}.`,
      attempt,
    };
  }

  const mask = generateMask(passwordUpper, serverPasswordUpper);
  const attempt: CrackAttempt = {
    target,
    password: passwordUpper,
    mask,
    attempts: currentAttempts,
    maxAttempts,
    isCracked: false,
  };
  attempts[target] = attempt;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch (e) {
    console.warn("Failed to save crack attempt", e);
  }

  const remaining = maxAttempts - currentAttempts;
  return {
    success: false,
    mask,
    message: `Access denied. ${remaining} attempt${
      remaining !== 1 ? "s" : ""
    } remaining.`,
    attempt,
  };
};

export const getCrackStatus = (target?: string): CrackAttempt[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const attempts: Record<string, CrackAttempt> = JSON.parse(saved);
      if (target) {
        return attempts[target] ? [attempts[target]] : [];
      }
      return Object.values(attempts);
    }
  } catch (e) {
    console.warn("Failed to load crack attempts", e);
  }
  return [];
};

export const clearCrackAttempts = (target?: string): void => {
  try {
    if (target) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const attempts: Record<string, CrackAttempt> = JSON.parse(saved);
        delete attempts[target];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Failed to clear crack attempts", e);
  }
};
