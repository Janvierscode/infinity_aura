import { describe, expect, it } from "vitest";
import { isSafeMarkdownUrl, nextVote, readingTime, safeRelativePath, slugify } from "@/lib/ideas";
import { ideaPreviewSchema } from "@/lib/validation/idea";

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
  it("keeps authentication returns on safe local paths", () => {
    expect(safeRelativePath("/ideas/cleanflow-lite#member-content")).toBe("/ideas/cleanflow-lite#member-content");
    expect(safeRelativePath("https://example.com")).toBe("/ideas");
    expect(safeRelativePath("//example.com")).toBe("/ideas");
  });
  it("removes a repeated vote and switches an opposite vote", () => {
    expect(nextVote(1, 1)).toBeNull();
    expect(nextVote(1, -1)).toBe(-1);
    expect(nextVote(null, 1)).toBe(1);
  });
  it("requires a useful administrator-written public preview", () => {
    expect(ideaPreviewSchema.safeParse("Too short").success).toBe(false);
    expect(ideaPreviewSchema.safeParse("A clear preview that explains why this opportunity is worth exploring.").success).toBe(true);
  });
});
