import { expect, test } from "@playwright/test";

const themeKey = "infinity-aura-theme";

async function openMobileNavigation(page: import("@playwright/test").Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: "Open navigation menu" }).click();
}

test("public homepage renders without horizontal overflow", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/Infinity Aura Technologies/);
  await expect(page.getByRole("heading", { name: /Find a business idea worth building/i })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  expect(consoleErrors).toEqual([]);
});

test("homepage contains the five focused public sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main > section")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: /Start with an opportunity you can understand/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /When an idea needs the right technology/i })).toBeVisible();
});

test("theme chooser persists explicit light and dark preferences", async ({ page, isMobile }) => {
  await page.goto("/");
  await openMobileNavigation(page, isMobile);
  const trigger = page.getByRole("button", { name: "Theme: system" });
  await trigger.click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await openMobileNavigation(page, isMobile);
  await expect(page.getByRole("button", { name: "Theme: dark" })).toBeVisible();

  await page.getByRole("button", { name: "Theme: dark" }).click();
  await page.getByRole("menuitemradio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.evaluate((key) => localStorage.getItem(key), themeKey)).resolves.toBe("light");
});

test("system theme follows live operating-system changes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript((key) => localStorage.setItem(key, "system"), themeKey);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("saved dark theme is applied before hydration without console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.addInitScript((key) => localStorage.setItem(key, "dark"), themeKey);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".futuristic-hero")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("light and dark themes render the same branded hero content", async ({ page }) => {
  for (const theme of ["light", "dark"] as const) {
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [themeKey, theme]);
    await page.goto("/");
    await expect(page.locator(".futuristic-hero")).toBeVisible();
    await expect(page.locator(".hero-grid")).toBeVisible();
    await expect(page.locator(".capability-row")).toContainText("Discover");
    await expect(page.locator(".capability-row")).toContainText("Discuss");
    await expect(page.locator(".code-window")).toContainText("build.ts");
  }
});

test("public themes have no horizontal overflow at target widths", async ({ page }) => {
  for (const theme of ["light", "dark"] as const) {
    await page.goto("/");
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [themeKey, theme]);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(dimensions.scroll, `${theme} theme overflowed at ${width}px`).toBe(dimensions.client);
    }
  }
});

test("business idea filtering handles an invalid category", async ({ page }) => {
  await page.goto("/ideas?category=does-not-exist");
  await expect(page.getByRole("heading", { name: "Category not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View all ideas" })).toBeVisible();
});

test("business ideas display loaded cover images in catalogue and detail views", async ({ page }) => {
  await page.goto("/ideas");
  const cards = page.locator(".idea-card");
  await expect(cards.first()).toBeVisible();
  await expect(cards.locator(".public-media img")).toHaveCount(await cards.count());
  for (const image of await cards.locator(".public-media img").all()) {
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }

  await page.goto("/ideas/cleanflow-lite");
  const cover = page.locator(".idea-detail-hero .public-media img");
  await expect(cover).toBeVisible();
  await expect.poll(() => cover.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
});

test("retired blog routes permanently redirect to business ideas", async ({ request }) => {
  const index = await request.get("/blog", { maxRedirects: 0 });
  expect(index.status()).toBe(308);
  expect(index.headers().location).toBe("/ideas");
  const detail = await request.get("/blog/old-article", { maxRedirects: 0 });
  expect(detail.status()).toBe(308);
  expect(detail.headers().location).toBe("/ideas/old-article");
});

test("member account screens support email sign-in and recovery", async ({ page }) => {
  await page.goto("/account/login");
  await expect(page.getByRole("heading", { name: /Sign in to continue/i })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot your password?" })).toBeVisible();
  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page.getByRole("heading", { name: "Create your free account." })).toBeVisible();
  await expect(page.getByLabel("Display name")).toBeVisible();
});

test("published idea exposes a preview and gates the complete guide", async ({ page }) => {
  const response = await page.goto("/ideas/cleanflow-lite");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "CleanFlow Lite" })).toBeVisible();
  await expect(page.getByText("Sign in to continue reading.")).toBeVisible();
  await expect(page.getByText("Opportunity score")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue reading" }).click();
  const dialog = page.getByRole("dialog", { name: "Continue with a free account." });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", /next=%2Fideas%2Fcleanflow-lite%23member-content/);
});

test("anonymous idea responses never contain protected guide content", async ({ request }) => {
  const response = await request.get("/ideas/cleanflow-lite");
  expect(response.status()).toBe(200);
  expect(await response.text()).not.toContain("Opportunity score");
});

test("retired solution routes permanently redirect to services", async ({ request }) => {
  for (const path of ["/solutions", "/solutions/old-product"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("/services");
  }
});

test("mobile navigation opens, remains accessible, and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile behavior is covered by the phone project.");
  await page.goto("/");

  const trigger = page.locator(".menu-button");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
});

test("contact form validates in place without opening an email client", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Full name *").fill("J");
  await page.getByLabel("Email address *").fill("not-an-email");
  await page.getByLabel("Message *").fill("Short");
  await page.getByRole("button", { name: /Send message/i }).click();
  await expect(page.getByText("Please correct the highlighted fields.")).toBeVisible();
  await expect(page).toHaveURL(/\/contact$/);
});

test("unauthenticated admin requests are redirected to login", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "dark"), themeKey);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("heading", { name: /Connect Supabase|Administrator access/ })).toBeVisible();
});
