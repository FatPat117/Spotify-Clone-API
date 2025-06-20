const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");

//  Register a new user (route POST /api/users/register)
exports.registerUser = asyncHandler(async (req, res) => {
        // Get the payload
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
                throw new Error("User name, email and password are required");
        }

        //   Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("User already exists");
        }

        //   Create a new user
        const user = await User.create({ name, email, password });
        res.status(StatusCodes.CREATED).json({
                message: "User registered successfully",
                data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        profilePicture: user.profilePicture,
                },
        });
});
