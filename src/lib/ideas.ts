export function readingTime(markdown: string) {
  const words = markdown.replace(/[`#>*_\[\]()!-]/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function isSafeMarkdownUrl(value: string | undefined, image = false) {
  if (!value) return false;
  if (value.startsWith("/")) return !image;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeRelativePath(value: string | undefined, fallback = "/ideas") {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function nextVote(existing: -1 | 1 | null, requested: -1 | 1) {
  return existing === requested ? null : requested;
}
