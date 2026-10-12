import { test, expect } from '@playwright/test';

test('keeps the cart when placing an order fails', async ({page}) => {
    await page.route('**/api/orders', async(route) => {
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({error: 'Internal server error'}),
        });
    });

    await page.goto('/');

    await page.getByRole('button', {name: 'Add Tote bag to cart', exact: true}).click();

    await page.getByRole('button', {name: 'Go to checkout', exact: true}).click();

    await page.getByLabel('Full name', {exact: true}).fill('Anna Kowalska');

    await page.getByLabel('Email', { exact: true}).fill('anna@example.com');

    await page.getByLabel('Locker code', {exact: true}).fill('waw01m');

    await page.getByRole('button', {name: 'Place order', exact: true}).click();

    await expect(page.getByText('Something went wrong. Your order was not placed. Please try again.', { exact: true})).toBeVisible();

    await expect(page.getByTestId('cart-count')).toHaveText('1');

    await expect(page.getByRole('button', {name: 'Place order', exact: true})).toBeEnabled();
});

test('shows an error when products cannot be loaded', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
        await route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Service unavailable'}),
        });
    });
    await page.goto('/');

    await expect(page.getByText('Could not load products. Please refresh the page.',
        { exact: true })).toBeVisible();

});

test('sends the correct locker code and items when placing an order', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Add Tote bag to cart', exact: true }).click();

    await page.getByRole('button', {name: 'Go to checkout', exact: true}).click();

    await page.getByLabel('Full name', {exact: true}).fill('Anna Kowalska');

    await page.getByLabel('Email', { exact: true}).fill('anna@example.com');

    await page.getByLabel('Locker code', {exact: true}).fill('waw01m');

    const requestPromise = page.waitForRequest(
        request =>
            new URL(request.url()).pathname === '/api/orders' && request.method() === 'POST'
    );

    await page.getByRole('button', {name: 'Place order', exact: true}).click();

    const request = await requestPromise;

    const body = request.postDataJSON();

    expect(body.delivery.lockerCode).toBe('WAW01M');

    expect(body.items).toEqual([
        { id: 'tote', qty: 1 },
    ]);

})