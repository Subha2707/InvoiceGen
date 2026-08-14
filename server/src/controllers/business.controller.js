const BusinessProfile = require('../models/BusinessProfile');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findOne({ user: req.user._id });
  res.status(200).json(new ApiResponse(200, profile || {}, 'Profile retrieved'));
});

const updateProfile = asyncHandler(async (req, res) => {
  let profile = await BusinessProfile.findOne({ user: req.user._id });

  const updateData = { ...req.body };

  if (req.files) {
    const toFileData = (file) => ({
      data: file.buffer.toString('base64'),
      contentType: file.mimetype,
      fileName: file.originalname
    });
    if (req.files.logo && req.files.logo[0]) {
      updateData.logo = toFileData(req.files.logo[0]);
    }
    if (req.files.signature && req.files.signature[0]) {
      updateData.signature = toFileData(req.files.signature[0]);
    }
  }

  if (profile) {
    profile = await BusinessProfile.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
  } else {
    profile = await BusinessProfile.create({ ...updateData, user: req.user._id });
  }

  res.status(200).json(new ApiResponse(200, profile, 'Profile updated successfully'));
});

module.exports = {
  getProfile,
  updateProfile
};
