const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

// Hash password before saving
userSchema.pre("save", async function (next) {
        // If password is not modified, skip hashing
        if (!this.isModified("password")) {
                next();
        }
        this.password = await bcrypt.hash(this.password, 15);
        next();
});

// Compare password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
