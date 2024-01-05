const multer = require("multer");

const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: 'techtak',
  api_key: '493224538232895',
  api_secret: 'IdKUmRn7peR_AVTsGw-GuwB5530',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "TechTak",
    format: async () => "png",
    public_id: (req, file) => file.filename,
  },
});

const cloudinaryConfig = multer({ storage: storage });

module.exports = cloudinaryConfig;
