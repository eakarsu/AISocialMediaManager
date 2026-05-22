const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

// User
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'editor', 'viewer'), defaultValue: 'admin' },
  avatar: { type: DataTypes.STRING },
});

// Social Account
const Account = sequelize.define('Account', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  platform: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false },
  displayName: { type: DataTypes.STRING },
  profileUrl: { type: DataTypes.STRING },
  followers: { type: DataTypes.INTEGER, defaultValue: 0 },
  following: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('connected', 'disconnected', 'expired'), defaultValue: 'connected' },
  avatarColor: { type: DataTypes.STRING, defaultValue: '#3B82F6' },
});

// Post
const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  platform: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'scheduled', 'published', 'failed'), defaultValue: 'draft' },
  scheduledAt: { type: DataTypes.DATE },
  publishedAt: { type: DataTypes.DATE },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments: { type: DataTypes.INTEGER, defaultValue: 0 },
  shares: { type: DataTypes.INTEGER, defaultValue: 0 },
  impressions: { type: DataTypes.INTEGER, defaultValue: 0 },
  mediaUrl: { type: DataTypes.STRING },
  aiGenerated: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Campaign
const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('active', 'paused', 'completed', 'draft'), defaultValue: 'draft' },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  budget: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  spent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  platform: { type: DataTypes.STRING },
  goal: { type: DataTypes.STRING },
  reach: { type: DataTypes.INTEGER, defaultValue: 0 },
  conversions: { type: DataTypes.INTEGER, defaultValue: 0 },
});

// Hashtag
const Hashtag = sequelize.define('Hashtag', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tag: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  popularity: { type: DataTypes.INTEGER, defaultValue: 0 },
  posts: { type: DataTypes.INTEGER, defaultValue: 0 },
  trending: { type: DataTypes.BOOLEAN, defaultValue: false },
  platform: { type: DataTypes.STRING },
  engagement: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
});

// Template
const Template = sequelize.define('Template', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING },
  platform: { type: DataTypes.STRING },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
});

// Analytics
const Analytics = sequelize.define('Analytics', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  platform: { type: DataTypes.STRING, allowNull: false },
  metric: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  category: { type: DataTypes.STRING },
});

// Competitor
const Competitor = sequelize.define('Competitor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  platform: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING },
  followers: { type: DataTypes.INTEGER, defaultValue: 0 },
  engagementRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  postFrequency: { type: DataTypes.STRING },
  topContent: { type: DataTypes.TEXT },
  strengths: { type: DataTypes.TEXT },
  weaknesses: { type: DataTypes.TEXT },
});

// Brand Voice
const BrandVoice = sequelize.define('BrandVoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  tone: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  keywords: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  avoidWords: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  examples: { type: DataTypes.TEXT },
  platform: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// Auto Reply
const AutoReply = sequelize.define('AutoReply', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  trigger: { type: DataTypes.STRING, allowNull: false },
  response: { type: DataTypes.TEXT, allowNull: false },
  platform: { type: DataTypes.STRING },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  triggerType: { type: DataTypes.ENUM('keyword', 'sentiment', 'mention', 'dm'), defaultValue: 'keyword' },
  usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  aiPowered: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Team Member
const TeamMember = sequelize.define('TeamMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'editor', 'viewer', 'manager'), defaultValue: 'editor' },
  department: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'inactive', 'pending'), defaultValue: 'active' },
  avatar: { type: DataTypes.STRING },
  lastActive: { type: DataTypes.DATE },
  permissions: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
});

// Report
const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('weekly', 'monthly', 'quarterly', 'custom'), defaultValue: 'monthly' },
  platform: { type: DataTypes.STRING },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  metrics: { type: DataTypes.JSONB, defaultValue: {} },
  status: { type: DataTypes.ENUM('generated', 'pending', 'failed'), defaultValue: 'generated' },
  summary: { type: DataTypes.TEXT },
});

// Scheduled Post (custom-views)
const ScheduledPost = sequelize.define('ScheduledPost', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  platform: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  imageUrl: { type: DataTypes.STRING },
  scheduledAt: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('queued', 'posted', 'failed'), defaultValue: 'queued' },
}, { tableName: 'scheduled_posts' });

// Approval Log (custom-views)
const ApprovalLog = sequelize.define('ApprovalLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  postId: { type: DataTypes.INTEGER, allowNull: false },
  decision: { type: DataTypes.ENUM('approved', 'rejected', 'edits_requested'), allowNull: false },
  comment: { type: DataTypes.TEXT },
  reviewer: { type: DataTypes.STRING },
}, { tableName: 'approval_log' });

// Associations
Account.belongsTo(User);
Post.belongsTo(User);
Post.belongsTo(Account);
Campaign.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Account,
  Post,
  Campaign,
  Hashtag,
  Template,
  Analytics,
  Competitor,
  BrandVoice,
  AutoReply,
  TeamMember,
  Report,
  ScheduledPost,
  ApprovalLog,
};
