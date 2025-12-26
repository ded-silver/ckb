import { describe, it, expect } from "vitest";

import {
  parseCommandArgs,
  getPositionalArg,
  getOptionValue,
  getFirstPositionalArg,
  hasOption,
} from "./commandArgs";

describe("parseCommandArgs", () => {
  it("should parse empty array", () => {
    const result = parseCommandArgs([]);
    expect(result.options.size).toBe(0);
    expect(result.positional).toEqual([]);
  });

  it("should parse undefined as empty", () => {
    const result = parseCommandArgs(undefined);
    expect(result.options.size).toBe(0);
    expect(result.positional).toEqual([]);
  });

  it("should parse only positional arguments", () => {
    const result = parseCommandArgs(["file1", "file2"]);
    expect(result.positional).toEqual(["file1", "file2"]);
    expect(result.options.size).toBe(0);
  });

  it("should parse only short options", () => {
    const result = parseCommandArgs(["-a", "-b"]);
    expect(result.options.has("a")).toBe(true);
    expect(result.options.has("b")).toBe(true);
    expect(result.positional).toEqual([]);
  });

  it("should parse only long options", () => {
    const result = parseCommandArgs(["--long", "--verbose"]);
    expect(result.options.has("long")).toBe(true);
    expect(result.options.has("verbose")).toBe(true);
    expect(result.positional).toEqual([]);
  });

  it("should parse mixed short and long options", () => {
    const result = parseCommandArgs(["-a", "--long", "-b"]);
    expect(result.options.has("a")).toBe(true);
    expect(result.options.has("long")).toBe(true);
    expect(result.options.has("b")).toBe(true);
    expect(result.positional).toEqual([]);
  });

  it("should parse mixed arguments and options", () => {
    const result = parseCommandArgs(["-a", "file1", "--long", "file2"]);
    expect(result.options.has("a")).toBe(true);
    expect(result.options.has("long")).toBe(true);
    expect(result.positional).toEqual(["file1", "file2"]);
  });

  it("should throw TypeError on invalid input (not array)", () => {
    expect(() => parseCommandArgs("not-array" as any)).toThrow(TypeError);
    expect(() => parseCommandArgs("not-array" as any)).toThrow("args must be an array");
  });

  it("should handle options with single dash", () => {
    const result = parseCommandArgs(["-a"]);
    expect(result.options.has("a")).toBe(true);
  });

  it("should handle options with double dash", () => {
    const result = parseCommandArgs(["--long"]);
    expect(result.options.has("long")).toBe(true);
  });

  it("should remove dashes from option names", () => {
    const result = parseCommandArgs(["-a", "--long"]);
    expect(result.options.has("a")).toBe(true);
    expect(result.options.has("long")).toBe(true);
    expect(result.options.has("-a")).toBe(false);
    expect(result.options.has("--long")).toBe(false);
  });
});

describe("getPositionalArg", () => {
  it("should get positional argument by index", () => {
    const args = ["file1", "file2", "file3"];
    expect(getPositionalArg(args, 0)).toBe("file1");
    expect(getPositionalArg(args, 1)).toBe("file2");
    expect(getPositionalArg(args, 2)).toBe("file3");
  });

  it("should ignore options when getting positional args", () => {
    const args = ["-a", "file1", "--long", "file2"];
    expect(getPositionalArg(args, 0)).toBe("file1");
    expect(getPositionalArg(args, 1)).toBe("file2");
  });

  it("should return undefined for index out of range", () => {
    const args = ["file1"];
    expect(getPositionalArg(args, 1)).toBeUndefined();
    expect(getPositionalArg(args, 10)).toBeUndefined();
  });

  it("should return undefined for empty array", () => {
    expect(getPositionalArg([], 0)).toBeUndefined();
  });

  it("should throw TypeError when args is not an array", () => {
    expect(() => getPositionalArg("not-array" as any, 0)).toThrow(TypeError);
    expect(() => getPositionalArg("not-array" as any, 0)).toThrow("args must be an array");
  });

  it("should throw TypeError for invalid index (negative)", () => {
    expect(() => getPositionalArg(["file1"], -1)).toThrow(TypeError);
    expect(() => getPositionalArg(["file1"], -1)).toThrow("index must be a non-negative integer");
  });

  it("should throw TypeError for invalid index (not integer)", () => {
    expect(() => getPositionalArg(["file1"], 1.5)).toThrow(TypeError);
    expect(() => getPositionalArg(["file1"], 1.5)).toThrow("index must be a non-negative integer");
  });

  it("should throw TypeError for invalid index (not number)", () => {
    expect(() => getPositionalArg(["file1"], "0" as any)).toThrow(TypeError);
  });
});

