const CORRUPTION_MAP: Record<string, string[]> = {
  // Латинские буквы -> кириллица и другие похожие символы
  a: ["а", "α", "а", "а"],
  A: ["А", "Α", "А", "А"],
  e: ["е", "е", "ε", "е"],
  E: ["Е", "Е", "Ε", "Е"],
  o: ["о", "о", "ο", "о"],
  O: ["О", "О", "Ο", "О"],
  p: ["р", "р", "ρ", "р"],
  P: ["Р", "Р", "Ρ", "Р"],
  c: ["с", "с", "ς", "с"],
  C: ["С", "С", "Σ", "С"],
  x: ["х", "х", "χ", "х"],
  X: ["Х", "Х", "Χ", "Х"],
  y: ["у", "у", "γ", "у"],
  Y: ["У", "У", "Υ", "У"],
  // Цифры
  "0": ["О", "о", "Ο", "0"],
  "1": ["1", "l", "I", "1"],
  "3": ["3", "З", "з", "3"],
  "6": ["6", "б", "б", "6"],
  // Специальные символы
  ".": ["·", "•", ".", "·"],
  ",": [",", "‚", ",", ","],
  "!": ["!", "¡", "!", "!"],
  "?": ["?", "¿", "?", "?"],
  "-": ["-", "—", "–", "-"],
  _: ["_", "‗", "_", "_"],
  "=": ["=", "═", "=", "="],
  "+": ["+", "±", "+", "+"],
  "*": ["*", "×", "∗", "*"],
  "/": ["/", "⁄", "/", "/"],
  "\\": ["\\", "╲", "\\", "\\"],
  "|": ["|", "│", "|", "|"],
  "<": ["<", "‹", "<", "<"],
  ">": [">", "›", ">", ">"],
  "[": ["[", "［", "[", "["],
  "]": ["]", "］", "]", "]"],
  "(": ["(", "（", "(", "("],
  ")": [")", "）", ")", ")"],
  "{": ["{", "｛", "{", "{"],
  "}": ["}", "｝", "}", "}"],
};

// Случайные юникод-символы
const RANDOM_CORRUPTION_CHARS = [
  "",
  "▯",
  "▮",
  "▭",
  "▬",
  "▫",
  "▪",
  "▿",
  "▾",
  "▽",
  "▼",
  "▲",
  "△",
  "▴",
  "▵",
  "◁",
  "▷",
  "◂",
  "▸",
  "◃",
  "▹",
  "◄",
  "►",
  "◅",
  "▻",
  "◌",
  "◍",
  "◎",
  "◐",
  "◑",
  "◒",
  "◓",
  "◔",
  "◕",
  "◖",
  "◗",
  "◘",
  "◙",
  "◚",
  "◛",
  "◜",
  "◝",
  "◞",
  "◟",
  "◠",
  "◡",
  "◢",
  "◣",
  "◤",
  "◥",
  "◦",
  "◧",
  "◨",
  "◩",
  "◪",
  "◫",
  "◬",
  "◭",
  "◮",
  "◯",
  "◰",
  "◱",
  "◲",
  "◳",
  "◴",
  "◵",
  "◶",
  "◷",
  "◸",
  "◹",
  "◺",
  "◻",
  "◼",
  "◿",
  "☀",
  "☁",
  "☂",
  "☃",
  "☄",
  "★",
  "☆",
  "☇",
  "☈",
  "☉",
  "☊",
  "☋",
  "☌",
  "☍",
  "☎",
  "☏",
  "☐",
  "☑",
  "☒",
  "☓",
];

const corruptChar = (char: string, corruptionLevel: number): string => {
  const random = Math.random();

  if (random < corruptionLevel * 0.3) {
    return RANDOM_CORRUPTION_CHARS[
      Math.floor(Math.random() * RANDOM_CORRUPTION_CHARS.length)
    ];
  }

  if (random < corruptionLevel * 0.7 && CORRUPTION_MAP[char]) {
    const alternatives = CORRUPTION_MAP[char];
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  if (random < corruptionLevel && char.match(/[a-zA-Z0-9]/)) {
    if (CORRUPTION_MAP[char]) {
      const alternatives = CORRUPTION_MAP[char];
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
  }

  return char;
};

export const corruptText = (
  text: string,
  corruptionLevel: number = 0.3
): string => {
  if (corruptionLevel <= 0) return text;
  if (corruptionLevel >= 1) {
    return text
      .split("")
      .map(
        () =>
          RANDOM_CORRUPTION_CHARS[
            Math.floor(Math.random() * RANDOM_CORRUPTION_CHARS.length)
          ]
      )
      .join("");
  }

  return text
    .split("")
    .map((char) => corruptChar(char, corruptionLevel))
    .join("");
};

export const corruptTextGradually = (
  text: string,
  progress: number // 0.0 - 1.0
): string => {
  const corruptionLevel = Math.min(progress * 0.8, 0.8);
  return corruptText(text, corruptionLevel);
};

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const corruptionCache = new Map<string, string>();

export const corruptRandomChars = (
  text: string,
  probability: number = 0.1 // вероятность искажения каждого символа
): string => {
  const timeSeed = Math.floor(Date.now() / 2000); // Обновляется каждые 2 секунды

  return text
    .split("")
    .map((char, index) => {
      if (char.trim() === "") {
        return char;
      }

      const key = `${text}-${index}-${timeSeed}`;

      const cached = corruptionCache.get(key);
      if (cached !== undefined) {
        return cached;
      }

      const hash = simpleHash(key);
      const shouldCorrupt = (hash % 1000) / 1000 < probability;

      if (shouldCorrupt) {
        const corrupted = corruptChar(char, 1);
        corruptionCache.set(key, corrupted);

        if (corruptionCache.size > 1000) {
          const firstKey = corruptionCache.keys().next().value;
          if (firstKey) {
            corruptionCache.delete(firstKey);
          }
        }

        return corrupted;
      }

      corruptionCache.set(key, char);
      return char;
    })
    .join("");
};
