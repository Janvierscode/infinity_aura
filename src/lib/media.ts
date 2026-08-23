const canonicalHost = "www.infinityaura.tech";

/** Serve versioned canonical assets from the current deployment in local and preview builds. */
export function resolveMediaSource(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === canonicalHost
      ? `${url.pathname}${url.search}`
      : value;
  } catch {
    return value;
  }
}
