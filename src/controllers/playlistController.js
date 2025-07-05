const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

// @desc Create a new playlist
// @route POST /api/playlists
// @access Private
exports.createPlaylist = asyncHandler(async (req, res) => {
        const { name, description, isPublic } = req.body;
        if (!name) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Name is required");
        }

        if (name.length < 3 || name.length > 50) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Name must be between 3 and 50 characters long");
        }

        if (description && (description.length < 3 || description.length > 100)) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Description must be between 3 and 100 characters long");
        }

        const isExistPlaylist = await Playlist.findOne({ name, creator: req.user._id });
        if (isExistPlaylist) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Playlist already exists");
        }

        // upload cover image to cloudinary
        let coverImage = null;
        if (req.file) {
                const result = await uploadToCloudinary(req.file.path, "playlists");
                coverImage = result.secure_url;
        }

        const playlist = await Playlist.create({
                name,
                description,
                isPublic: isPublic === "true" || false,
                coverImage,
                creator: req.user._id,
        });

        res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Playlist created successfully",
                playlist,
        });
});
