import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('[CloudinaryService] Configured successfully for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[CloudinaryService] Credentials not fully set in .env. Running in local fallback/preview mode.');
}

/**
 * Upload an image (base64 data URI, remote URL, or buffer) to Cloudinary
 * @param {string} fileStr - Base64 string or remote image URL
 * @param {object} options - Custom upload options (folder, tags, transformations)
 * @returns {Promise<{ url: string, publicId: string, provider: 'cloudinary' | 'fallback' }>}
 */
export const uploadImage = async (fileStr, options = {}) => {
  if (!fileStr) {
    throw new Error('No image data provided for upload.');
  }

  // If Cloudinary credentials are set up in .env
  if (isConfigured) {
    try {
      const uploadOptions = {
        folder: options.folder || 'skillmate_avatars',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        ...options
      };

      const result = await cloudinary.uploader.upload(fileStr, uploadOptions);
      console.log(`[CloudinaryService] Image successfully uploaded to Cloudinary: ${result.secure_url}`);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary'
      };
    } catch (err) {
      console.error('[CloudinaryService] Upload to Cloudinary failed, falling back:', err.message);
      // Fallback below
    }
  }

  // Smart fallback: If Cloudinary is not configured or fails, fileStr (data URI or URL) is stored directly
  console.log('[CloudinaryService] Using smart fallback for image storage.');
  return {
    url: fileStr,
    publicId: 'local_fallback_' + Date.now(),
    provider: 'fallback',
    note: 'Cloudinary credentials not configured or upload failed; stored as direct image source.'
  };
};

export const getCloudinaryStatus = () => ({
  configured: isConfigured,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || null
});

export default {
  uploadImage,
  getCloudinaryStatus
};
