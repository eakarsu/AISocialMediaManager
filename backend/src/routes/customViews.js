const router = require('express').Router();
const auth = require('../middleware/auth');
const { ScheduledPost, ApprovalLog, Post } = require('../models');
const { Op } = require('sequelize');

// Deterministic pseudo-random generator so data is stable per day
function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PLATFORMS = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'];

// GET /api/custom-views/engagement-timeline
// Returns 30 days of likes/comments/shares per platform
router.get('/engagement-timeline', auth, (req, res) => {
  try {
    const days = 30;
    const today = new Date();
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      const row = { date: dayKey };
      PLATFORMS.forEach((p, pi) => {
        const rand = seededRand((d.getDate() + 1) * 31 + pi * 7 + d.getMonth() * 11);
        // base + noise + weekly pattern
        const base = 80 + pi * 25;
        const wk = Math.sin((d.getDate() + pi) / 4) * 25;
        row[`${p}_likes`] = Math.max(0, Math.round(base + wk + rand() * 120));
        row[`${p}_comments`] = Math.max(0, Math.round((base + wk) * 0.18 + rand() * 30));
        row[`${p}_shares`] = Math.max(0, Math.round((base + wk) * 0.12 + rand() * 22));
      });
      data.push(row);
    }
    res.json({ platforms: PLATFORMS, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/custom-views/follower-growth
// Returns 30 days of cumulative followers per platform
router.get('/follower-growth', auth, (req, res) => {
  try {
    const days = 30;
    const today = new Date();
    const data = [];
    const starting = { Instagram: 12500, Twitter: 8400, Facebook: 15800, LinkedIn: 4200, TikTok: 6900 };
    const running = { ...starting };
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      const row = { date: dayKey };
      PLATFORMS.forEach((p, pi) => {
        const rand = seededRand((d.getDate() + 1) * 17 + pi * 5 + d.getMonth() * 13);
        const dailyGain = Math.max(0, Math.round(20 + pi * 8 + rand() * 70));
        running[p] += dailyGain;
        row[p] = running[p];
      });
      data.push(row);
    }
    res.json({ platforms: PLATFORMS, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST SCHEDULER WITH CALENDAR
// ---------------------------------------------------------------------------

// POST /api/custom-views/schedule-post  { platform, content, imageUrl, scheduledAt }
router.post('/schedule-post', auth, async (req, res) => {
  try {
    const { platform, content, imageUrl, scheduledAt } = req.body || {};
    if (!platform || !content || !scheduledAt) {
      return res.status(400).json({ error: 'platform, content, scheduledAt are required' });
    }
    const row = await ScheduledPost.create({
      platform,
      content,
      imageUrl: imageUrl || null,
      scheduledAt: new Date(scheduledAt),
      status: 'queued',
    });
    res.json({ success: true, scheduled: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/custom-views/scheduled-posts  -> upcoming list
router.get('/scheduled-posts', auth, async (req, res) => {
  try {
    const rows = await ScheduledPost.findAll({
      order: [['scheduledAt', 'ASC']],
      limit: 100,
    });
    res.json({ scheduled: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// CONTENT APPROVAL WORKFLOW
// ---------------------------------------------------------------------------

// GET /api/custom-views/approval-queue  -> posts in draft/scheduled awaiting approval
router.get('/approval-queue', auth, async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: { [Op.in]: ['draft', 'scheduled'] } },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    // attach last decision if any
    const ids = posts.map((p) => p.id);
    const logs = ids.length
      ? await ApprovalLog.findAll({
          where: { postId: { [Op.in]: ids } },
          order: [['createdAt', 'DESC']],
        })
      : [];
    const lastByPost = {};
    logs.forEach((l) => {
      if (!lastByPost[l.postId]) lastByPost[l.postId] = l;
    });
    const queue = posts.map((p) => ({
      id: p.id,
      content: p.content,
      platform: p.platform,
      status: p.status,
      scheduledAt: p.scheduledAt,
      lastDecision: lastByPost[p.id] || null,
    }));
    res.json({ queue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/custom-views/approval-decision  { post_id, decision, comment }
router.post('/approval-decision', auth, async (req, res) => {
  try {
    const { post_id, decision, comment } = req.body || {};
    const valid = ['approved', 'rejected', 'edits_requested'];
    if (!post_id || !valid.includes(decision)) {
      return res.status(400).json({
        error: `post_id and decision (${valid.join('|')}) are required`,
      });
    }
    const log = await ApprovalLog.create({
      postId: Number(post_id),
      decision,
      comment: comment || null,
      reviewer: req.user?.email || 'unknown',
    });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
