const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: [true, "Name is required"],
                        trim: true,
                },
                email: {
                        type: String,
                        required: [true, "Email is required"],
                        unique: true,
                        trim: true,
                },
                password: {
                        type: String,
                        required: [true, "Password is required"],
                        minlength: [6, "Password must be at least 6 characters long"],
                },
                profilePicture: {
                        type: String,
                        default: "https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_1280.png",
                },
                isAdmin: {
                        type: Boolean,
                        default: false,
                },
                likedSongs: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Song",
                        },
                ],
                likedAlbums: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Album",
                        },
                ],
                followedArtists: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Artist",
                        },
                ],
                followedPlaylists: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Playlist",
                        },
                ],
        },
        {
                timestamps: true,
        }
);

// Compile the schema into a model
const User = mongoose.model("User", userSchema);

module.exports = User;
