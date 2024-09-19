const express = require("express");
const router = express.Router();
const passport = require("passport");

const { logonShow, registerShow, registerDo, logoff } = require("../controllers/sessionController");

// Logon Route
router
  .route("/logon")
  .get(logonShow)
  .post(
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/sessions/logon",
      failureFlash: true,
    })
  );

// Register Route
router
  .route("/register")
  .get(registerShow)   // Show the registration form
  .post(registerDo);   // Handle the registration logic

// Logoff Route (if you have this route)
router.route("/logoff").get(logoff);

module.exports = router;