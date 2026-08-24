require("dotenv").config();
const { chromium } = require("playwright");

const URL =
  "https://www.bklynlibrary.org/calendar/babies-books-ages-0-18-brooklyn-heights-library-20260827-1030am";
const POLL_INTERVAL_MS = 5000;
const MAX_WAIT_MINUTES = 25;

async function isRegistrationOpen(page) {
  const bodyText = await page.locator("body").textContent();
  return !bodyText.includes("Registration is coming soon");
}

async function fillAndSubmit(page) {
  console.log("Attempting to fill form...");

  const emailField = page
    .getByLabel(/email/i)
    .or(page.locator('input[type="email"]'));
  const firstNameField = page.getByLabel(/first name/i);
  const lastNameField = page.getByLabel(/last name/i);

  await emailField.fill(process.env.BPL_EMAIL);
  await firstNameField.fill(process.env.BPL_FIRST_NAME);
  await lastNameField.fill(process.env.BPL_LAST_NAME);

  const registerButton = page.getByRole("button", { name: /register/i });
  await registerButton.click();

  await page.waitForTimeout(2000);
  await page.screenshot({ path: "confirmation.png", fullPage: true });
  console.log(
    "Submitted. Screenshot saved as confirmation.png — VERIFY MANUALLY.",
  );
}

async function run() {
  const browser = await chromium.launch({ headless: true }); // MUST be true for Actions
  const page = await browser.newPage();
  await page.goto(URL);

  const startTime = Date.now();
  const maxWaitMs = MAX_WAIT_MINUTES * 60 * 1000;

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const open = await isRegistrationOpen(page);

      if (open) {
        console.log("Registration is OPEN. Attempting to register now.");
        await fillAndSubmit(page);
        break;
      }

      console.log("Still not open. Rechecking in 5s...");
    } catch (err) {
      console.log("Recoverable error, retrying:", err.message);
      await page.screenshot({
        path: `error-${Date.now()}.png`,
        fullPage: true,
      });
    }

    await page.waitForTimeout(POLL_INTERVAL_MS);
    await page.reload().catch(() => {});
  }

  await browser.close();
}

run();
