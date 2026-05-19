const cron = require('node-cron');
const { Post } = require('../models');
const { Op } = require('sequelize');

let schedulerStarted = false;

function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const posts = await Post.findAll({
        where: {
          status: 'scheduled',
          scheduledAt: { [Op.lte]: now }
        }
      });

      if (posts.length === 0) return;

      console.log(`[Scheduler] Found ${posts.length} post(s) to publish`);

      for (const post of posts) {
        await post.update({
          status: 'published',
          publishedAt: now
        });
        console.log(`[Scheduler] Published post ID=${post.id} platform=${post.platform} at ${now.toISOString()}`);
      }
    } catch (err) {
      console.error('[Scheduler] Error:', err.message);
    }
  });

  console.log('[Scheduler] Post scheduler started - checking every minute');
}

module.exports = { startScheduler };
