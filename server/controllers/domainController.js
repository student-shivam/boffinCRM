const Domain = require('../models/Domain');
const { logActivity, getPagination } = require('../utils/helpers');

const getDomains = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { search, status } = req.query;
    let query = {};
    if (search) query.domainName = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    const total = await Domain.countDocuments(query);
    const domains = await Domain.find(query).populate('client', 'name').sort({ expiryDate: 1 }).skip(skip).limit(limit);
    res.json({ success: true, data: domains, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDomain = async (req, res) => {
  try {
    const domain = await Domain.create(req.body);
    await logActivity('CREATE', 'Domain', `Domain "${domain.domainName}" added`);
    res.status(201).json({ success: true, data: domain });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDomain = async (req, res) => {
  try {
    const domain = await Domain.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!domain) return res.status(404).json({ success: false, message: 'Domain not found' });
    await logActivity('UPDATE', 'Domain', `Domain "${domain.domainName}" updated`);
    res.json({ success: true, data: domain });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDomain = async (req, res) => {
  try {
    const domain = await Domain.findByIdAndDelete(req.params.id);
    if (!domain) return res.status(404).json({ success: false, message: 'Domain not found' });
    await logActivity('DELETE', 'Domain', `Domain "${domain.domainName}" deleted`);
    res.json({ success: true, message: 'Domain deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDomains, createDomain, updateDomain, deleteDomain };
