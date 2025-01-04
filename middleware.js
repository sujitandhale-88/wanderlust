const Listing = require("./models/listing");
const Review = require("./models/reviews.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressErrors = require("./utils/ExpressErrors.js");

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in!");
        return res.redirect("/login");
    }
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

const isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
       req.flash("error", "You don't have permission!");
       return  res.redirect(`/listings/${id}`);
    }

    next();
}

// Validation for listing on client side
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressErrors(400, errMsg);
    } else {
        next();
    }
};

// Validation for Reviews on client side
const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressErrors(400, errMsg);
    } else {
        next();
    }
};

const isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
       req.flash("error", "You don't have permission to delete!");
       return  res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports = {
    isLoggedIn, 
    saveRedirectUrl, 
    isOwner, 
    validateListing, 
    validateReview,
    isReviewAuthor
};