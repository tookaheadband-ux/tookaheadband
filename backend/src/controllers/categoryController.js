const Category = require('../models/Category');

// Public: get all categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// Admin: create category
const createCategory = async (req, res, next) => {
  try {
    const { nameAr, nameEn, slug } = req.body;
    const coverImage = req.file ? req.file.path : '';

    const category = await Category.create({ nameAr, nameEn, slug, coverImage });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// Admin: update category
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const { nameAr, nameEn, slug } = req.body;
    if (nameAr !== undefined) category.nameAr = nameAr;
    if (nameEn !== undefined) category.nameEn = nameEn;
    if (slug !== undefined) category.slug = slug;
    if (req.file) category.coverImage = req.file.path;

    await category.save();
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Admin: delete category
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
