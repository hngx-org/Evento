import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import slugify from "slugify";

// Destructure the environment variables
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// Configure cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

// Generate unique slug
const generateUniqueSlug = (title: string, existingSlugs: string[]): string => {
  const baseSlug = slugify(title, { lower: true, replacement: "-" });
  let uniqueSlug = baseSlug;

  let counter = 1;
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

export { cloudinary, upload, generateUniqueSlug };
