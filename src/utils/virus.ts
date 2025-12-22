export type VirusType =
  | "trojan"
  | "prototype"
  | "honeypot"
  | "adware"
  | "corruption";

export interface VirusState {
  isInfected: boolean;
  timeRemaining: number;
  startTime: number;
  virusType?: VirusType;
}

const VIRUS_STORAGE_KEY = "cyberpunk_virus_state";
const NEO_CORP_HACK_KEY = "cyberpunk_neocorp_hacked";
const VIRUS_TIMEOUT = 45000; // 45 секунд

export const isNeoCorpHacked = (): boolean => {
  try {
    return localStorage.getItem(NEO_CORP_HACK_KEY) === "true";
  } catch (e) {
    return false;
  }
};

export const markNeoCorpHacked = (): void => {
  try {
    localStorage.setItem(NEO_CORP_HACK_KEY, "true");
  } catch (e) {
    console.warn("Failed to mark NeoCorp as hacked", e);
  }
};

export const getVirusState = (): VirusState | null => {
  try {
    const saved = localStorage.getItem(VIRUS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const elapsed = Date.now() - parsed.startTime;

      if (parsed.virusType === "adware") {
        return {
          ...parsed,
          timeRemaining: 999999,
        };
      }

      if (parsed.virusType === "corruption") {
        return {
          ...parsed,
          timeRemaining: 999999,
        };
      }

      const remaining = Math.max(0, VIRUS_TIMEOUT - elapsed);

      if (remaining <= 0) {
        clearVirusState();
        return null;
      }

      return {
        ...parsed,
        timeRemaining: remaining,
      };
    }
  } catch (e) {
    console.warn("Failed to load virus state", e);
  }
  return null;
};

export const setVirusState = (
  infected: boolean,
  virusType: VirusType = "trojan"
): void => {
  if (infected) {
    const state: VirusState = {
      isInfected: true,
      timeRemaining: VIRUS_TIMEOUT,
      startTime: Date.now(),
      virusType,
    };
    localStorage.setItem(VIRUS_STORAGE_KEY, JSON.stringify(state));

    if (virusType === "corruption") {
      import("./commandTracking").then((module) => {
        const { ensureCorruptionDeactivationFile } = module as any;
        if (ensureCorruptionDeactivationFile) {
          ensureCorruptionDeactivationFile();
        }
      });
    }
  } else {
    clearVirusState();
  }
};

export const clearVirusState = (): void => {
  localStorage.removeItem(VIRUS_STORAGE_KEY);
};

export const checkVirusTrigger = (
  command: string,
  args?: string[]
): boolean => {
  const cmd = command.toLowerCase();

  const executionCommands = [
    "gcc",
    "g++",
    "nasm",
    "as",
    "ld",
    "make",
    "./",
    "exec",
    "run",
    "bash",
    "sh",
  ];
  if (
    executionCommands.some(
      (execCmd) => cmd === execCmd || cmd.startsWith(execCmd)
    )
  ) {
    if (args && args.length > 0) {
      const fileArg = args.join(" ").toLowerCase();
      if (
        fileArg.includes("virus_prototype") ||
        fileArg.includes("virus_prototype.asm")
      ) {
        return true;
      }
    }
  }

  const readCommands = ["cat", "head", "tail", "less", "more"];
  if (!readCommands.includes(cmd)) {
    return false;
  }

  if (!args || args.length === 0) {
    return false;
  }

  const fileName = args.find((arg) => !arg.startsWith("-"));
  if (!fileName) {
    return false;
  }

  const fileArg = fileName.toLowerCase();

  const triggers = [
    "neocorp_countermeasure.dat",
    "project_alpha_defense.exe",
    "neocorp_alert.dat",
    "extracted_data.dat",
    "virus_prototype.asm",
    "message_from_lain.dat",
  ];

  return triggers.some(
    (trigger) =>
      fileArg.includes("neocorp_countermeasure") ||
      fileArg.includes("project_alpha_defense") ||
      fileArg.includes("neocorp_alert") ||
      fileArg.includes("extracted_data") ||
      fileArg.includes("virus_prototype") ||
      fileArg.includes("message_from_lain") ||
      fileArg.includes("message_from_") ||
      fileArg.includes("corrupted_unicode") ||
      fileArg.includes("broken_encoding") ||
      fileArg.includes("text_corruption") ||
      fileArg.endsWith(trigger) ||
      fileArg.endsWith("/" + trigger)
  );
};
export const detectVirusType = (
  _command: string,
  args?: string[]
): VirusType => {
  const fileArg = args?.join(" ").toLowerCase() || "";

  if (fileArg.includes("virus_prototype")) {
    return "prototype";
  }

  if (fileArg.includes("extracted_data")) {
    return "honeypot";
  }

  if (
    fileArg.includes("message_from_lain") ||
    fileArg.includes("message_from_")
  ) {
    return "adware";
  }

  if (
    fileArg.includes("corrupted_unicode") ||
    fileArg.includes("broken_encoding") ||
    fileArg.includes("text_corruption")
  ) {
    return "corruption";
  }

  // neocorp_countermeasure, project_alpha_defense, neocorp_alert - это трояны
  return "trojan";
};

