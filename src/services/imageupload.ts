const path = require("path");
const cloudinary = require("cloudinary");
const DataUri = require("datauri/parser");

export const cloudinaryService = async (
  files: any,
  service: any
): Promise<{ successful: boolean; message: string; urls: any[] }> => {
  try {
    cloudinary.config({
      cloud_name: "ol4juwon",
      api_key: "619781942963636",
      api_secret: "8ZuIWrywiz5m6_6mLq_AYuHDeUo",
    });

    console.log(files);

    const urls = [];

    const dtauri = new DataUri();

    for (const file of files) {
      const dataUri = dtauri.format(
        path.extname(file.originalname),
        file.buffer
      );
      console.log("here");

      const final_file = dataUri.content;

      const image = await cloudinary.v2.uploader.upload_large(final_file);

      urls.push(image.secure_url);
    }

    return { successful: true, message: "files uploaded successfully", urls };
  } catch (error) {
    return { successful: false, message: (error as Error).message, urls: [] };
  }
};
