const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

//  @desc Register a new user
//  @route POST /api/users/register
//  @access Public

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

//  @desc Login a user
//  @route POST /api/users/login
//  @access Public

exports.loginUser = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
                throw new Error("Email and password are required");
        }

        //   Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
                throw new Error("User not found");
        }

        //   Check if password is correct
        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
                throw new Error("Invalid email or password");
        }

        const token = generateToken(user._id);

        res.status(StatusCodes.OK).json({
                status: "success",
                message: "User logged in successfully",
                data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        profilePicture: user.profilePicture,
                        token,
                },
        });
});

//  @desc Get user profile
//  @route GET /api/users/profile
//  @access Private

exports.getUserProfile = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id)
                .select("-password")
                .populate("likedSongs", "title artist duration")
                .populate("likedAlbums", "title artist coverImage")
                .populate("followedArtists", "name image")
                .populate("followedPlaylists", "name creator coverImage");

        if (!user) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("User not found");
        }

        res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        profilePicture: user.profilePicture,
                },
        });
});

//  @desc Update user profile
//  @route PUT /api/users/profile
//  @access Private

exports.updateUserProfile = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (!user) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("User not found");
        }

        //   Update user profile
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        //   Update password
        if (req.body.password) {
                user.password = req.body.password;
        }

        //   Update profile picture
        if (req.file) {
                const result = await uploadToCloudinary(req.file.path, "spotify/users");
                user.profilePicture = result.secure_url;
        }

        //   Save user
        const updatedUser = await user.save(); // Save the user because a pre-save hook that hashed the password

        res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                        _id: updatedUser._id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        profilePicture: updatedUser.profilePicture,
                },
        });
});
