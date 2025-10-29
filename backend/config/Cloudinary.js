// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Chat file storage
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileType = file.mimetype.split("/")[0];
    let folder = "ChatFiles";

    if (fileType === "image") folder = "ChatImages";
    else if (fileType === "video") folder = "ChatVideos";
    else if (fileType === "audio") folder = "ChatAudio";
    else folder = "ChatDocuments";

    return {
      folder,
      resource_type: fileType === "image" ? "image" : "raw",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "mp4",
        "mp3",
        "pdf",
        "doc",
        "docx",
        "txt",
      ],
    };
  },
});

// Basic file type validation
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "video/mp4",
    "audio/mpeg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"));
  }
  cb(null, true);
};

// Factory uploader → decides size limit per file type
const makeUploader = (sizeLimit) =>
  multer({ storage: chatStorage, limits: { fileSize: sizeLimit }, fileFilter });

// Middleware wrapper
const uploadChatFile = (req, res, next) => {
  const mimetype = req.headers["content-type"];

  // Pick limit: 200 KB for images/docs/text, 2 MB for audio/video
  const smallTypes = ["image", "application", "text"];
  const largeTypes = ["audio", "video"];

  let uploader;
  if (mimetype && largeTypes.some((t) => mimetype.includes(t))) {
    uploader = makeUploader(6 * 1024 * 1024).single("file"); // 2 MB
  } else {
    uploader = makeUploader(5*1024 * 1024).single("file"); // 200 KB
  }

  uploader(req, res, next);
};

// Profile image storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "UserProfiles",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png"],
  }),
});

const uploadProfileImage = multer({ storage: profileStorage });

export { uploadChatFile, uploadProfileImage, cloudinary };
