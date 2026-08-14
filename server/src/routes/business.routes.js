const express = require('express');
const { getProfile, updateProfile } = require('../controllers/business.controller');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

router.get('/', protect, getProfile);
router.put('/', protect, upload, updateProfile);

module.exports = router;
