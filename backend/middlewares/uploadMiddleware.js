const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadToCloudinary, uploadMultipleToCloudinary } = require("../config/cloudinary");

// Ensure temp directory exists
const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// File signatures (magic bytes) for image validation
const FILE_SIGNATURES = {
  "ffd8ff": "image/jpeg",      // JPEG
  "89504e47": "image/png",     // PNG
  "47494638": "image/gif",     // GIF
  "52494646": "image/webp",    // WebP (RIFF header)
};

// Validate file signature against actual file content
const validateFileSignature = async (filePath, expectedMimeType) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { start: 0, end: 11 });
    let buffer = Buffer.alloc(0);

    stream.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    stream.on("end", () => {
      const hex = buffer.toString("hex").toLowerCase();

      // Check against known signatures
      for (const [signature, mimeType] of Object.entries(FILE_SIGNATURES)) {
        if (hex.startsWith(signature)) {
          // WebP requires additional check
          if (signature === "52494646" && !hex.includes("57454250")) {
            continue; // Not a WebP file
          }
          resolve(true);
          return;
        }
      }

      resolve(false);
    });

    stream.on("error", reject);
  });
};

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  // Remove path components and null bytes
  const sanitized = path.basename(filename).replace(/\0/g, "");
  // Only allow alphanumeric, dash, underscore, and period
  return sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");
};

// Configure multer for temporary local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(sanitizeFilename(file.originalname)).toLowerCase();
    cb(null, uniqueSuffix + ext);
  },
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed."), false);
    return;
  }

  // Check extension
  const ext = path.extname(sanitizeFilename(file.originalname)).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    cb(new Error("Invalid file extension. Only .jpg, .jpeg, .png, .gif, .webp are allowed."), false);
    return;
  }

  cb(null, true);
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (reduced from 10MB)
    files: 10, // Maximum 10 files
  },
});

// Middleware to upload single image to Cloudinary
const uploadSingleImage = (fieldName, folder) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return next(); // No file uploaded, continue
        }

        // Validate file signature (magic bytes)
        const isValidSignature = await validateFileSignature(req.file.path, req.file.mimetype);
        if (!isValidSignature) {
          // Delete the invalid file
          fs.unlink(req.file.path, () => {});
          return res.status(400).json({
            status: "error",
            message: "Invalid file content. File signature does not match an allowed image format.",
          });
        }

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
          // Fallback to local storage if Cloudinary not configured
          req.uploadedImage = {
            url: `/uploads/${req.file.filename}`,
            publicId: null,
          };
          return next();
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.path, folder);

        // Delete temp file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });

        // Attach result to request
        req.uploadedImage = result;
        next();
      } catch (error) {
        // Clean up temp file on error
        if (req.file?.path) {
          fs.unlink(req.file.path, () => {});
        }
        next(error);
      }
    },
  ];
};

// Middleware to upload multiple images to Cloudinary
const uploadMultipleImages = (fieldName, folder, maxCount = 10) => {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          return next(); // No files uploaded, continue
        }

        // Validate file signatures for all uploaded files
        const validFiles = [];
        const invalidFiles = [];

        for (const file of req.files) {
          const isValid = await validateFileSignature(file.path, file.mimetype);
          if (isValid) {
            validFiles.push(file);
          } else {
            invalidFiles.push(file);
            // Delete invalid file
            fs.unlink(file.path, () => {});
          }
        }

        // If all files are invalid, return error
        if (validFiles.length === 0) {
          return res.status(400).json({
            status: "error",
            message: "All uploaded files have invalid content. File signatures do not match allowed image formats.",
          });
        }

        // Warn if some files were rejected
        if (invalidFiles.length > 0) {
          console.warn(`${invalidFiles.length} files rejected due to invalid signatures`);
        }

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
          // Fallback to local storage
          req.uploadedImages = validFiles.map((file) => ({
            url: `/uploads/${file.filename}`,
            publicId: null,
          }));
          return next();
        }

        // Upload all valid files to Cloudinary
        const filePaths = validFiles.map((file) => file.path);
        const results = await uploadMultipleToCloudinary(filePaths, folder);

        // Delete temp files
        validFiles.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
          });
        });

        // Attach results to request
        req.uploadedImages = results;
        next();
      } catch (error) {
        // Clean up temp files on error
        if (req.files) {
          req.files.forEach((file) => {
            fs.unlink(file.path, () => {});
          });
        }
        next(error);
      }
    },
  ];
};

// Predefined upload middlewares for different use cases
const uploadMiddleware = {
  // Chat image upload
  chatImage: uploadSingleImage("image", "wedding-junction/chat"),

  // Vendor profile image
  vendorProfile: uploadSingleImage("image", "wedding-junction/vendors/profiles"),

  // Vendor gallery images (multiple)
  vendorGallery: uploadMultipleImages("images", "wedding-junction/vendors/gallery", 10),

  // Category image
  categoryImage: uploadSingleImage("image", "wedding-junction/categories"),

  // User avatar
  userAvatar: uploadSingleImage("avatar", "wedding-junction/users/avatars"),

  // Generic single image
  singleImage: (folder) => uploadSingleImage("image", `wedding-junction/${folder}`),

  // Generic multiple images
  multipleImages: (folder, maxCount) =>
    uploadMultipleImages("images", `wedding-junction/${folder}`, maxCount),
};

module.exports = uploadMiddleware;
