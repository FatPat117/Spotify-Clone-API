const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const mongoose = require("mongoose");

const uploadToCloudinary = require("../utils/cloudinaryUpload");

// @desc Create a song
// @route POST /api/songs
// @access Private/Admin

exports.createSong = asyncHandler(async (req, res) => {
        const { title, artistId, albumId, duration, genre, lyrics, isExplicit, featuredArtists } = req.body;
        if (!title || !artistId || !duration || !genre || !lyrics) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("All fields are required");
        }

        if (!mongoose.Types.ObjectId.isValid(artistId)) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Invalid artist ID format");
        }

        const artist = await Artist.findById(artistId);

        if (!artist) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Artist not found");
        }

        if (!req.files || !req.files.audio || !req.files.cover) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Audio and cover image are required");
        }

        const audioResult = await uploadToCloudinary(req.files.audio[0].path, "spotify/songs");
        const coverResult = await uploadToCloudinary(req.files.cover[0].path, "spotify/songs");

        const coverImage = coverResult.secure_url;
        const audioFile = audioResult.secure_url;

        // Create song
        const song = await Song.create({
                title,
                artist: artist._id,
                album: albumId ? albumId : null,
                duration,
                genre,
                lyrics,
                isExplicit: isExplicit === "true" ? true : false,
                coverImage,
                audioUrl: audioFile,
                featuredArtists: featuredArtists ? JSON.parse(featuredArtists) : [],
                coverImage,
                audioUrl: audioFile,
        });

        // Add song to artist's songs
        artist.songs.push(song._id);

        // Add song to album's songs
        if (albumId) {
                const existingAlbum = await Album.findById(albumId);
                existingAlbum.songs.push(song._id);
                await existingAlbum.save();
        }

        res.status(StatusCodes.CREATED).json({ status: "success", data: song });
});

// @desc Get all songs
// @route GET /api/songs
// @access Public

exports.getSongs = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, search, sort, genre, artistId } = req.query;

        const filter = {};
        if (genre) {
                filter.genre = genre;
        }

        if (artistId) {
                filter.artist = artistId;
        }

        if (search) {
                const matchingArtists = await Artist.find({
                        name: { $regex: search, $options: "i" },
                }).select("_id");
                const artistIds = matchingArtists.map((a) => a._id);
                filter.$or = [
                        { title: { $regex: search, $options: "i" } },
                        { artist: { $in: artistIds } },
                        { genre: { $regex: search, $options: "i" } },
                ];
        }

        const skip = parseInt(page - 1) * parseInt(limit);
        const sortBy = { releasedDate: -1 };
        const songs = await Song.find(filter)
                .select("-__v")
                .sort(sortBy)
                .skip(skip)
                .limit(parseInt(limit))
                .populate("artist", "name image")
                .populate("album", "title image")
                .populate("featuredArtists", "name image");
        res.status(StatusCodes.OK).json({ status: "success", data: songs });
});
