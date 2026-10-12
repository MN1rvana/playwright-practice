import { test, expect } from '@playwright/test';

test(' successfully place an order', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', {name: 'Add Tote bag to cart', exact: true}).click();

    await page.getByRole('button', {name: 'Go to checkout', exact: true}).click();

    await page.getByLabel('Full name', {exact: true}).fill('Anna Kowalska');

    await page.getByLabel('Email', { exact: true}).fill('anna@example.com');

    await page.getByLabel('Locker code', {exact: true}).fill('waw01m');

    await page.getByRole('button', {name: 'Place order', exact: true}).click();

    await expect(page.getByRole('heading', {name: 'Thank you for your order', exact: true})).toBeVisible();

    await expect(page.getByTestId('order-number')).toHaveText(/^ORD-\d+$/);

    await expect(page.getByTestId('cart-count')).toHaveText('0');
})