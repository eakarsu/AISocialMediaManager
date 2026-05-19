require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const { generalLimiter } = require('./middleware/rateLimiter');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', generalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/hashtags', require('./routes/hashtags'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/competitors', require('./routes/competitors'));
app.use('/api/brand-voice', require('./routes/brandVoice'));
app.use('/api/auto-replies', require('./routes/autoReplies'));
app.use('/api/team', require('./routes/team'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/scheduler', require('./routes/scheduler'));
app.use('/api/custom-views', require('./routes/customViews'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    // Fixed: use force: false to avoid dropping tables
    await sequelize.sync({ force: false });
    console.log('Database synced');

    // Start post scheduler
    startScheduler();

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// AI feature mount: viral-scorer
app.use('/api/ai/viral-scorer', require('./routes/ai-viral-scorer'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-postingtimeoptimizer-engagementbased', require('./routes/gap-no-postingtimeoptimizer-engagementbased'));
app.use('/api/gap-no-contentmixrecommender', require('./routes/gap-no-contentmixrecommender'));
app.use('/api/gap-no-competitorcontentswipe-topperforming-anal', require('./routes/gap-no-competitorcontentswipe-topperforming-anal'));
app.use('/api/gap-no-influencerfinder', require('./routes/gap-no-influencerfinder'));
app.use('/api/gap-no-audiencesentimentanalysis-aggregate-perce', require('./routes/gap-no-audiencesentimentanalysis-aggregate-perce'));
app.use('/api/gap-no-platform-api-integration-to-actually-publ', require('./routes/gap-no-platform-api-integration-to-actually-publ'));
app.use('/api/gap-no-commentdm-management-routes', require('./routes/gap-no-commentdm-management-routes'));
app.use('/api/gap-no-employee-advocacy-program', require('./routes/gap-no-employee-advocacy-program'));
app.use('/api/gap-no-paid-advertising-management', require('./routes/gap-no-paid-advertising-management'));
app.use('/api/gap-no-influencer-outreach-workflow', require('./routes/gap-no-influencer-outreach-workflow'));
app.use('/api/gap-no-crisis-detectionalerts-on-social-listenin', require('./routes/gap-no-crisis-detectionalerts-on-social-listenin'));
// === End Batch 07 ===
