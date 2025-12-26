/**
 * Разбирает аргументы команды на опции (флаги) и позиционные аргументы.
 * Опции - это аргументы, начинающиеся с `-` или `--`.
 */
export const parseCommandArgs = (
  args?: readonly string[]
): { options: Set<string>; positional: string[] } => {
  if (!args) {
    return { options: new Set(), positional: [] };
  }

  if (!Array.isArray(args)) {
    throw new TypeError("args must be an array");
  }

  if (args.length === 0) {
    return { options: new Set(), positional: [] };
  }

  const options = new Set<string>();
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("-")) {
      const optionName = arg.replace(/^--?/, "");
      options.add(optionName);
    } else {
      positional.push(arg);
    }
  }

  return { options, positional };
};

/**
 * Проверяет, есть ли хотя бы одна из указанных опций в наборе опций.
 */
export const hasOption = (options: Set<string>, ...names: string[]): boolean => {
  return names.some(name => options.has(name));
};

/**
 * Возвращает позиционный аргумент по индексу (игнорируя опции).
 */
export const getPositionalArg = (args: readonly string[], index: number): string | undefined => {
  if (!Array.isArray(args)) {
    throw new TypeError("args must be an array");
  }
  if (typeof index !== "number" || index < 0 || !Number.isInteger(index)) {
    throw new TypeError("index must be a non-negative integer");
  }

  const { positional } = parseCommandArgs(args);
  return positional[index];
};

/**
 * Возвращает значение опции (аргумент, следующий за флагом).
 * Например, для `-o file.txt` вернет `file.txt`.
 */
export const getOptionValue = (args: readonly string[], optionName: string): string | undefined => {
  if (!Array.isArray(args)) {
    throw new TypeError("args must be an array");
  }
  if (!optionName || typeof optionName !== "string") {
    throw new TypeError("optionName must be a non-empty string");
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === `-${optionName}` || arg === `--${optionName}`) {
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        return args[i + 1];
      }
    }
  }
  return undefined;
};

/**
 * Возвращает первый позиционный аргумент (игнорируя опции).
 */
export const getFirstPositionalArg = (args: readonly string[]): string | undefined => {
  if (!Array.isArray(args)) {
    throw new TypeError("args must be an array");
  }
  return getPositionalArg(args, 0);
};
