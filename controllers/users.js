const User = require("../models/user.js");

const signupGet = (req, res) => {
    res.render("users/signup.ejs");
}

const signupPost = async (req, res) => {
    try {
        let {username, email, password} = req.body;
        const newUser = new User({username, email});
        const registeredUser = await User.register(newUser, password);
        
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (error) {
        req.flash("error", "User already exists!");
        res.redirect("/signup");
    }
}

const loginGet = (req, res) => {
    res.render("users/login.ejs");
}

const loginPost = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
}

module.exports = { signupGet, signupPost, loginGet, loginPost, logout };