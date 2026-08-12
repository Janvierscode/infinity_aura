import { expect, test } from "@playwright/test";

test("public homepage renders without horizontal overflow", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/Infinity Aura Technologies/);
  await expect(page.getByRole("heading", { name: /Building innovative digital solutions/i })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  expect(consoleErrors).toEqual([]);
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
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: /Connect Supabase|Administrator access/ })).toBeVisible();
});
