require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
