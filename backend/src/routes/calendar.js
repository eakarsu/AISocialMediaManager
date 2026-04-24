const router = require('express').Router();
const auth = require('../middleware/auth');
const { Post } = require('../models');
const { Op } = require('sequelize');

router.get('/', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = {};
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      where.scheduledAt = { [Op.between]: [start, end] };
    }
    const posts = await Post.findAll({ where, order: [['scheduledAt', 'ASC']] });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
