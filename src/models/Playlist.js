const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");
const { deflate } = require("zlib");

const playlistSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: [true, "Playlist name is required"],
                        trim: true,
                },
                description: {
                        type: String,
                        trim: true,
                },
                coverImage: {
                        type: String,
                        default: "https://cdn.pixabay.com/photo/2022/01/28/18/32/leaves-6975462_1280.png",
                },
                creator: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "Creator is required"],
                },
                songs: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Song",
                        },
                ],
                isPublic: {
                        type: boolean,
                        default: false,
                },
                followers: {
                        type: Number,
                        default: 0,
                },
                collaborators: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "User",
                        },
                ],
        },
        {
                timestamps: true,
        }
);

// Compile the schema into a model
const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
