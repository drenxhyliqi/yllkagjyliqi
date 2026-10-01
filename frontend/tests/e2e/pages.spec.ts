import { expect, test } from "@playwright/test";

const pages = ["/sq", "/en", "/sq/services", "/sq/prices", "/sq/work", "/sq/about", "/sq/contact", "/sq/book", "/sq/privacy"];

for (const path of pages) {
  test(`${path} loads with a heading and no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeAttached();
    expect(errors).toEqual([]);
  });
}

test("an unknown booking link is a real 404", async ({ page }) => {
  const response = await page.goto("/sq/booking/not-a-real-token-at-all");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Rezervimi nuk u gjet" })).toBeVisible();
});

test("the admin asks to sign in", async ({ page }) => {
  await page.goto("/admin/bookings");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("link", { name: "Keni harruar fjalëkalimin?" })).toBeVisible();
});

test("search engines get a sitemap and robots rules", async ({ request }) => {
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
});
