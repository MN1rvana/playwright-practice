import { test, expect } from "@playwright/test";

test("shows 6 products", async ({ page }) => {
  await page.goto("/");
  const products = page.getByRole("listitem").filter({
    has: page.getByRole("heading"),
  });

  await expect(products).toHaveCount(6);
});

test("searching for mug shows only Enamel mug", async ({ page }) => {
  await page.goto("/");
  const products = page.getByRole("listitem").filter({
    has: page.getByRole("heading"),
  });

  await expect(products).toHaveCount(6);

  const searchInput = page.getByLabel("Search products");

  await searchInput.fill("mug");

  await expect(products).toHaveCount(1);

  await expect(
    products.getByRole("heading", { name: "Enamel mug", exact: true }),
  ).toBeVisible();
});

test("shows a message when no products match the search", async ({ page }) => {
  await page.goto("/");
  const products = page.getByRole("listitem").filter({
    has: page.getByRole("heading"),
  });

  await expect(products).toHaveCount(6);

  await page.getByLabel("Search products").fill("zzzz-no-such-products");

  await expect(
    page.getByText("No products found", { exact: true }),
  ).toBeVisible();

  await expect(products).toHaveCount(0);
});
