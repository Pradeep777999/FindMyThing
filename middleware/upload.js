const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file || !file.originalname) {
    return cb(null, true);
  }

  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

  const allowedExtensions = [
    "jpeg",
    "jpg",
    "png",
    "webp",
    "gif",
    "bmp",
    "heic",
    "heif",
    "jfif"
  ];

  const isImageMime =
    file.mimetype && file.mimetype.startsWith("image/");

  const isAllowedExt = allowedExtensions.includes(ext);

  if (isImageMime || isAllowedExt) {
    cb(null, true);
  } else {
    // Ignore invalid file without stopping the form submission
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter
});

module.exports = upload;