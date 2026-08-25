require("dotenv").config();
const { chromium } = require("playwright");
const config = require("./src/config");
const { isRegistrationOpen } = require("./src/detector");
const { fillAndSubmit } = require("./src/registrar");

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(config.URL, { timeout: 60000 }); // give it more room, 60s instead of default 30s
  } catch (err) {
    console.log("FATAL: could not load registration page:", err.message);
    await browser.close();
    process.exit(1);
  }

  const startTime = Date.now();
  const maxWaitMs = config.MAX_WAIT_MINUTES * 60 * 1000;

  try {
    while (Date.now() - startTime < maxWaitMs) {
      try {
        const open = await isRegistrationOpen(page);

        if (open) {
          console.log("Registration is OPEN. Attempting to register now.");
          const result = await fillAndSubmit(page);

          if (result.success) {
            console.log("SUCCESS — registered.");
          } else {
            console.log(`FAILURE — ${result.reason}. Check confirmation.png.`);
          }
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

      await page.waitForTimeout(config.POLL_INTERVAL_MS);
      await page.reload().catch(() => {});
    }
  } finally {
    await browser.close();
  }
}

run();
