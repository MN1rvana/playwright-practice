import { test, expect } from '@playwright/test';

test('add Hoodie and Tote bag to the cart', async ({ page}) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Add Hoodie to cart' }).click();
    await page.getByRole('button', {name: 'Add Tote bag to cart'}).click();

    await expect(page.getByTestId('cart-count')).toHaveText('2');

    await expect(page.getByTestId('cart-total')).toHaveText('188,00 zł');
});

test('increases the quantity of Tote bag', async( {page }) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Add Tote bag to cart'}).click();

    await page.getByRole('button', {name: 'Increase quantity of Tote bag'}).click();

    await expect(page.getByLabel('Quantity of Tote bag', { exact: true })).toHaveText('2');

    await expect (page.getByTestId('cart-total')).toHaveText('78,00 zł');
})

test('shows an empty cart after removing all items', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Add Hoodie to cart'}).click();

    await page.getByRole('button', {name: 'Add Tote bag to cart'}).click();

    await page.getByRole('button', {name: 'Remove Hoodie', exact: true }).click();

    await page.getByRole('button', {name: 'Remove Tote bag', exact: true}).click();

    await expect(page.getByText('Your cart is empty', {exact: true})).toBeVisible();

    await expect (page.getByRole('button', {name: 'Go to checkout', exact: true })).toBeDisabled();
})

test('disable decrease when the quantity is 1', async ({ page}) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Add Tote bag to cart', exact: true}).click();

    await expect(page.getByRole('button', {name: 'Decrease quantity of Tote bag', exact: true})).toBeDisabled();
})