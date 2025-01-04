const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const {storage} = require("../cloudConfig.js");
const multer = require("multer");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

router
    .route("/")
    .get(wrapAsync(listingController.index)) // Index - get route
    .post(                                   // Create - post Route
        isLoggedIn, 
        upload.single('listing[image]'),
        validateListing, 
        wrapAsync(listingController.createNewListing)
    );

router.get(             // New - get Route
    "/new", 
    isLoggedIn, 
    listingController.renderNewForm
);

router
    .route("/:id")
    .get(               // Show - get route
        wrapAsync(listingController.showListing))
    .put(               // Update - put route
        isLoggedIn, 
        isOwner, 
        upload.single('listing[image]'),
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(            // Delete - delete route
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.deleteListing)
    );
    
router.get(             // Edit - get Route
    "/:id/edit", 
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.editListing)
);

module.exports = router;