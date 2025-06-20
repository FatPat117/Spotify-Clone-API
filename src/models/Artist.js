const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: [true, "Artist name is required"],
                        trim: true,
                },
                bio: {
                        type: String,
                        trim: true,
                },
                image: {
                        type: String,
                        default: "https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_1280.png",
                },
                genres: [
                        {
                                type: String,
                                trim: true,
                        },
                ],
                followers: {
                        type: Number,
                        default: 0,
                },
                albums: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Album",
                        },
                ],
                songs: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Song",
                        },
                ],
                isVerified: {
                        type: Boolean,
                        default: false,
                },
        },
        {
                timestamps: true,
        }
);

// Compile the schema into a model
const Artist = mongoose.model("Artist", artistSchema);

module.exports = Artist;
