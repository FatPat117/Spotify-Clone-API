const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const Artist = require("../models/Artist");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const uploadToCloudinary = require("../utils/cloudinaryUpload");

// @desc Create a new artist
// @route POST /api/artists
// @access Private

exports.createArtist = asyncHandler(async (req, res) => {
        if (!req.body || Object.keys(req.body).length === 0) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Artist data is required");
        }

        const { name, bio, genres } = req.body;

        if (!name || !genres || !bio) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Name, genres, and bio are required");
        }

        //   Check if artist already exists
        const existingArtist = await Artist.findOne({ name });

        if (existingArtist) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Artist already exists");
        }
        //   upload artist image
        let imageUrl = null;
        if (req.file) {
                const result = await uploadToCloudinary(req.file.path, "spotify/artists");
                imageUrl = result.secure_url;
        }

        //   Create artist
        const artist = await Artist.create({
                name,
                bio,
                genres,
                isVerified: true,
                image: imageUrl,
        });

        res.status(StatusCodes.CREATED).json({
                status: "success",
                data: artist,
        });
});

// @desc Get all artists
// @route GET /api/artists
// @access Public

exports.getArtists = asyncHandler(async (req, res) => {
        const { genre, search, page = 1, limit = 10 } = req.query;
        // Build filter object
        const filter = {};
        if (genre) {
                filter.genres = { $in: [genre] };
        }
        if (search) {
                filter.$or = [
                        { name: { $regex: search, $options: "i" } },
                        { genres: { $regex: search, $options: "i" } },
                ];
        }

        //   Pagination
        const skip = parseInt(page - 1) * parseInt(limit);

        //   Sorting
        const sort = { followers: -1 };

        const artists = await Artist.find(filter).select("-__v").sort(sort).skip(skip).limit(parseInt(limit));

        const totalArtists = await Artist.countDocuments(filter);

        res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                        artists,
                        totalArtists,
                        page,
                        limit,
                },
        });
});

// @desc Get an artist by id
// @route GET /api/artists/:id
// @access Public

exports.getArtistById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const artist = await Artist.findById(id).select("-__v");
        if (!artist) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Artist not found");
        }
        res.status(StatusCodes.OK).json({ status: "success", data: artist });
});

// @desc Update an artist
// @route PUT /api/artists/:id
// @access Private/Admin

exports.updateArtist = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, bio, genres, isVerified } = req.body;
        const artist = await Artist.findById(id);
        if (!artist) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Artist not found");
        }

        //   Update artist
        artist.name = name || artist.name;
        artist.bio = bio || artist.bio;
        artist.genres = genres || artist.genres;
        artist.isVerified = isVerified || artist.isVerified;

        //   Update artist image
        if (req.file) {
                const result = await uploadToCloudinary(req.file.path, "spotify/artists");
                artist.image = result.secure_url;
        }

        //   Save artist
        const updatedArtist = await artist.save();

        res.status(StatusCodes.OK).json({ status: "success", data: artist });
});

// @desc Delete an artist
// @route DELETE /api/artists/:id
// @access Private/Admin

exports.deleteArtist = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const artist = await Artist.findByIdAndDelete(id);
        if (!artist) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Artist not found");
        }

        // Delete all songs by the artist
        await Song.deleteMany({ artist: id });

        // Delete all albums by the artist
        await Album.deleteMany({ artist: id });

        res.status(StatusCodes.OK).json({ status: "success", message: "Artist deleted successfully" });
});

//@desc Get top 10 artists
//@route GET /api/artists/top
//@access Public

exports.getTopArtists = asyncHandler(async (req, res) => {
        const { limit } = req.query;
        const artists = await Artist.find().sort({ followers: -1 }).limit(parseInt(limit));
        res.status(StatusCodes.OK).json({ status: "success", data: artists });
});

// desc Get Artist's top Songs
// route GET /api/artists/:id/top-songs?limit=10
// access Public
const getArtistTopSongs = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { limit } = req.query;
        const songs = await Song.find({ artist: id })
                .sort({ plays: -1 })
                .limit(parseInt(limit))
                .populate("album", "title coverImage");

        if (!songs || songs.length === 0) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("No songs found for this artist");
        }

        res.status(StatusCodes.OK).json({ status: "success", data: songs });
});
