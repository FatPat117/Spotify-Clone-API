const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const Artist = require("../models/Artist");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Playlist = require("../models/Playlist");
const User = require("../models/User");
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
