const config = require("./config");

function resolveLocator(page, selectorConfig) {
  switch (selectorConfig.type) {
    case "placeholder":
      return page.getByPlaceholder(selectorConfig.value);
    case "label":
      return page.getByLabel(selectorConfig.value).first();
    case "role":
      return page.getByRole("button", { name: selectorConfig.value });
    default:
      throw new Error(`Unknown selector type: ${selectorConfig.type}`);
  }
}

async function fillAndSubmit(page) {
  console.log("Attempting to fill form...");

  const emailField = resolveLocator(page, config.SELECTORS.email);
  const firstNameField = resolveLocator(page, config.SELECTORS.firstName);
  const lastNameField = resolveLocator(page, config.SELECTORS.lastName);
  const registerButton = resolveLocator(page, config.SELECTORS.registerButton);

  await emailField.fill(process.env.BPL_EMAIL);
  await firstNameField.fill(process.env.BPL_FIRST_NAME);
  await lastNameField.fill(process.env.BPL_LAST_NAME);
  await registerButton.click();

  await page.waitForTimeout(2000);
  await page.screenshot({ path: "confirmation.png", fullPage: true });

  const bodyText = await page.locator("body").textContent();

  if (/capacity|full|sold out/i.test(bodyText)) {
    console.log("REGISTRATION FAILED: Event appears to be full.");
    return { success: false, reason: "capacity" };
  }

  if (/confirmed|success|thank you|you are registered/i.test(bodyText)) {
    console.log("REGISTRATION CONFIRMED.");
    return { success: true };
  }

  console.log("UNKNOWN OUTCOME — screenshot saved, manual check required.");
  return { success: false, reason: "unknown" };
}

module.exports = { fillAndSubmit };
