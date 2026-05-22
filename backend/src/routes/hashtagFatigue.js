const router = require('express').Router();

router.post('/score', (req, res) => {
  const { repeatedTags = 0, postsLast7Days = 0, avgEngagementDropPct = 0, platformCount = 1 } = req.body || {};
  const score = Math.min(100, Math.round(
    Number(repeatedTags) * 7 +
    Math.max(0, Number(postsLast7Days) - Number(platformCount) * 5) * 3 +
    Number(avgEngagementDropPct) * 1.4
  ));
  res.json({
    feature: 'hashtag_fatigue_guard',
    score,
    level: score >= 70 ? 'rotate-now' : score >= 40 ? 'watch' : 'healthy',
    recommendations: [
      Number(repeatedTags) > 5 && 'Rotate recurring campaign tags with topic and audience-intent tags.',
      Number(avgEngagementDropPct) > 15 && 'Pause low-yield tags for one content cycle.',
      Number(postsLast7Days) > Number(platformCount) * 5 && 'Reduce tag density on repeated platforms.',
    ].filter(Boolean),
  });
});

module.exports = router;
