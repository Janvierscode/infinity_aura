import { describe, expect, it } from "vitest";
import { isSafeMarkdownUrl, readingTime, slugify } from "@/lib/ideas";

describe("business idea helpers", () => {
  it("calculates a minimum one-minute reading time", () => expect(readingTime("A short business idea.")).toBe(1));
  it("rounds reading time up at 200 words per minute", () => expect(readingTime(Array(201).fill("word").join(" "))).toBe(2));
  it("creates URL-safe slugs", () => expect(slugify("AI & Digital Progress! ")).toBe("ai-digital-progress"));
  it("allows secure links and rejects dangerous protocols", () => {
    expect(isSafeMarkdownUrl("https://example.com")).toBe(true);
    expect(isSafeMarkdownUrl("/about")).toBe(true);
    expect(isSafeMarkdownUrl("javascript:alert(1)")).toBe(false);
  });
  it("requires HTTPS for inline images", () => {
    expect(isSafeMarkdownUrl("https://example.com/image.jpg", true)).toBe(true);
    expect(isSafeMarkdownUrl("http://example.com/image.jpg", true)).toBe(false);
    expect(isSafeMarkdownUrl("/image.jpg", true)).toBe(false);
  });
});
