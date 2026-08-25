module.exports = {
  // class registration page — date must be updated weekly for now
  URL: "https://www.bklynlibrary.org/calendar/babies-books-ages-0-18-brooklyn-heights-library-20260827-1030am",

  // polling behavior
  POLL_INTERVAL_MS: 5000,
  MAX_WAIT_MINUTES: 25,

  // text used to detect the "not yet open" state
  NOT_OPEN_TEXT: "Registration is coming soon",

  // form selectors — fixed based on real form structure we observed
  SELECTORS: {
    email: { type: "placeholder", value: "Your Email" },
    firstName: { type: "label", value: /first name/i },
    lastName: { type: "label", value: /last name/i },
    registerButton: { type: "role", value: /register/i },
  },
};
