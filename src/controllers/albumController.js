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

        if (!mongoose.Types.ObjectId.isValid(artistId)) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Invalid artist ID format");
        }
        // check if artist exists
        const existingArtist = await Artist.findById(artistId);
        if (!existingArtist) {
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
                artist: existingArtist._id,
                releaseDate: releaseDate ? new Date(releaseDate) : Date.now(),
                genre,
                description,
                isExplicit: isExplicit === "true" ? true : false,
                coverImage: coverImage || null,
        });

        // Add album to artist's albums
        existingArtist.albums.push(album._id);
        await existingArtist.save();

        res.status(StatusCodes.CREATED).json({ status: "success", data: album });
});

// @desc Get all albums with filtering and pagination
// @route GET /api/albums?genre=genre&artist=artist&search=search&page=page&limit=limit
// access Public

exports.getAlbums = asyncHandler(async (req, res) => {
        const { genre, artist, search, page = 1, limit = 10 } = req.query;
        // Build filter object
        const filter = {};
        if (genre) {
                filter.genre = genre;
        }
        if (artist) {
                filter.artist = artist;
        }
        if (search) {
                const matchingArtists = await Artist.find({
                        name: { $regex: search, $options: "i" },
                }).select("_id");
                const artistIds = matchingArtists.map((a) => a._id);
                filter.$or = [
                        { title: { $regex: search, $options: "i" } },
                        { artist: { $in: artistIds } },
                        { description: { $regex: search, $options: "i" } },
                        { genre: { $regex: search, $options: "i" } },
                ];
        }

        //   Pagination
        const skip = parseInt(page - 1) * parseInt(limit);

        //   Sorting
        const sort = { releaseDate: -1 };

        const albums = await Album.find(filter)
                .select("-__v")
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate("artist", "name image");

        const totalAlbums = await Album.countDocuments(filter);

        res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                        albums,
                        totalAlbums,
                        page,
                        limit,
                },
        });
});

// @desc Get album by id
// @route GET /api/albums/:id
// @access Public

exports.getAlbumById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const album = await Album.findById(id).populate("artist", "name image");
        if (!album) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Album not found");
        }
        res.status(StatusCodes.OK).json({ status: "success", data: album });
});

// @desc Update an album
// @route PUT /api/albums/:id
// @access Private/Admin

exports.updateAlbum = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, artistId, releaseDate, genre, description, isExplicit } = req.body;

        const album = await Album.findById(id);

        if (!album) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Album not found");
        }

        if (title) {
                album.title = title || album.title;
        }

        if (artistId) {
                const existingArtist = await Artist.findById(artistId);
                if (!existingArtist) {
                        res.status(StatusCodes.NOT_FOUND);
                        throw new Error("Artist not found");
                }
                album.artist = existingArtist._id;
        }

        if (releaseDate) {
                album.releaseDate = releaseDate || album.releaseDate;
        }

        if (genre) {
                album.genre = genre || album.genre;
        }

        if (description) {
                album.description = description || album.description;
        }

        if (isExplicit) {
                album.isExplicit = isExplicit === "true" ? true : false;
        }

        if (req.file) {
                const result = await uploadToCloudinary(req.file.path, "spotify/albums");
                album.coverImage = result.secure_url;
        }

        const updatedAlbum = await album.save();
        res.status(StatusCodes.OK).json({ status: "success", data: updatedAlbum });
});
