import { describe, expect, it } from "vitest";
import { isThemePreference, resolveTheme } from "@/lib/theme";

describe("theme helpers", () => {
  it("accepts only supported preferences", () => {
    expect(["light", "dark", "system"].every(isThemePreference)).toBe(true);
    expect(isThemePreference("automatic")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });

  it("resolves explicit preferences independently of the system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("resolves the system preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});
