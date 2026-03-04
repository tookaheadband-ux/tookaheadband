const Page = require('../models/Page');

// Public: get page by slug
const getPage = async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

// Admin: update page by slug
const updatePage = async (req, res, next) => {
  try {
    const { titleAr, titleEn, contentAr, contentEn } = req.body;

    let page = await Page.findOne({ slug: req.params.slug });

    if (!page) {
      page = new Page({ slug: req.params.slug });
    }

    if (titleAr !== undefined) page.titleAr = titleAr;
    if (titleEn !== undefined) page.titleEn = titleEn;
    if (contentAr !== undefined) page.contentAr = contentAr;
    if (contentEn !== undefined) page.contentEn = contentEn;

    // Handle images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => f.path);
      const existingImages = req.body.existingImages
        ? (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages])
        : [];
      page.images = [...existingImages, ...newImages];
    } else if (req.body.existingImages !== undefined) {
      page.images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
    }

    await page.save();
    res.json(page);
  } catch (err) {
    next(err);
  }
};

module.exports = { getPage, updatePage };
