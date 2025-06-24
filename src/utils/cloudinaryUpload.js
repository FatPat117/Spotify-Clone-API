const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadToCloudinary = async (filePath, folder) => {
        try {
                if (!filePath) return null;

                // Upload the file to Cloudinary
                const result = await cloudinary.uploader.upload(filePath, {
                        resource_type: "auto",
                        folder: folder,
                });

                // Delete the local file after successful upload
                fs.unlinkSync(filePath);

                return result;
        } catch (error) {
                console.error("Error uploading to Cloudinary:", error);

                // Delete the local file if upload fails
                if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                }

                throw error;
        }
};

module.exports = uploadToCloudinary;
