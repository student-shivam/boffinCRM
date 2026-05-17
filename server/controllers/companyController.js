const Company = require('../models/Company');
const { logActivity } = require('../utils/helpers');

// @desc    Get company settings
// @route   GET /api/company
// @access  Private (Authenticated users)
const getCompanyDetails = async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      // Auto-create initial default company settings
      company = await Company.create({});
    }
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update company settings
// @route   PUT /api/company
// @access  Private/Admin
const updateCompanyDetails = async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = new Company({});
    }

    const {
      companyName,
      companyLogo,
      companyEmail,
      companyPhone,
      companyAddress,
      website,
      gstNumber,
      panNumber,
      signature,
      stamp,
      themeColor
    } = req.body;

    if (companyName !== undefined) company.companyName = companyName;
    if (companyLogo !== undefined) company.companyLogo = companyLogo;
    if (companyEmail !== undefined) company.companyEmail = companyEmail;
    if (companyPhone !== undefined) company.companyPhone = companyPhone;
    if (companyAddress !== undefined) company.companyAddress = companyAddress;
    if (website !== undefined) company.website = website;
    if (gstNumber !== undefined) company.gstNumber = gstNumber;
    if (panNumber !== undefined) company.panNumber = panNumber;
    if (signature !== undefined) company.signature = signature;
    if (stamp !== undefined) company.stamp = stamp;
    if (themeColor !== undefined) company.themeColor = themeColor;

    await company.save();

    // Log Activity
    await logActivity('UPDATE', 'Company Settings', `Updated company settings for ${company.companyName}`);

    res.json({
      success: true,
      data: company,
      message: 'Company settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompanyDetails,
  updateCompanyDetails
};
