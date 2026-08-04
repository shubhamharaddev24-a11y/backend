const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ApiError = require('../utils/ApiError');
const fs = require('fs');
const path = require('path');

// Determine if we should use Cloudinary based on environment credentials
const useCloudinary = process.env.CLOUDINARY_API_KEY && 
                      !process.env.CLOUDINARY_API_KEY.includes('your-cloudinary') &&
                      process.env.CLOUDINARY_CLOUD_NAME && 
                      !process.env.CLOUDINARY_CLOUD_NAME.includes('your-cloudinary');

let storage;

if (useCloudinary) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'shubham-photos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${file.fieldname}-${uniqueSuffix}`;
      },
    },
  });
  // Fallback: Local Disk Storage
  const uploadDir = process.env.NODE_ENV === 'production'
    ? path.join('/tmp', 'public/uploads')
    : path.join(__dirname, '../../public/uploads');

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.warn('⚠️ Could not create local upload directory (this is normal on serverless platforms):', err.message);
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });
}

// Initialize multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid file type. Only images and videos are allowed.'));
    }
  },
});

// Single file upload
exports.uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Helper to get correct file URL (Cloudinary path vs local absolute URL)
exports.getFileUrl = (file, req) => {
  if (useCloudinary) {
    return file.path; // Cloudinary secure URL is stored in path by multer-storage-cloudinary
  }
  // Local serving URL: http://<host>/uploads/<filename>
  const host = req.get('host');
  return `${req.protocol}://${host}/uploads/${file.filename}`;
};

// Delete file from Cloudinary (with local storage safety check)
exports.deleteFile = async (publicId) => {
  if (!useCloudinary) {
    // Local storage fallback: locate and delete file if it matches publicId/filename
    try {
      const filePath = path.join(__dirname, '../../public/uploads', path.basename(publicId));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { result: 'ok' };
    } catch (err) {
      console.error('Error deleting local file:', err);
      return { result: 'failed' };
    }
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw new ApiError(500, 'Failed to delete file');
  }
};

// Get file info
exports.getFileInfo = async (publicId) => {
  if (!useCloudinary) {
    return { public_id: publicId, local: true };
  }

  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw new ApiError(404, 'File not found');
  }
};
