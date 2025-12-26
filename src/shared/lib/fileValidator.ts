import type { FileSystemNode } from "@entities/file/types";

import { getFileFromPath } from "./pathResolver";

export const validateFileExists = (
  fileName: string,
  basePath?: string
): { file?: FileSystemNode; error?: string } => {
  const result = getFileFromPath(fileName, basePath);
  if (result.error) {
    return { error: result.error };
  }
  return { file: result.file };
};

export const validateFileReadable = (
  fileName: string,
  basePath?: string
): { file?: FileSystemNode; error?: string } => {
  const result = getFileFromPath(fileName, basePath);

  if (result.error) {
    return { error: result.error };
  }

  const file = result.file!;

  if (file.type !== "file") {
    return { error: `${fileName} is not a file` };
  }

  if (file.content === undefined) {
    return { error: `${fileName} is not a readable file` };
  }

  return { file };
};
