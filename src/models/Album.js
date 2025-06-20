const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
        {
                title: {
                        type: String,
                        required: [true, "Album title is required"],
                        trim: true,
                },
                artist: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Artist",
                        required: [true, "Artist is required"],
                },
                releaseDate: {
                        type: Date,
                        default: Date.now(),
                },
                coverImage: {
                        type: String,
                        default: "https://cdn.pixabay.com/photo/2022/01/28/18/32/leaves-6975462_1280.png",
                },
                songs: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Song",
                        },
                ],
                genre: {
                        type: String,
                        trim: true,
                },
                likes: {
                        type: Number,
                        default: 0,
                },
                description: {
                        type: String,
                        trim: true,
                },
                isExplicit: {
                        type: Boolean,
                        default: false,
                },
                createdAt: {
                        type: Date,
                        default: Date.now(),
                },
        },
        {
                timestamps: true,
        }
);

// Compile the schema into a model
const Album = mongoose.model("Album", albumSchema);

module.exports = Album;
