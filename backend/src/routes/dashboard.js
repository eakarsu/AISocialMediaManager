const router = require('express').Router();
const auth = require('../middleware/auth');
const { Post, Account, Campaign, Analytics } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

router.get('/stats', auth, async (req, res) => {
  try {
    const totalPosts = await Post.count();
    const publishedPosts = await Post.count({ where: { status: 'published' } });
    const scheduledPosts = await Post.count({ where: { status: 'scheduled' } });
    const totalAccounts = await Account.count();
    const activeCampaigns = await Campaign.count({ where: { status: 'active' } });
    const totalLikes = await Post.sum('likes') || 0;
    const totalComments = await Post.sum('comments') || 0;
    const totalShares = await Post.sum('shares') || 0;
    const totalImpressions = await Post.sum('impressions') || 0;

    res.json({
      totalPosts,
      publishedPosts,
      scheduledPosts,
      totalAccounts,
      activeCampaigns,
      totalLikes,
      totalComments,
      totalShares,
      totalImpressions,
      engagementRate: totalImpressions > 0 ? (((totalLikes + totalComments + totalShares) / totalImpressions) * 100).toFixed(2) : 0,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/recent-posts', auth, async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
