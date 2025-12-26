import type { FileSystemNode } from "@entities/file/types";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { validateFileExists, validateFileReadable } from "./fileValidator";

import { getFileFromPath } from "./pathResolver";

vi.mock("./pathResolver", () => ({
  getFileFromPath: vi.fn(),
}));

describe("validateFileExists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return file when file exists", () => {
    const mockFile: FileSystemNode = {
      type: "file",
      content: "test content",
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockFile });

    const result = validateFileExists("file.txt");
    expect(result.file).toBe(mockFile);
    expect(result.error).toBeUndefined();
    expect(getFileFromPath).toHaveBeenCalledWith("file.txt", undefined);
  });

  it("should return error when file does not exist", () => {
    vi.mocked(getFileFromPath).mockReturnValue({
      error: "File not found: file.txt",
    });

    const result = validateFileExists("file.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("File not found: file.txt");
    expect(getFileFromPath).toHaveBeenCalledWith("file.txt", undefined);
  });

  it("should pass basePath to getFileFromPath", () => {
    const mockFile: FileSystemNode = {
      type: "file",
      content: "test content",
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockFile });

    const result = validateFileExists("file.txt", "/home/user");
    expect(result.file).toBe(mockFile);
    expect(getFileFromPath).toHaveBeenCalledWith("file.txt", "/home/user");
  });

  it("should return error for invalid file name", () => {
    vi.mocked(getFileFromPath).mockReturnValue({
      error: "Invalid file name: must be a non-empty string",
    });

    const result = validateFileExists("");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: must be a non-empty string");
  });

  it("should return error for file with illegal characters", () => {
    vi.mocked(getFileFromPath).mockReturnValue({
      error: "Invalid file name: contains illegal characters",
    });

    const result = validateFileExists("file\0.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: contains illegal characters");
  });

  it("should return file when it is a directory", () => {
    const mockDir: FileSystemNode = {
      type: "dir",
      contents: {},
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockDir });

    const result = validateFileExists("directory");
    expect(result.file).toBe(mockDir);
    expect(result.error).toBeUndefined();
  });
});

describe("validateFileReadable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return file when file exists and is readable", () => {
    const mockFile: FileSystemNode = {
      type: "file",
      content: "test content",
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockFile });

    const result = validateFileReadable("file.txt");
    expect(result.file).toBe(mockFile);
    expect(result.error).toBeUndefined();
    expect(getFileFromPath).toHaveBeenCalledWith("file.txt", undefined);
  });

  it("should return error when file does not exist", () => {
    vi.mocked(getFileFromPath).mockReturnValue({
      error: "File not found: file.txt",
    });

    const result = validateFileReadable("file.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("File not found: file.txt");
  });

  it("should return error when file is a directory", () => {
    const mockDir: FileSystemNode = {
      type: "dir",
      contents: {},
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockDir });

    const result = validateFileReadable("directory");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("directory is not a file");
  });

  it("should return error when file has no content", () => {
    const mockFile: FileSystemNode = {
      type: "file",
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockFile });

    const result = validateFileReadable("file.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("file.txt is not a readable file");
  });

  it("should return error when file has empty content string", () => {
    const mockFile: FileSystemNode = {
      type: "file",
      content: "",
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockFile });

    const result = validateFileReadable("file.txt");
    expect(result.file).toBe(mockFile);
    expect(result.error).toBeUndefined();
  });

  it("should pass basePath to getFileFromPath", () => {
    const mockFile: FileSystemNode = {
      type: "file",
      content: "test content",
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockFile });

    const result = validateFileReadable("file.txt", "/home/user");
    expect(result.file).toBe(mockFile);
    expect(getFileFromPath).toHaveBeenCalledWith("file.txt", "/home/user");
  });

  it("should return error for invalid file name", () => {
    vi.mocked(getFileFromPath).mockReturnValue({
      error: "Invalid file name: must be a non-empty string",
    });

    const result = validateFileReadable("");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: must be a non-empty string");
  });

  it("should return error for file with illegal characters", () => {
    vi.mocked(getFileFromPath).mockReturnValue({
      error: "Invalid file name: contains illegal characters",
    });

    const result = validateFileReadable("file\n.txt");
    expect(result.file).toBeUndefined();
    expect(result.error).toBe("Invalid file name: contains illegal characters");
  });

  it("should handle file with multiline content", () => {
    const mockFile: FileSystemNode = {
      type: "file",
      content: "line 1\nline 2\nline 3",
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockFile });

    const result = validateFileReadable("file.txt");
    expect(result.file).toBe(mockFile);
    expect(result.error).toBeUndefined();
  });

  it("should handle file with special characters in content", () => {
    const mockFile: FileSystemNode = {
      type: "file",
      content: "content with \t tabs and \r\n newlines",
    };

    vi.mocked(getFileFromPath).mockReturnValue({ file: mockFile });

    const result = validateFileReadable("file.txt");
    expect(result.file).toBe(mockFile);
    expect(result.error).toBeUndefined();
  });
});
