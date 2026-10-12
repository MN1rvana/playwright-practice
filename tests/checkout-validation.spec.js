import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("button", { name: "Add Tote bag to cart", exact: true })
    .click();

  await page
    .getByRole("button", { name: "Go to checkout", exact: true })
    .click();
});

test("shows validation errors when required fields are empty", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Place order", exact: true }).click();

  await expect(
    page.getByText("Enter your full name", { exact: true }),
  ).toBeVisible();

  await expect(
    page.getByText("Enter a valid email address", { exact: true }),
  ).toBeVisible();

  await expect(
    page.getByText("Enter a locker code, e.g. WAW01M", { exact: true }),
  ).toBeVisible();

  await expect(page.getByLabel("Full name", { exact: true })).toBeFocused();
});

test("shows an error for an invalid courier postal code", async ({ page }) => {
  await page.getByLabel("Courier", { exact: true }).check();

  await page.getByLabel("Full name", { exact: true }).fill("Anna Kowalska");

  await page.getByLabel("Email", { exact: true }).fill("anna@example.com");

  await page.getByLabel("Street address", { exact: true }).fill("Testowa 10");

  await page.getByLabel("Postal code", { exact: true }).fill("00123");

  await page.getByLabel("City", { exact: true }).fill("Warszawa");

  await page.getByRole("button", { name: "Place order", exact: true }).click();

  await expect(
    page.getByText("Enter a postal code in the format 00-000", { exact: true }),
  ).toBeVisible();

  await expect(page.getByLabel("Postal code", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("shows an error for an invalid email address", async ({ page }) => {
  await page.getByLabel("Full name", { exact: true }).fill("Anna Kowalska");

  await page.getByLabel("Email", { exact: true }).fill("anna@");

  await page.getByLabel("Locker code", { exact: true }).fill("WAW01M");

  await page.getByRole("button", { name: "Place order", exact: true }).click();

  await expect(
    page.getByText("Enter a valid email address", { exact: true }),
  ).toBeVisible();
});
