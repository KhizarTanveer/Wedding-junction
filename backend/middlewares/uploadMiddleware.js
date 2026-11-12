const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadToCloudinary, uploadMultipleToCloudinary } = require("../config/cloudinary");


const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}


const FILE_SIGNATURES = {
  "ffd8ff": "image/jpeg",     
  "89504e47": "image/png",    
  "47494638": "image/gif",    
  "52494646": "image/webp",   
};


const validateFileSignature = async (filePath, expectedMimeType) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { start: 0, end: 11 });
    let buffer = Buffer.alloc(0);

    stream.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    stream.on("end", () => {
      const hex = buffer.toString("hex").toLowerCase();

      
      for (const [signature, mimeType] of Object.entries(FILE_SIGNATURES)) {
        if (hex.startsWith(signature)) {
       
          if (signature === "52494646" && !hex.includes("57454250")) {
            continue;
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


const sanitizeFilename = (filename) => {
 
  const sanitized = path.basename(filename).replace(/\0/g, "");
  
  return sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");
};


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


const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed."), false);
    return;
  }

  
  const ext = path.extname(sanitizeFilename(file.originalname)).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    cb(new Error("Invalid file extension. Only .jpg, .jpeg, .png, .gif, .webp are allowed."), false);
    return;
  }

  cb(null, true);
};


const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 10, 
  },
});


const uploadSingleImage = (fieldName, folder) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return next();
        }

       
        const isValidSignature = await validateFileSignature(req.file.path, req.file.mimetype);
        if (!isValidSignature) {
         
          fs.unlink(req.file.path, () => {});
          return res.status(400).json({
            status: "error",
            message: "Invalid file content. File signature does not match an allowed image format.",
          });
        }

        
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
        
          req.uploadedImage = {
            url: `/uploads/${req.file.filename}`,
            publicId: null,
          };
          return next();
        }

       
        const result = await uploadToCloudinary(req.file.path, folder);

        
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });

       
        req.uploadedImage = result;
        next();
      } catch (error) {
        
        if (req.file?.path) {
          fs.unlink(req.file.path, () => {});
        }
        next(error);
      }
    },
  ];
};


const uploadMultipleImages = (fieldName, folder, maxCount = 10) => {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          return next(); 
        }

       
        const validFiles = [];
        const invalidFiles = [];

        for (const file of req.files) {
          const isValid = await validateFileSignature(file.path, file.mimetype);
          if (isValid) {
            validFiles.push(file);
          } else {
            invalidFiles.push(file);
           
            fs.unlink(file.path, () => {});
          }
        }

        
        if (validFiles.length === 0) {
          return res.status(400).json({
            status: "error",
            message: "All uploaded files have invalid content. File signatures do not match allowed image formats.",
          });
        }

        
        if (invalidFiles.length > 0) {
          console.warn(`${invalidFiles.length} files rejected due to invalid signatures`);
        }

       
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
         
          req.uploadedImages = validFiles.map((file) => ({
            url: `/uploads/${file.filename}`,
            publicId: null,
          }));
          return next();
        }

      
        const filePaths = validFiles.map((file) => file.path);
        const results = await uploadMultipleToCloudinary(filePaths, folder);

        
        validFiles.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
          });
        });

       
        req.uploadedImages = results;
        next();
      } catch (error) {
        
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


const uploadMiddleware = {
  
  chatImage: uploadSingleImage("image", "wedding-junction/chat"),

  
  vendorProfile: uploadSingleImage("image", "wedding-junction/vendors/profiles"),

  
  vendorGallery: uploadMultipleImages("images", "wedding-junction/vendors/gallery", 10),

  
  categoryImage: uploadSingleImage("image", "wedding-junction/categories"),

  
  userAvatar: uploadSingleImage("avatar", "wedding-junction/users/avatars"),

 
  singleImage: (folder) => uploadSingleImage("image", `wedding-junction/${folder}`),

  
  multipleImages: (folder, maxCount) =>
    uploadMultipleImages("images", `wedding-junction/${folder}`, maxCount),
};

module.exports = uploadMiddleware;
