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

// @desc Get a song by id
// @route GET /api/songs/:id
// @access Public

exports.getSongById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const song = await Song.findById(id)
                .populate("artist", "name image bio")
                .populate("album", "title coverImage releasedDate")
                .populate("featuredArtists", "name image bio");

        if (!song) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Song not found");
        }

        // Increment play count
        song.plays += 1;
        await song.save();

        res.status(StatusCodes.OK).json({ status: "success", data: song });
});

// @desc Update a song
// @route PUT /api/songs/:id
// @access Private/Admin

exports.updateSong = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, artistId, albumId, duration, genre, lyrics, isExplicit, featuredArtists } = req.body;

        const song = await Song.findById(id);
        if (!song) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Song not found");
        }

        if (artistId) {
                const artist = await Artist.findById(artistId);
                if (!artist) {
                        res.status(StatusCodes.NOT_FOUND);
                        throw new Error("Artist not found");
                }
                song.artist = artist._id;
        }
        song.title = title || song.title;
        song.duration = duration || song.duration;
        song.genre = genre || song.genre;
        song.lyrics = lyrics || song.lyrics;
        song.isExplicit = isExplicit === "true" ? true : false;
        song.featuredArtists = featuredArtists ? JSON.parse(featuredArtists) : song.featuredArtists;
        song.album = albumId ? albumId : song.album;

        // Update cover image
        if (req.files && req.files.cover) {
                const coverResult = await uploadToCloudinary(req.files.cover[0].path, "spotify/songs");
                song.coverImage = coverResult.secure_url;
        }

        // Update audio file
        if (req.files && req.files.audio) {
                const audioResult = await uploadToCloudinary(req.files.audio[0].path, "spotify/songs");
                song.audioUrl = audioResult.secure_url;
        }

        // Update featured artists
        await song.save();
        res.status(StatusCodes.OK).json({ status: "success", data: song });
});

// @desc Delete a song
// @route DELETE /api/songs/:id
// @access Private/Admin

exports.deleteSong = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const song = await Song.findById(id);
        if (!song) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Song not found");
        }

        // Delete from artist's songs
        await Artist.updateOne({ songs: { $in: [id] } }, { $pull: { songs: id } });

        // Delete from album's songs
        if (song.album) {
                await Album.updateOne({ songs: { $in: [id] } }, { $pull: { songs: id } });
        }

        // Delete from cloudinary
        await cloudinary.uploader.destroy(song.audioUrl);

        // Delete song
        await song.deleteOne();

        res.status(StatusCodes.OK).json({ status: "success", message: "Song deleted successfully" });
});
