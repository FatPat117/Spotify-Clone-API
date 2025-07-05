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

// @desc Get all playlists
// route GET /api/playlists
// @access Public
exports.getPlaylists = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, search, sort } = req.query;

        const filter = { isPublic: true };

        if (search) {
                filter.$or = [
                        { name: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } },
                ];
        }

        const skip = parseInt(page) - 1 * parseInt(limit);

        const playlists = await Playlist.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ followers: -1 })
                .populate("creator", "name profilePicture")
                .populate("collaborators", "name profilePicture");

        const total = await Playlist.countDocuments(filter);

        res.status(StatusCodes.OK).json({
                success: true,
                message: "Playlists fetched successfully",
                playlists,
                totalPlaylists: total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
        });
});
