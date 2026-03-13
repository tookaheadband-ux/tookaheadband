const Review = require('../models/Review');

// Public: create a review
const createReview = async (req, res, next) => {
  try {
    const { name, rating, comment } = req.body;
    if (!name || !rating) return res.status(400).json({ message: 'Name and rating are required' });

    const review = await Review.create({
      productId: req.params.id,
      name,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment || '',
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// Public: get reviews for a product
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 }).limit(50);
    const count = reviews.length;
    const avgRating = count > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0;
    res.json({ reviews, count, avgRating: Number(avgRating) });
  } catch (err) {
    next(err);
  }
};

// Admin: get all reviews (with product info)
const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, rating, search } = req.query;
    const filter = {};
    if (rating) filter.rating = Number(rating);

    let reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('productId', 'nameAr nameEn images sku');

    if (search) {
      const regex = new RegExp(search, 'i');
      reviews = reviews.filter(r => regex.test(r.name) || regex.test(r.comment));
    }

    const total = await Review.countDocuments(filter);
    res.json({ reviews, total, totalPages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    next(err);
  }
};

// Admin: delete a review
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getReviews, getAllReviews, deleteReview };