export const generateDeactivationCode = (virusType: VirusType): string => {
  const codes: Record<VirusType, string> = {
    trojan: "ALPHA-DEFENSE-2077",
    honeypot: "HONEYPOT-BREAK-42",
    prototype: "PROTOTYPE-KILL-SWITCH",
    adware: "LAIN-DISCONNECT-2077",
    corruption: "UNICODE-FIX-UTF8",
  };
  return codes[virusType] || codes.trojan;
};

export const getDeactivationHint = (virusType: VirusType): string => {
  const hints: Record<VirusType, string> = {
    trojan: "Check NeoCorp security protocols. Format: ALPHA-*-2077",
    honeypot: "Honeypot trap code. Format: HONEYPOT-*-42",
    prototype: "Prototype kill switch. Format: PROTOTYPE-*-SWITCH",
    adware: "Lain's disconnect code. Format: LAIN-*-2077",
    corruption: "Unicode fix code. Format: UNICODE-*-UTF8",
  };
  return hints[virusType] || hints.trojan;
};

export const checkDeactivationCode = (
  code: string,
  virusType?: VirusType
): boolean => {
  if (!virusType) {
    const state = getVirusState();
    virusType = state?.virusType || "trojan";
  }
  const correctCode = generateDeactivationCode(virusType);
  return code.toUpperCase().trim() === correctCode.toUpperCase().trim();
};

export const getVirusInfectionOutput = (
  virusType: VirusType = "trojan"
): string[] => {
  if (virusType === "honeypot") {
    return [
      "",
      "╔══════════════════════════════════════════════════╗",
      "║        CRITICAL WARNING: VIRUS DETECTED          ║",
      "╚══════════════════════════════════════════════════╝",
      "",
      "> Honeypot activated!",
      "> Malicious code detected in file!",
      "> System infection in progress...",
      "",
      "> [WARNING] Honeypot payload executed",
      "> [WARNING] NeoCorp trap activated",
      "> [WARNING] System integrity compromised",
      "> [WARNING] Files are being encrypted...",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "VIRUS ACTIVATED: HONEYPOT.ALPHA.2077",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> The server you hacked contained not only data,",
      "> but also a hidden trojan. NeoCorp uses honeypot",
      "> technology: attractive files with Project Alpha",
      "> data are actually traps for hackers.",
      "",
      "> The honeypot is now encrypting your files.",
      "",
      "> System will be destroyed in: [TIMER]",
      "",
      "> To stop the virus, type: antivirus",
      "> Or try: cure",
      "",
      "> Good luck, hacker...",
      "",
    ];
  }

  if (virusType === "prototype") {
    return [
      "",
      "╔══════════════════════════════════════════════════╗",
      "║        CRITICAL WARNING: VIRUS DETECTED          ║",
      "╚══════════════════════════════════════════════════╝",
      "",
      "> Virus prototype activated!",
      "> Experimental code executed!",
      "> System infection in progress...",
      "",
      "> [WARNING] Self-replication code detected",
      "> [WARNING] Virus prototype has escaped control",
      "> [WARNING] System integrity compromised",
      "> [WARNING] Files are being encrypted...",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "VIRUS ACTIVATED: PROTOTYPE.2077",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> You found/created a virus prototype for testing",
      "> system security. But when you tried to test it,",
      "> the virus activated and went out of control.",
      "",
      "> 'The creator became a victim of their own creation.'",
      "",
      "> The prototype is now encrypting your files.",
      "",
      "> System will be destroyed in: [TIMER]",
      "",
      "> To stop the virus, type: antivirus <deactivation_code>",
      "",
      `> Hint: ${getDeactivationHint("prototype")}`,
      "",
      "> Good luck, hacker...",
      "",
    ];
  }

  if (virusType === "corruption") {
    return [
      "",
      "╔══════════════════════════════════════════════════╗",
      "║     CRITICAL: UNICODE CORRUPTION DETECTED        ║",
      "╚══════════════════════════════════════════════════╝",
      "",
      "> [ERROR] Text encoding corrupted!",
      "> [ERROR] Unicode characters are being replaced!",
      "> [ERROR] System text is becoming unreadable!",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "   CORRUPTION VIRUS ACTIVATED  ",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> [WARNING] Text corruption spreading through system",
      "> [WARNING] Characters are being replaced with similar Unicode",
      "> [WARNING] Commands and output will become unreadable",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "VIRUS ACTIVATED: CORRUPTION.UNICODE.2077",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> Your text is being corrupted...",
      "> Unicode characters are replacing normal text...",
      "> The system is becoming unreadable...",
      "",
      "> INFECTION: PERMANENT (Cure with antivirus code)",
      "",
      "> To stop the virus, type: antivirus <deactivation_code>",
      "",
      `> Hint: ${getDeactivationHint("corruption")}`,
      "",
      "> Good luck, hacker...",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ];
  }

  if (virusType === "adware") {
    return [
      "",
      "╔═══════════════════════════════════════════════════╗",
      "║     ╔═══════════════════════════════════════╗     ║",
      "║     ║      CLICK HERE FOR FREE CREDITS!     ║     ║",
      "║     ║      GET RICH QUICK! 99% SUCCESS!     ║     ║",
      "║     ╚═══════════════════════════════════════╝     ║",
      "╚═══════════════════════════════════════════════════╝",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "   ADWARE INFECTION DETECTED  ",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> Message from Lain decoded...",
      "> Hidden payload detected!",
      "> Adware payload executed!",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      " SPECIAL OFFER! ",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      ">  WIN 1,000,000 CREDITS NOW!",
      ">  UPGRADE YOUR HACKING TOOLS!",
      ">  BOOST YOUR SYSTEM PERFORMANCE!",
      ">  PLAY THE BEST GAMES FOR FREE!",
      "",
      "> [AD] NeoCorp Premium: Only 999 credits/month!",
      "> [AD] Get 50% off on all hacking tools!",
      "> [AD] Download free malware protection now!",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "VIRUS ACTIVATED: ADWARE.LAIN.2077",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> Lain sent you an encrypted message through Wired.",
      "> But the message contained a hidden payload -",
      "> adware virus that activates on decoding attempt.",
      "",
      "> 'Present day, present time... infection.'",
      "",
      "> The adware is now flooding your system with",
      "> advertisements and pop-ups. Your terminal is",
      "> being spammed with fake offers and scams.",
      "",
      "> System will be destroyed in: [TIMER]",
      "",
      "> To stop the virus, type: antivirus <deactivation_code>",
      "",
      `> Hint: ${getDeactivationHint("adware")}`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      " HOT DEAL!  Click now to claim your prize!",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> Good luck, hacker...",
      "",
    ];
  }

  return [
    "",
    "╔══════════════════════════════════════════════════╗",
    "║        CRITICAL WARNING: VIRUS DETECTED          ║",
    "╚══════════════════════════════════════════════════╝",
    "",
    "> NeoCorp Counter-Intrusion System activated!",
    "> Malicious code detected in file!",
    "> System infection in progress...",
    "",
    "> [WARNING] Unauthorized access detected",
    "> [WARNING] Project Alpha Defense Protocol: ACTIVE",
    "> [WARNING] System integrity compromised",
    "> [WARNING] Files are being encrypted...",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "VIRUS ACTIVATED: TROJAN.ALPHA.2077",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "> After successful NeoCorp Vault breach, the system",
    "> detected unauthorized access and activated",
    "> 'Project Alpha Defense' protocol.",
    "",
    "> The trojan TROJAN.ALPHA.2077 is now encrypting",
    "> your files, attempting to block data leak.",
    "",
    "> System will be destroyed in: [TIMER]",
    "",
    "> To stop the virus, type: antivirus <deactivation_code>",
    "",
    `> Hint: ${getDeactivationHint("trojan")}`,
    "",
    "> Good luck, hacker...",
    "",
  ];
};

