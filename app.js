if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();    
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 5000;

const uri = process.env.ATLASDB_URL;

async function connect() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1); // Exit the application if the connection fails
  }
}

connect();

const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressErrors = require("./utils/ExpressErrors.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const cookieParser = require('cookie-parser');
app.use(cookieParser("secretecode"));

const listingsRouter = require("./routes/listingsRouter.js");
const reviewsRouter = require("./routes/reviewsRouter.js");
const userRouter = require("./routes/userRouter.js");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")))

mongoose.set('debug', true);

const store = MongoStore.create({
    mongoUrl: uri,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Listings
app.use("/listings", listingsRouter);
// Reviews
app.use("/listings/:id/reviews", reviewsRouter);
// User
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    throw new ExpressErrors(404, "Page Not Found!");
});

app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong!" } = err;
    res.status(status).render("error.ejs", { message });
});

app.listen(port, () => {
    console.log("App listening on port " + port);
});
