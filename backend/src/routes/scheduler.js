const router = require('express').Router();
const auth = require('../middleware/auth');
const { Post } = require('../models');
const { Op } = require('sequelize');

// GET /api/scheduler/run - manually trigger scheduler (for testing)
router.get('/run', auth, async (req, res) => {
  try {
    const now = new Date();
    const posts = await Post.findAll({
      where: {
        status: 'scheduled',
        scheduledAt: { [Op.lte]: now }
      }
    });

    const published = [];
    for (const post of posts) {
      await post.update({ status: 'published', publishedAt: now });
      console.log(`[Scheduler Manual] Published post ID=${post.id} platform=${post.platform}`);
      published.push({ id: post.id, platform: post.platform });
    }

    res.json({
      message: `Scheduler ran successfully. ${published.length} post(s) published.`,
      published,
      checked_at: now.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scheduler/pending - get all pending scheduled posts
router.get('/pending', auth, async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: 'scheduled' },
      order: [['scheduledAt', 'ASC']]
    });
    res.json({ data: posts, count: posts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
