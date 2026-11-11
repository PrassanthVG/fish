import { test, expect } from "@playwright/test";

test("homepage loads and clearly discloses it is a demo, not a real brand", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Visitor Analytics Demo")).toBeVisible();
  await expect(page.getByText(/not Microsoft, Google, or any other company/)).toBeVisible();
});

test("visit is recorded and IP-derived location is shown (approximate)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/IP-derived \(approximate\) location/)).toBeVisible({ timeout: 10000 });
});

test("GPS permission denied is recorded and shown honestly", async ({ page, context }) => {
  // No permission granted -> browser auto-denies in headless mode.
  await page.goto("/");
  await page.getByRole("button", { name: /Share my precise GPS location/i }).click();
  await expect(page.getByText(/GPS permission denied/)).toBeVisible({ timeout: 10000 });
});

test("GPS permission granted flow records coordinates", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
  await page.goto("/");
  await page.getByRole("button", { name: /Share my precise GPS location/i }).click();
  await expect(page.getByText(/GPS permission granted/)).toBeVisible({ timeout: 10000 });
});

test("admin dashboard is protected and rejects bad login", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.getByLabel("Email").fill("wrong@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: /Sign in/i }).click();
  await expect(page.getByText(/Invalid credentials/)).toBeVisible();
});

test("admin can log in with seeded credentials and see the dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("test-password-123");
  await page.getByRole("button", { name: /Sign in/i }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByText("Visitor Dashboard")).toBeVisible();
  await expect(page.getByText("Total visits")).toBeVisible();
});
