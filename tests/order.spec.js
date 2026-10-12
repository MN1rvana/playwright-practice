import { test, expect } from "@playwright/test";
import { prepareLockerCheckout } from "./helpers/checkout.js";

test("successfully places an order", async ({ page }) => {
  await page.goto("/");

  await prepareLockerCheckout(page);

  await page.getByRole("button", { name: "Place order", exact: true }).click();

  await expect(
    page.getByRole("heading", {
      name: "Thank you for your order",
      exact: true,
    }),
  ).toBeVisible();

  await expect(page.getByTestId("order-number")).toHaveText(/^ORD-\d+$/);

  await expect(page.getByTestId("cart-count")).toHaveText("0");
});
