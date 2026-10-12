// Prepare a valid locker order; each test controls when to submit it.
export async function prepareLockerCheckout(page) {
  await page
    .getByRole("button", {
      name: "Add Tote bag to cart",
      exact: true,
    })
    .click();

  await page
    .getByRole("button", {
      name: "Go to checkout",
      exact: true,
    })
    .click();

  await page.getByLabel("Full name", { exact: true }).fill("Anna Kowalska");
  await page.getByLabel("Email", { exact: true }).fill("anna@example.com");
  await page.getByLabel("Locker code", { exact: true }).fill("waw01m");
}
