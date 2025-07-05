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

// @desc Get user's playlists
// route GET /api/playlists/user
// @access Private
exports.getUserPlaylists = asyncHandler(async (req, res) => {
        const playlists = await Playlist.find({
                $or: [{ creator: req.user._id }, { collaborators: req.user._id }],
        })
                .sort({ createdAt: -1 })
                .populate("creator", "name profilePicture");

        res.status(StatusCodes.OK).json({
                success: true,
                message: "User's playlists fetched successfully",
                playlists,
        });
});

// @desc Get a playlist by id
// route GET /api/playlists/:id
// @access Public
exports.getPlaylistById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const playlist = await Playlist.findById(id)
                .populate("creator", "name profilePicture")
                .populate("collaborators", "name profilePicture");

        if (!playlist) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Playlist not found");
        }

        // Check if the playlist is public or the user is the creator or a collaborator
        if (
                !playlist.isPublic &&
                playlist.creator.toString() !== req.user._id.toString() &&
                !playlist.collaborators.includes(req.user._id)
        ) {
                res.status(StatusCodes.FORBIDDEN);
                throw new Error("You are not authorized to access this playlist");
        }

        res.status(StatusCodes.OK).json({
                success: true,
                message: "Playlist fetched successfully",
                playlist,
        });
});

// @desc Update a playlist
// route PUT /api/playlists/:id
// @access Private
exports.updatePlaylist = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description, isPublic } = req.body;

        const playlist = await Playlist.findById(id);
        if (!playlist) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Playlist not found");
        }

        if (
                !playlist.creator.equals(req.user._id) &&
                !playlist.collaborators.some((collab) => collab.equals(req.user._id))
        ) {
                res.status(StatusCodes.FORBIDDEN);
                throw new Error("You are not authorized to update this playlist");
        }

        // Update the playlist
        if (name) {
                playlist.name = name || playlist.name;
        }
        if (description) {
                playlist.description = description || playlist.description;
        }

        if (playlist.creator.equals(req.user._id)) {
                playlist.isPublic = isPublic || playlist.isPublic;
        }

        if (req.file) {
                const result = await uploadToCloudinary(req.file.path, "playlists");
                playlist.coverImage = result.secure_url;
        }
        await playlist.save();

        res.status(StatusCodes.OK).json({
                success: true,
                message: "Playlist updated successfully",
                playlist,
        });
});

// @desc Delete a playlist
// route DELETE /api/playlists/:id
// @access Private
exports.deletePlaylist = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const playlist = await Playlist.findById(id);

        if (!playlist) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Playlist not found");
        }

        // Check if the user is the creator
        if (!playlist.creator.equals(req.user._id)) {
                res.status(StatusCodes.FORBIDDEN);
                throw new Error("You are not authorized to delete this playlist");
        }

        await playlist.deleteOne();
        res.status(StatusCodes.OK).json({
                success: true,
                message: "Playlist deleted successfully",
        });
});
