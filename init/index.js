const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
const main = async () => {
    await mongoose.connect(mongo_url);
}

main()
     .then((res) => {
        console.log("Connection Successful!");
     })
     .catch((err) => {
        console.log(err);
     });

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj, 
        owner: "67729562128c10ecc47487b0"
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();