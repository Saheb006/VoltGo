import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration (kept same)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null;

        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: 'auto'
        });

        // console.log("file uploaded in cloudinary");
        // console.log(response.url);
        fs.unlinkSync(localfilepath); // Delete local file after upload
        return response;

    } catch (error) {
        fs.unlinkSync(localfilepath);
        console.log("Error uploading file to Cloudinary:", error.message);
        return null;
    }
};

export { uploadOnCloudinary };
