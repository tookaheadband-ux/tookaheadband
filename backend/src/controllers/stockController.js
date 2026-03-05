const StockSubscription = require('../models/StockSubscription');

// Public: subscribe to back-in-stock notification
const subscribeNotifyMe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await StockSubscription.findOneAndUpdate(
      { productId: req.params.id, email: email.toLowerCase() },
      { productId: req.params.id, email: email.toLowerCase(), notified: false },
      { upsert: true, new: true }
    );
    res.json({ message: 'You will be notified when this product is back in stock!' });
  } catch (err) {
    next(err);
  }
};

module.exports = { subscribeNotifyMe };
