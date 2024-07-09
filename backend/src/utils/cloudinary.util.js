import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import path from "path";
import dotenv from 'dotenv'
dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const extractPublicId = (url) => {
    const parts = url.split('/');
    const publicIdWithExtension = parts.pop();
    const publicId = publicIdWithExtension.split('.')[0];
    return publicId;
  };
  
  const deleteResourceByUrl = async (url) => {
    const publicId = url ? extractPublicId(url) : "";
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Delete result:', result);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

const uploadOnCloudinary = async (localFilePath,username,resource) => {
    try {
        if (!localFilePath) {
            return null;
        }
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: (username) ? `TechMate/${username}/${resource}` : 'TechMate/others'
        })

        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        console.log("two:",response);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        if(error)
            console.log(error.message);
        console.log("three");
        return null;
    }
}



export {uploadOnCloudinary,deleteResourceByUrl};