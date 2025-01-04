const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.signupGet)               // Signup - get route
    .post(wrapAsync(userController.signupPost)); // Signup - post route

router
    .route("/login")
    .get(userController.loginGet) // Login - get route
    .post(                        // Login - post route
        saveRedirectUrl,
        passport.authenticate('local', {failureRedirect: "/login", failureFlash: true}), 
        userController.loginPost
    );

// Logout - get route
router.get("/logout", userController.logout);

module.exports = router;