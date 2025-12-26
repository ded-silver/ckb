import { getFileSystem, getCurrentDirectory } from "@entities/file/model";
import type { FileSystemNode } from "@entities/file/types";

/**
 * Преобразует относительный путь в абсолютный относительно базового пути.
 * Обрабатывает `..` и `.` в пути.
 */
export const resolveRelativePath = (fileName: string, basePath: string): string => {
  if (!fileName || typeof fileName !== "string") {
    throw new TypeError("fileName must be a non-empty string");
  }
  if (!basePath || typeof basePath !== "string") {
    throw new TypeError("basePath must be a non-empty string");
  }

  // Абсолютный путь - возвращаем как есть
  if (fileName.startsWith("/")) {
    return fileName;
  }

  // Разрешаем относительный путь
  const parts = fileName.split("/");
  let resolvedPath = basePath;

  for (const part of parts) {
    if (part === "..") {
      const pathParts = resolvedPath.split("/").filter(p => p);
      if (pathParts.length > 1) {
        pathParts.pop();
        resolvedPath = "/" + pathParts.join("/");
      } else {
        resolvedPath = "/";
      }
    } else if (part !== "." && part !== "") {
      resolvedPath = resolvedPath === "/" ? `/${part}` : `${resolvedPath}/${part}`;
    }
  }

  return resolvedPath;
};

/**
 * Находит файл в файловой системе по имени или пути.
 * Возвращает файл или сообщение об ошибке, если файл не найден.
 */
export const getFileFromPath = (
  fileName: string,
  basePath?: string
): { file?: FileSystemNode; error?: string } => {
  if (!fileName || typeof fileName !== "string") {
    return { error: "Invalid file name: must be a non-empty string" };
  }

  // Проверка на недопустимые символы в имени файла (базовая проверка)
  if (fileName.includes("\0") || fileName.includes("\r") || fileName.includes("\n")) {
    return { error: "Invalid file name: contains illegal characters" };
  }

  const fs = getFileSystem();
  const currentDir = basePath || getCurrentDirectory();
  const filePath = resolveRelativePath(fileName, currentDir);

  if (!fs[filePath]) {
    return { error: `File not found: ${fileName}` };
  }

  return { file: fs[filePath] };
};
