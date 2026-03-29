const Order = require('../models/Order');

const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sort || 'totalSpent';

    const pipeline = [
      { $match: { status: { $ne: 'canceled' } } },
      {
        $group: {
          _id: '$phone',
          name: { $last: '$name' },
          phone: { $first: '$phone' },
          email: { $last: '$email' },
          governorate: { $last: '$governorate' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ];

    if (req.query.search) {
      const s = req.query.search;
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: s, $options: 'i' } },
            { phone: { $regex: s, $options: 'i' } },
          ],
        },
      });
    }

    const sortMap = {
      totalSpent: { totalSpent: -1 },
      orderCount: { orderCount: -1 },
      lastOrderDate: { lastOrderDate: -1 },
      name: { name: 1 },
    };
    pipeline.push({ $sort: sortMap[sortBy] || { totalSpent: -1 } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push({ $skip: skip }, { $limit: limit });

    const [customers, countResult] = await Promise.all([
      Order.aggregate(pipeline),
      Order.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    res.json({ customers, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCustomers };
