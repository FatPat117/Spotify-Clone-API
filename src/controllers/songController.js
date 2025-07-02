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
        const { title, artistId, albumId, duration, genre, lyrics, isExplicit } = req.body;
        if (!title || !artistId || !albumId || !duration || !genre || !lyrics) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("All fields are required");
        }

        if (!mongoose.Types.ObjectId.isValid(artistId)) {
                res.status(StatusCodes.BAD_REQUEST);
                throw new Error("Invalid artist ID format");
        }
});
