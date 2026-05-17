const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');
const fs = require('fs');

// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    // If base64 payload is sent
    const { base64 } = req.body;
    if (base64) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(base64, {
          folder: 'crm_services',
        });
        return res.json({ success: true, url: uploadResponse.secure_url });
      } catch (err) {
        res.status(500);
        throw new Error('Base64 upload failed: ' + err.message);
      }
    }
    
    res.status(400);
    throw new Error('Please upload a file or provide a valid Base64 string');
  }

  // Upload local file to Cloudinary
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'crm_services',
    });

    // Remove file from local storage
    fs.unlinkSync(req.file.path);

    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500);
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
}));

module.exports = router;
