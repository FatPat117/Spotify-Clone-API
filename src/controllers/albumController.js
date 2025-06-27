const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const Song = require("../models/Song");
const cloudinary = require("cloudinary").v2;
const uploadToCloudinary = require("../utils/cloudinaryUpload");

// @desc Create a new album
// @route POST /api/albums
// @access Private/Admin

exports.createAlbum = asyncHandler(async (req, res) => {
        const { title, artistId, releaseDate, genre, description, isExplicit } = req.body;
        if (!title || !artistId || !releaseDate || !genre || !description) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Title, artist, release date, genre, description, and isexplicit are required");
        }

        if (title.length < 3 || title.length > 100) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Title must be between 3 and 100 characters");
        }

        if (description.length < 10 || description.length > 500) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Description must be between 10 and 500 characters");
        }

        // check if artist exists
        const artist = await Artist.findById(artistId);
        if (!artist) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Artist not found");
        }

        // check if album already exists
        const existingAlbum = await Album.findOne({ title });
        if (existingAlbum) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Album already exists");
        }

        // check if release date is in the past
        if (releaseDate < new Date()) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Release date cannot be in the past");
        }

        //  Upload cover image
        let coverImage = null;
        if (req.file) {
                const result = await uploadToCloudinary(req.file.path, "spotify/albums");
                coverImage = result.secure_url;
        }

        // Create album
        const album = await Album.create({
                title,
                artist: artistId,
                releaseDate: releaseDate ? new Date(releaseDate) : Date.now(),
                genre,
                description,
                isExplicit: isExplicit === "true" ? true : false,
                coverImage: coverImage || null,
        });

        // Add album to artist's albums
        artist.albums.push(album._id);
        await artist.save();

        res.status(StatusCodes.CREATED).json({ status: "success", data: album });
});
