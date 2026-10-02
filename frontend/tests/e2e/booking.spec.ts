import { expect, test } from "@playwright/test";

/*
 * A client books online, then cancels through their private link, so every
 * run cleans up after itself. Needs the site and the API running.
 */

// A different phone each run, so the "3 requests waiting" limit never trips.
const phone = () => `+383 44 ${String(Math.floor(Math.random() * 1e6)).padStart(6, "0")}`;

// Each run looks like a different visitor, so repeated test runs don't hit the
// site's "10 booking attempts per hour" limit. (On Vercel this header is set by
// Vercel itself and can't be faked.)
test.beforeEach(async ({ page }) => {
  const visitor = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  await page.setExtraHTTPHeaders({ "X-Forwarded-For": visitor });
});

test("book an appointment, then cancel it from the private link", async ({ page }) => {
  await page.goto("/sq/book");

  // 1 · Service
  await page.getByRole("button", { name: "Flokë", exact: true }).click();
  await page.getByText("Fëno", { exact: true }).click();
  await expect(page.getByRole("checkbox", { name: /Fëno/ })).toBeChecked();
  await page.getByRole("button", { name: "Vazhdo" }).click();

  // 2 · Date and time, next month: well before the online cancellation
  // deadline, so the test can cancel it again at the end.
  await expect(page.getByRole("heading", { name: "Zgjidhni datën dhe orën" })).toBeVisible();
  await page.getByRole("button", { name: "Muaji tjetër" }).click();
  const days = page.locator("button[aria-pressed]:not([disabled])");
  await expect(days.first()).toBeVisible();
  let chosen = false;
  for (let index = 0; index < (await days.count()) && !chosen; index++) {
    await days.nth(index).click();
    // Tap the visible time, like a visitor; the radio inside is hidden.
    const freeTime = page.locator('label:has(input[name="time"])').first();
    if ((await freeTime.count()) > 0) {
      await freeTime.click();
      await expect(freeTime.locator("input")).toBeChecked();
      chosen = true;
    }
  }
  expect(chosen, "a free time within the first month").toBe(true);
  await page.getByRole("button", { name: "Vazhdo" }).click();

  // 3 · Details
  await page.getByLabel("Emri dhe mbiemri").fill("Test Automatik");
  await page.getByLabel("Telefoni").fill(phone());
  await page.getByLabel("Email").fill("test@example.test");
  await page.getByRole("button", { name: "Vazhdo" }).click();

  // 4 · Review and send
  await expect(page.getByRole("heading", { name: "Konfirmoni kërkesën" })).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: "Fëno" })).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Kërko terminin" }).click();
  await expect(page.getByRole("heading", { name: /Faleminderit/ })).toBeVisible();

  // The private link shows the request, and cancelling works.
  await page.getByRole("link", { name: "Menaxho rezervimin" }).click();
  await expect(page.getByRole("heading", { name: "Në pritje të konfirmimit" })).toBeVisible();
  await page.getByRole("button", { name: "Anulo terminin" }).click();
  await page.getByRole("button", { name: "Po, anuloje" }).click();
  await expect(page.getByRole("heading", { name: "I anuluar" })).toBeVisible();
});

test("a step can't be skipped without choosing", async ({ page }) => {
  await page.goto("/sq/book");
  await page.getByRole("button", { name: "Vazhdo" }).click();
  await expect(page.getByText("Ju lutemi zgjidhni një shërbim.")).toBeVisible();
});
