import { describe, it, expect } from "vitest";

import * as config from "./index";

describe("shared/config/index", () => {
  it("should export themes", () => {
    expect(config).toHaveProperty("getASCIILogo");
    expect(config).toHaveProperty("THEMES");
    expect(config).toHaveProperty("DEFAULT_THEME");
  });

  it("should export commands", () => {
    expect(config).toHaveProperty("AVAILABLE_COMMANDS");
    expect(config).toHaveProperty("SPECIAL_COMMANDS");
    expect(config).toHaveProperty("MUSIC_PLAYER_COMMANDS");
  });

  it("should export virus config", () => {
    expect(config).toBeDefined();
  });
});