export const getVirusCureOutput = (code?: string): string[] => {
  const state = getVirusState();
  const virusType = state?.virusType || "trojan";

  if (!code) {
    return [
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "ANTIVIRUS SCAN INITIATED",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> Deactivation code required!",
      "",
      `> ${getDeactivationHint(virusType)}`,
      "",
      "> Usage: antivirus <deactivation_code>",
      "",
      `> Example: antivirus ${generateDeactivationCode(virusType)}`,
      "",
    ];
  }

  if (!checkDeactivationCode(code, virusType)) {
    return [
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "ANTIVIRUS SCAN FAILED",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "> Invalid deactivation code!",
      "",
      `> ${getDeactivationHint(virusType)}`,
      "",
      "> Try again before system destruction!",
      "",
    ];
  }

  return [
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "ANTIVIRUS SCAN INITIATED",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "> Deactivation code accepted!",
    "> Scanning system...",
    "> [                    ] 0%",
    "> [██                  ] 20%",
    "> [█████               ] 40%",
    "> [███████             ] 60%",
    "> [██████████          ] 80%",
    "> [████████████████████] 100%",
    "",
    `> Virus detected: ${virusType.toUpperCase()}.2077`,
    "> Attempting removal...",
    "",
    "> [1/5] Isolating infected files...",
    "> [2/5] Quarantining malicious code...",
    "> [3/5] Removing virus payload...",
    "> [4/5] Restoring system files...",
    "> [5/5] Verifying system integrity...",
    "",
    "> Virus successfully removed!",
    "> System restored to normal operation",
    "",
    "> Warning: NeoCorp is aware of your activities.",
    "> Be more careful next time!",
    "",
  ];
};

export const checkVirusTimeout = (): boolean => {
  const state = getVirusState();
  if (!state || !state.isInfected) {
    return false;
  }

  if (state.virusType === "adware" || state.virusType === "corruption") {
    return false;
  }

  const elapsed = Date.now() - state.startTime;
  return elapsed >= VIRUS_TIMEOUT;
};
