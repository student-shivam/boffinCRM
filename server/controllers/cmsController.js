const CMSPage = require('../models/CMSPage');
const { logActivity } = require('../utils/helpers');

const getPages = async (req, res) => {
  try {
    const pages = await CMSPage.find().sort({ pageName: 1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPage = async (req, res) => {
  try {
    const page = await CMSPage.findOne({ pageName: req.params.pageName });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPage = async (req, res) => {
  try {
    const page = await CMSPage.create(req.body);
    await logActivity('CREATE', 'CMS', `Page "${page.pageName}" created`);
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePage = async (req, res) => {
  try {
    const page = await CMSPage.findOneAndUpdate({ pageName: req.params.pageName }, req.body, { new: true, runValidators: true, upsert: true });
    await logActivity('UPDATE', 'CMS', `Page "${page.pageName}" updated`);
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePage = async (req, res) => {
  try {
    const page = await CMSPage.findOneAndDelete({ pageName: req.params.pageName });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    await logActivity('DELETE', 'CMS', `Page "${page.pageName}" deleted`);
    res.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPages, getPage, createPage, updatePage, deletePage };