describe("getOptionValue", () => {
  it("should get value for short option", () => {
    const args = ["-o", "file.txt"];
    expect(getOptionValue(args, "o")).toBe("file.txt");
  });

  it("should get value for long option", () => {
    const args = ["--output", "file.txt"];
    expect(getOptionValue(args, "output")).toBe("file.txt");
  });

  it("should return undefined when option has no value", () => {
    const args = ["-a"];
    expect(getOptionValue(args, "a")).toBeUndefined();
  });

  it("should return undefined when next arg is an option", () => {
    const args = ["-o", "-a"];
    expect(getOptionValue(args, "o")).toBeUndefined();
  });

  it("should return undefined when option is not found", () => {
    const args = ["-a", "file.txt"];
    expect(getOptionValue(args, "b")).toBeUndefined();
  });

  it("should get value when option appears multiple times (first occurrence)", () => {
    const args = ["-o", "file1.txt", "-o", "file2.txt"];
    expect(getOptionValue(args, "o")).toBe("file1.txt");
  });

  it("should handle option at the end of args", () => {
    const args = ["-o"];
    expect(getOptionValue(args, "o")).toBeUndefined();
  });

  it("should throw TypeError when args is not an array", () => {
    expect(() => getOptionValue("not-array" as any, "o")).toThrow(TypeError);
    expect(() => getOptionValue("not-array" as any, "o")).toThrow("args must be an array");
  });

  it("should throw TypeError when optionName is empty", () => {
    expect(() => getOptionValue(["-o", "file.txt"], "")).toThrow(TypeError);
    expect(() => getOptionValue(["-o", "file.txt"], "")).toThrow(
      "optionName must be a non-empty string"
    );
  });

  it("should throw TypeError when optionName is not a string", () => {
    expect(() => getOptionValue(["-o", "file.txt"], 123 as any)).toThrow(TypeError);
  });
});

describe("getFirstPositionalArg", () => {
  it("should get first positional argument", () => {
    const args = ["file1", "file2"];
    expect(getFirstPositionalArg(args)).toBe("file1");
  });

  it("should ignore options when getting first positional arg", () => {
    const args = ["-a", "--long", "file1"];
    expect(getFirstPositionalArg(args)).toBe("file1");
  });

  it("should return undefined for empty array", () => {
    expect(getFirstPositionalArg([])).toBeUndefined();
  });

  it("should return undefined when only options present", () => {
    const args = ["-a", "--long"];
    expect(getFirstPositionalArg(args)).toBeUndefined();
  });

  it("should throw TypeError when args is not an array", () => {
    expect(() => getFirstPositionalArg("not-array" as any)).toThrow(TypeError);
    expect(() => getFirstPositionalArg("not-array" as any)).toThrow("args must be an array");
  });
});

describe("hasOption", () => {
  it("should return true when option exists", () => {
    const options = new Set(["a", "b", "long"]);
    expect(hasOption(options, "a")).toBe(true);
    expect(hasOption(options, "b")).toBe(true);
    expect(hasOption(options, "long")).toBe(true);
  });

  it("should return false when option does not exist", () => {
    const options = new Set(["a", "b"]);
    expect(hasOption(options, "c")).toBe(false);
  });

  it("should return true when at least one option exists (multiple names)", () => {
    const options = new Set(["a", "b"]);
    expect(hasOption(options, "c", "a", "d")).toBe(true);
  });

  it("should return false when none of the options exist", () => {
    const options = new Set(["a", "b"]);
    expect(hasOption(options, "c", "d")).toBe(false);
  });

  it("should return false for empty options set", () => {
    const options = new Set<string>();
    expect(hasOption(options, "a")).toBe(false);
  });

  it("should handle single option check", () => {
    const options = new Set(["verbose"]);
    expect(hasOption(options, "verbose")).toBe(true);
    expect(hasOption(options, "quiet")).toBe(false);
  });
});
