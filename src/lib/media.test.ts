import { describe, expect, it } from "vitest";
import { resolveMediaSource } from "@/lib/media";

describe("public media helpers", () => {
  it("serves canonical versioned assets from the current deployment", () => {
    expect(resolveMediaSource("https://www.infinityaura.tech/media/ideas/example.webp")).toBe("/media/ideas/example.webp");
  });

  it("leaves external and relative media sources unchanged", () => {
    expect(resolveMediaSource("https://project.supabase.co/storage/v1/object/public/media/example.webp")).toBe("https://project.supabase.co/storage/v1/object/public/media/example.webp");
    expect(resolveMediaSource("/brand/logo.jpg")).toBe("/brand/logo.jpg");
  });
});
