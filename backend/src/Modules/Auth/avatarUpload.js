const crypto = require("crypto");
const fs = require("node:fs");
const path = require("path");
const multer = require("multer");
const appError = require("../../utils/appError");

const uploadDir = path.join(__dirname, "../../uploads/avatars");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.has(file.mimetype) &&
    allowedExtensions.has(extension)
  ) {
    return cb(null, true);
  }

  return cb(
    new appError("Please upload a JPG, PNG, or WEBP image.", 400, "ERROR"),
    false,
  );
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
