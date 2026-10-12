# Playwright Practice: Mini Shop

I used this small shop to practice writing end-to-end tests with JavaScript and
[Playwright](https://playwright.dev). The tests cover product search, the shopping
cart, checkout validation, successful orders, and API error handling.

The practice app uses HTML and JavaScript in `public/` and a local Node.js server
in `server.mjs`. Its API simulates a shop; it does not process real purchases.

## Test coverage

There are 14 tests across five files. The current configuration runs them in Chromium.

| File | Tests | What it checks |
| --- | --- | --- |
| `tests/products.spec.js` | 3 | The shop displays six products; searching for `mug` leaves only Enamel mug; an unknown search shows an empty list and a message. |
| `tests/cart.spec.js` | 4 | Adding products updates the counter and total; increasing quantity updates the quantity and total; removing all products shows the empty-cart message and disables checkout; decreasing quantity is disabled at one item. |
| `tests/checkout-validation.spec.js` | 3 | An empty form shows required-field errors and focuses Full name; an invalid courier postal code shows an error and sets `aria-invalid`; an invalid email shows an error. |
| `tests/order.spec.js` | 1 | A valid order with a lowercase locker code shows confirmation, an order number matching `ORD-` followed by digits, and a cart counter of zero. |
| `tests/api-errors.spec.js` | 3 | A mocked order error (500) shows a message, keeps the cart counter at one, and re-enables Place order; a product-loading error (503) shows a message; the outgoing order request contains an uppercase locker code and one Tote bag. |

## Run locally

Install Node.js and npm. The GitHub Actions workflow uses Node.js 22.
From the project folder, install the dependencies and browser:

```bash
npm ci
npx playwright install chromium
```

Run all tests:

```bash
npm test
```

Playwright starts the local shop automatically using the `webServer` setting in
`playwright.config.js`. The base URL is `http://localhost:5173`.

Other useful commands:

```bash
npx playwright test tests/cart.spec.js   # Run one test file
npm run test:ui                         # Explore tests in UI mode
npm run test:headed                     # Run with a visible browser
npm run report                         # Open the latest HTML report
npx playwright test --repeat-each=3     # Repeat every test three times
```

## What I learned

- How to separate test preparation, actions, and assertions, and keep tests
  independent. I used `test.beforeEach` for repeated checkout preparation.
- How to choose locators based on roles, labels, visible text, and test IDs.
  `getByText` searches displayed text, while `getByTestId` uses `data-testid`.
- How to fix a strict-mode error when a locator matches several elements.
  For example, `exact: true` distinguishes a quantity label from the labels on
  its increase and decrease buttons.
- How to choose assertions: `toHaveCount` checks the number of matching elements,
  while `toHaveText` checks their text. I also checked visibility, focus,
  enabled/disabled states, and HTML attributes.
- How Playwright's retrying locator assertions wait for the expected state,
  without adding fixed delays with `waitForTimeout`.
- How to use a regular expression for an order number that changes between runs.
- How to simulate API failures with `page.route` and `route.fulfill`, and check
  how the page handles them.
- How to start `page.waitForRequest` before clicking Place order, read the request
  with `postDataJSON`, and check its values with `toBe` and `toEqual`.
- How to configure a GitHub Actions workflow to install dependencies and a browser,
  run the tests, and save the HTML report.

## GitHub Actions

The workflow in `.github/workflows/playwright.yml` is configured to run on each
push. It uses Ubuntu and Node.js 22, installs npm dependencies and Chromium with
its system dependencies, and runs `npm test`.

It also uploads `playwright-report/` as an artifact named `playwright-report`
for seven days, including when tests fail, unless the run is cancelled.
After pushing the repository to GitHub, check the **Actions** tab for the actual
run result and the downloadable report.
