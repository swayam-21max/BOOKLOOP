const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure storage for Books
const bookStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bookloop/books',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

// Configure storage for Profile Pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bookloop/profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

const uploadBooks = multer({ storage: bookStorage });
const uploadProfile = multer({ storage: profileStorage });

// Helper to delete assets from Cloudinary
const deleteFromCloudinary = async (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return;
  try {
    // Extract public ID: bookloop/folder/filename (without extension)
    // Matches: https://res.cloudinary.com/cloudname/image/upload/v123/bookloop/folder/id.jpg
    const parts = url.split('/');
    const identifier = parts.slice(-3).join('/').split('.')[0];
    await cloudinary.uploader.destroy(identifier);
  } catch (err) {
    console.error('Cloudinary Deletion Error:', err);
  }
};

module.exports = { uploadBooks, uploadProfile, deleteFromCloudinary };
