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

module.exports = { createReview, getReviews };
