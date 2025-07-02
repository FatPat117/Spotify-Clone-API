const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Artist = require("../models/Artist");

const uploadToCloudinary = require("../utils/cloudinaryUpload");

// @desc Create a song
// @route POST /api/songs
// @access Private/Admin

exports.createSong = asyncHandler(async (req, res) => {
        const { title, artistId, albumId, duration, genre, lyrics, isExplicit, featuredArtists } = req.body;
        if (!title || !artistId || !albumId || !duration || !genre || !lyrics) {
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
                album: album._id || null,
                duration,
                genre,
                lyrics,
                isExplicit: isExplicit === "true" ? true : false,
                coverImage,
                audioUrl: audioFile,
                featuredArtists: featuredArtists ? JSON.parse(featuredArtists) : [],
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
