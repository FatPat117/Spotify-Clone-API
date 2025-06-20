const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

//  Connect to MongoDB data
mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
                console.log("Connected to MongoDB");
        })
        .catch((err) => {
                console.log("Error connecting to MongoDB", err);
        });

//   Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
});
