import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configuration (kept same)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file from buffer (memory storage)
const uploadBufferToCloudinary = async (buffer, originalName, mimeType) => {
    return new Promise((resolve, reject) => {
        // Create a readable stream from buffer
        const stream = Readable.from(buffer);
        
        // Upload options
        const uploadOptions = {
            resource_type: "auto",
            folder: "chargers", // Organize charger images in a folder
            public_id: `${Date.now()}-${originalName.split('.')[0]}`, // Unique filename
            format: mimeType.split('/')[1] || 'jpg', // Get file extension from mime type
        };

        // Upload stream to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Pipe the buffer stream to Cloudinary
        stream.pipe(uploadStream);
    });
};

// Legacy function for backward compatibility (now uses buffer upload)
const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null;

        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto",
        });

        // Note: fs.unlinkSync removed since we're not using local files anymore
        return response;
    } catch (error) {
        console.log("Error uploading file to Cloudinary:", error.message);
        return null;
    }
};

const deleteFromCloudinary = async (url) => {
    try {
        if (!url) return null;

        const publicId = url.split("/").slice(-1)[0].split(".")[0];

        await cloudinary.uploader.destroy(publicId);

        return true;
    } catch (error) {
        console.log("Error deleting file from Cloudinary:", error.message);
        return null;
    }
};

export { uploadOnCloudinary, uploadBufferToCloudinary, deleteFromCloudinary };
