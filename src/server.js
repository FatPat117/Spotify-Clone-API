const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { StatusCodes } = require("http-status-codes");
const userRouter = require("./routes/userRoutes");
const artistRouter = require("./routes/artistRoutes");
const albumRouter = require("./routes/albumRoutes");

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

//   Middleware
app.use(express.json()); //  body parser middleware

// Routes
app.use("/api/users", userRouter);
app.use("/api/artists", artistRouter);
app.use("/api/albums", albumRouter);
// Error handling middleware
//404
app.use(/.*/, (req, res, next) => {
        res.status(404).json({ message: "Not found" });
});
// Global error handler
app.use((err, req, res, next) => {
        const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        const message = err.message || "Internal server error";
        res.status(statusCode).json({ message });
});

//   Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
});
