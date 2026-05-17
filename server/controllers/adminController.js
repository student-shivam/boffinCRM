const Admin = require('../models/Admin');
const { logActivity } = require('../utils/helpers');

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update admin profile details
// @route   PUT /api/admin/profile
// @access  Private (Admin)
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    const {
      fullName,
      phone,
      designation,
      bio,
      profileImage,
      
      companyName,
      companyEmail,
      companyPhone,
      companyWebsite,
      gstNumber,
      companyLogo,
      businessCategory,
      companyAddress,

      socialLinks,
      
      address,
      city,
      state,
      country,
      pincode
    } = req.body;

    // Direct synchronization with legacy fields to prevent breaking any queries
    if (fullName) {
      admin.fullName = fullName;
      admin.name = fullName; // legacy name sync
    }
    if (profileImage !== undefined) {
      admin.profileImage = profileImage;
      admin.avatar = profileImage; // legacy avatar sync
    }

    if (phone !== undefined) admin.phone = phone;
    if (designation !== undefined) admin.designation = designation;
    if (bio !== undefined) admin.bio = bio;

    // Company Settings
    if (companyName !== undefined) admin.companyName = companyName;
    if (companyEmail !== undefined) admin.companyEmail = companyEmail;
    if (companyPhone !== undefined) admin.companyPhone = companyPhone;
    if (companyWebsite !== undefined) admin.companyWebsite = companyWebsite;
    if (gstNumber !== undefined) admin.gstNumber = gstNumber;
    if (companyLogo !== undefined) admin.companyLogo = companyLogo;
    if (businessCategory !== undefined) admin.businessCategory = businessCategory;
    if (companyAddress !== undefined) admin.companyAddress = companyAddress;

    // Social Links
    if (socialLinks !== undefined) {
      admin.socialLinks = {
        ...admin.socialLinks,
        ...socialLinks
      };
    }

    // Address
    if (address !== undefined) admin.address = address;
    if (city !== undefined) admin.city = city;
    if (state !== undefined) admin.state = state;
    if (country !== undefined) admin.country = country;
    if (pincode !== undefined) admin.pincode = pincode;

    await admin.save();
    await logActivity('UPDATE', 'Admin Profile', 'Admin updated profile details');

    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change admin password securely
// @route   PUT /api/admin/change-password
// @access  Private (Admin)
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password entered is incorrect' });
    }

    // Hash is handled in Admin schema pre-save hook
    admin.password = newPassword;
    admin.passwordChangedAt = Date.now();
    await admin.save();

    await logActivity('SECURITY', 'Password Change', 'Admin password changed successfully');
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword
};
