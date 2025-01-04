const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const index = async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", {listings});
}

const renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

const createNewListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", `New listing ${newListing.title} created!`);
    res.redirect("/listings");
}

const showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        },
    })
    .populate("owner");
    
    if (!listing) {
        req.flash("error", "Listing that you requested is does not exists!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}

const editListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested is does not exists!");
        return res.redirect("/listings");
    } 

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300/e_blur:300");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
}

const updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);

    // If location has been updated, use geocoding to fetch the new coordinates
    if (req.body.listing.location !== listing.location) {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        // Update geometry with new location coordinates
        listing.geometry = response.body.features[0].geometry;
        listing.location = req.body.listing.location; // Ensure the location is updated in the database
    }

    // Update the other fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.country = req.body.listing.country;

    // Update the image if uploaded
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();
    req.flash("success", `${listing.title} Edited!`);
    res.redirect(`/listings/${id}`);
}


const deleteListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    req.flash("success", `${listing.title} Deleted!`);
    res.redirect("/listings");
}

module.exports = {
    index, 
    renderNewForm, 
    createNewListing, 
    showListing, 
    editListing, 
    updateListing, 
    deleteListing
};