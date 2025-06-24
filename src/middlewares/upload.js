const multer = require("multer");
const path = require("path");

//  Multer storage configuration
const storage = multer.diskStorage({
        destination: function (req, file, cb) {
                cb(null, "uploads/");
        },
        filename: function (req, file, cb) {
                cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
        },
});

// file filter
const fileFilter = (req, file, cb) => {
        // Only accept audio and image types
        if (
                file.mimetype === "audio/mpeg" ||
                file.mimetype === "audio/wav" ||
                file.mimetype === "image/jpeg" ||
                file.mimetype === "image/png"
        ) {
                cb(null, true); // Accept file if it matches any of the allowed types
        } else {
                // Reject file if it doesn't match any of the allowed types
                cb(new Error("Invalid file type. Only MP3, WAV, JPEG, PNG are allowed."), false);
        }
};

// Multer upload
const upload = multer({
        storage: storage,
        limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
        },
        //   File filter
        fileFilter: fileFilter,
});

module.exports = upload;
