import { getFileSystem, getCurrentDirectory } from "@entities/file/model";
import type { FileSystemNode } from "@entities/file/types";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { resolveRelativePath, getFileFromPath } from "./pathResolver";

vi.mock("@entities/file/model", () => ({
  getFileSystem: vi.fn(),
  getCurrentDirectory: vi.fn(),
}));

describe("resolveRelativePath", () => {
  it("should return absolute path as-is", () => {
    expect(resolveRelativePath("/home/user/file.txt", "/home/user")).toBe("/home/user/file.txt");
  });

  it("should resolve simple relative path", () => {
    expect(resolveRelativePath("file.txt", "/home/user")).toBe("/home/user/file.txt");
  });

  it("should resolve relative path with subdirectory", () => {
    expect(resolveRelativePath("documents/file.txt", "/home/user")).toBe(
      "/home/user/documents/file.txt"
    );
  });

  it("should handle .. (parent directory)", () => {
    expect(resolveRelativePath("../file.txt", "/home/user")).toBe("/home/file.txt");
  });

  it("should handle multiple ..", () => {
    expect(resolveRelativePath("../../file.txt", "/home/user/documents")).toBe("/home/file.txt");
  });

  it("should stop at root with multiple ..", () => {
    expect(resolveRelativePath("../../../file.txt", "/home/user")).toBe("/file.txt");
  });

  it("should handle . (current directory)", () => {
    expect(resolveRelativePath("./file.txt", "/home/user")).toBe("/home/user/file.txt");
  });

  it("should handle multiple .", () => {
    expect(resolveRelativePath("././file.txt", "/home/user")).toBe("/home/user/file.txt");
  });

  it("should handle combined .. and .", () => {
    expect(resolveRelativePath(".././file.txt", "/home/user")).toBe("/home/file.txt");
  });

  it("should handle complex path with .. and subdirectories", () => {
    expect(resolveRelativePath("../documents/file.txt", "/home/user/workspace")).toBe(
      "/home/user/documents/file.txt"
    );
  });

  it("should handle path starting from root", () => {
    expect(resolveRelativePath("file.txt", "/")).toBe("/file.txt");
  });

  it("should handle .. from root", () => {
    expect(resolveRelativePath("../file.txt", "/")).toBe("/file.txt");
  });

  it("should handle empty parts in path", () => {
    expect(resolveRelativePath("dir//file.txt", "/home/user")).toBe("/home/user/dir/file.txt");
  });

  it("should handle path with trailing slash", () => {
    expect(resolveRelativePath("dir/", "/home/user")).toBe("/home/user/dir");
  });

  it("should throw TypeError for empty fileName", () => {
    expect(() => resolveRelativePath("", "/home/user")).toThrow(TypeError);
    expect(() => resolveRelativePath("", "/home/user")).toThrow(
      "fileName must be a non-empty string"
    );
  });

  it("should throw TypeError for empty basePath", () => {
    expect(() => resolveRelativePath("file.txt", "")).toThrow(TypeError);
    expect(() => resolveRelativePath("file.txt", "")).toThrow(
      "basePath must be a non-empty string"
    );
  });

  it("should throw TypeError for non-string fileName", () => {
    expect(() => resolveRelativePath(123 as any, "/home/user")).toThrow(TypeError);
  });

  it("should throw TypeError for non-string basePath", () => {
    expect(() => resolveRelativePath("file.txt", 123 as any)).toThrow(TypeError);
  });

  it("should handle path with multiple directories", () => {
    expect(resolveRelativePath("dir1/dir2/file.txt", "/home/user")).toBe(
      "/home/user/dir1/dir2/file.txt"
    );
  });
});

describe("getFileFromPath", () => {
  const mockFileSystem: Record<string, FileSystemNode> = {
    "/home/user": {
      type: "dir",
      contents: {
        "file.txt": {
          type: "file",
          content: "test content",
        },
        documents: {
          type: "dir",
          contents: {
            "notes.txt": {
              type: "file",
              content: "notes content",
            },
          },
        },
      },
    },
    "/home/user/documents/notes.txt": {
      type: "file",
      content: "notes content",
    },
    "/home/user/file.txt": {
      type: "file",
      content: "test content",
    },
    "/root": {
      type: "dir",
      contents: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentDirectory).mockReturnValue("/home/user");
    vi.mocked(getFileSystem).mockReturnValue(mockFileSystem);
  });

  it("should find file by name in current directory", () => {
    const result = getFileFromPath("file.txt");
    expect(result.file).toBeDefined();
    expect(result.file?.type).toBe("file");
    expect(result.file?.content).toBe("test content");
    expect(result.error).toBeUndefined();
  });

  it("should find file by relative path", () => {
    const result = getFileFromPath("documents/notes.txt");
    expect(result.file).toBeDefined();
    expect(result.file?.type).toBe("file");
    expect(result.error).toBeUndefined();
  });

  it("should find file by absolute path", () => {
    const result = getFileFromPath("/home/user/file.txt");
    expect(result.file).toBeDefined();
    expect(result.file?.type).toBe("file");
    expect(result.error).toBeUndefined();
  });

  it("should find file using basePath parameter", () => {
    const result = getFileFromPath("file.txt", "/home/user");
    expect(result.file).toBeDefined();
    expect(result.file?.type).toBe("file");
    expect(result.error).toBeUndefined();
  });

  it("should return error when file not found", () => {
    const result = getFileFromPath("nonexistent.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("File not found: nonexistent.txt");
  });

  it("should return error when file not found in absolute path", () => {
    const result = getFileFromPath("/nonexistent/file.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("File not found: /nonexistent/file.txt");
  });

  it("should return error for empty fileName", () => {
    const result = getFileFromPath("");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: must be a non-empty string");
  });

  it("should return error for non-string fileName", () => {
    const result = getFileFromPath(123 as any);
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: must be a non-empty string");
  });

  it("should return error for fileName with null character", () => {
    const result = getFileFromPath("file\0.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: contains illegal characters");
  });

  it("should return error for fileName with carriage return", () => {
    const result = getFileFromPath("file\r.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: contains illegal characters");
  });

  it("should return error for fileName with newline", () => {
    const result = getFileFromPath("file\n.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: contains illegal characters");
  });

  it("should handle path with .. correctly", () => {
    vi.mocked(getCurrentDirectory).mockReturnValue("/home/user/documents");
    const result = getFileFromPath("../file.txt");
    expect(result.file).toBeDefined();
    expect(result.file?.type).toBe("file");
    expect(result.error).toBeUndefined();
  });

  it("should handle path with . correctly", () => {
    const result = getFileFromPath("./file.txt");
    expect(result.file).toBeDefined();
    expect(result.file?.type).toBe("file");
    expect(result.error).toBeUndefined();
  });

  it("should use getCurrentDirectory when basePath not provided", () => {
    vi.mocked(getCurrentDirectory).mockReturnValue("/home/user");
    getFileFromPath("file.txt");
    expect(getCurrentDirectory).toHaveBeenCalled();
  });

  it("should not use getCurrentDirectory when basePath provided", () => {
    getFileFromPath("file.txt", "/home/user");
    expect(getFileSystem).toHaveBeenCalled();
  });

  it("should handle file not found in subdirectory", () => {
    const result = getFileFromPath("documents/nonexistent.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("File not found: documents/nonexistent.txt");
  });
});
