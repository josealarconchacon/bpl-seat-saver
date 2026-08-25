const config = require("./config");

// checks whether registration is currently open on the given page.
async function isRegistrationOpen(page) {
  const bodyText = await page.locator("body").textContent();
  return !bodyText.includes(config.NOT_OPEN_TEXT);
}

module.exports = { isRegistrationOpen };
