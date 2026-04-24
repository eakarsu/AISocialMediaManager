require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Account, Post, Campaign, Hashtag, Template, Analytics, Competitor, BrandVoice, AutoReply, TeamMember, Report } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('Database synced (force). Seeding...');

    // Users
    const password = await bcrypt.hash('password123', 10);
    const user = await User.create({ name: 'Admin User', email: 'admin@socialmgr.com', password, role: 'admin' });

    // Social Accounts (15)
    const accounts = await Account.bulkCreate([
      { platform: 'Twitter', username: '@techbrand', displayName: 'TechBrand Official', followers: 45200, following: 1200, status: 'connected', avatarColor: '#1DA1F2', UserId: user.id },
      { platform: 'Instagram', username: '@techbrand.ig', displayName: 'TechBrand', followers: 89400, following: 890, status: 'connected', avatarColor: '#E4405F', UserId: user.id },
      { platform: 'LinkedIn', username: 'techbrand-inc', displayName: 'TechBrand Inc.', followers: 32100, following: 450, status: 'connected', avatarColor: '#0A66C2', UserId: user.id },
      { platform: 'Facebook', username: 'TechBrandOfficial', displayName: 'TechBrand', followers: 67800, following: 200, status: 'connected', avatarColor: '#1877F2', UserId: user.id },
      { platform: 'TikTok', username: '@techbrand_tk', displayName: 'TechBrand', followers: 120500, following: 340, status: 'connected', avatarColor: '#000000', UserId: user.id },
      { platform: 'YouTube', username: 'TechBrandTV', displayName: 'TechBrand TV', followers: 28900, following: 150, status: 'connected', avatarColor: '#FF0000', UserId: user.id },
      { platform: 'Pinterest', username: 'techbrand_pins', displayName: 'TechBrand Pins', followers: 15600, following: 780, status: 'connected', avatarColor: '#BD081C', UserId: user.id },
      { platform: 'Twitter', username: '@techsupport', displayName: 'TechBrand Support', followers: 12300, following: 500, status: 'connected', avatarColor: '#1DA1F2', UserId: user.id },
      { platform: 'Instagram', username: '@techbrand.dev', displayName: 'TechBrand Developers', followers: 34200, following: 1100, status: 'connected', avatarColor: '#E4405F', UserId: user.id },
      { platform: 'LinkedIn', username: 'techbrand-careers', displayName: 'TechBrand Careers', followers: 18700, following: 320, status: 'connected', avatarColor: '#0A66C2', UserId: user.id },
      { platform: 'Reddit', username: 'u/techbrand_official', displayName: 'TechBrand', followers: 9800, following: 45, status: 'connected', avatarColor: '#FF4500', UserId: user.id },
      { platform: 'Threads', username: '@techbrand', displayName: 'TechBrand', followers: 7600, following: 290, status: 'connected', avatarColor: '#000000', UserId: user.id },
      { platform: 'Twitter', username: '@techbrand_eu', displayName: 'TechBrand Europe', followers: 8900, following: 670, status: 'disconnected', avatarColor: '#1DA1F2', UserId: user.id },
      { platform: 'Snapchat', username: 'techbrand_snap', displayName: 'TechBrand Snap', followers: 22100, following: 180, status: 'expired', avatarColor: '#FFFC00', UserId: user.id },
      { platform: 'Mastodon', username: '@techbrand@mastodon.social', displayName: 'TechBrand', followers: 3400, following: 210, status: 'connected', avatarColor: '#6364FF', UserId: user.id },
    ]);

    // Posts (15)
    await Post.bulkCreate([
      { content: 'Excited to announce our new AI-powered analytics dashboard! Track your social media performance like never before. #TechInnovation #AI', platform: 'Twitter', status: 'published', scheduledAt: new Date('2026-03-10'), publishedAt: new Date('2026-03-10'), likes: 342, comments: 45, shares: 89, impressions: 12400, UserId: user.id, AccountId: accounts[0].id },
      { content: 'Behind the scenes of our latest product photoshoot. Swipe to see the magic unfold! ✨📸', platform: 'Instagram', status: 'published', scheduledAt: new Date('2026-03-11'), publishedAt: new Date('2026-03-11'), likes: 1240, comments: 156, shares: 234, impressions: 34500, UserId: user.id, AccountId: accounts[1].id },
      { content: 'We\'re hiring! Join our growing team of innovators. Check out open positions in engineering, design, and marketing.', platform: 'LinkedIn', status: 'published', scheduledAt: new Date('2026-03-12'), publishedAt: new Date('2026-03-12'), likes: 567, comments: 89, shares: 312, impressions: 28900, UserId: user.id, AccountId: accounts[2].id },
      { content: 'Live Q&A session this Friday at 3 PM EST! Ask us anything about our new product line. Drop your questions below 👇', platform: 'Facebook', status: 'scheduled', scheduledAt: new Date('2026-03-21T15:00:00'), likes: 0, comments: 0, shares: 0, impressions: 0, UserId: user.id, AccountId: accounts[3].id },
      { content: 'POV: When your social media strategy finally starts working 😂📈 #SocialMediaManager #MarketingLife', platform: 'TikTok', status: 'published', scheduledAt: new Date('2026-03-09'), publishedAt: new Date('2026-03-09'), likes: 8900, comments: 567, shares: 1200, impressions: 145000, UserId: user.id, AccountId: accounts[4].id },
      { content: 'New tutorial: How to create stunning social media graphics in under 5 minutes. Link in description!', platform: 'YouTube', status: 'published', scheduledAt: new Date('2026-03-08'), publishedAt: new Date('2026-03-08'), likes: 456, comments: 78, shares: 123, impressions: 18700, UserId: user.id, AccountId: accounts[5].id },
      { content: '10 social media trends you need to know in 2026. Thread 🧵👇', platform: 'Twitter', status: 'published', scheduledAt: new Date('2026-03-07'), publishedAt: new Date('2026-03-07'), likes: 890, comments: 123, shares: 456, impressions: 45600, UserId: user.id, AccountId: accounts[0].id },
      { content: 'Customer spotlight: How @amazingbrand grew their following by 300% using our platform. Read the full case study!', platform: 'LinkedIn', status: 'draft', likes: 0, comments: 0, shares: 0, impressions: 0, UserId: user.id, AccountId: accounts[2].id },
      { content: 'Monday motivation: "The best marketing doesn\'t feel like marketing." – Tom Fishburne 💡', platform: 'Instagram', status: 'scheduled', scheduledAt: new Date('2026-03-24T09:00:00'), likes: 0, comments: 0, shares: 0, impressions: 0, UserId: user.id, AccountId: accounts[1].id },
      { content: 'Our content calendar template is now free to download! Perfect for planning your Q2 strategy. 📅', platform: 'Twitter', status: 'published', scheduledAt: new Date('2026-03-06'), publishedAt: new Date('2026-03-06'), likes: 234, comments: 34, shares: 167, impressions: 9800, UserId: user.id, AccountId: accounts[0].id },
      { content: 'Infographic: The anatomy of a perfect social media post. Save this for later! 📌', platform: 'Pinterest', status: 'published', scheduledAt: new Date('2026-03-05'), publishedAt: new Date('2026-03-05'), likes: 567, comments: 23, shares: 890, impressions: 23400, UserId: user.id, AccountId: accounts[6].id },
      { content: 'Breaking: Our AI content generator just got a major upgrade! Now supports 12 languages and custom brand voices. 🌍🤖', platform: 'Twitter', status: 'published', scheduledAt: new Date('2026-03-13'), publishedAt: new Date('2026-03-13'), likes: 678, comments: 89, shares: 234, impressions: 34500, UserId: user.id, AccountId: accounts[0].id, aiGenerated: true },
      { content: 'Weekend vibes at TechBrand HQ. Our team knows how to work hard and play hard! 🎉', platform: 'Instagram', status: 'draft', likes: 0, comments: 0, shares: 0, impressions: 0, UserId: user.id, AccountId: accounts[1].id },
      { content: 'AMA: We\'re answering your top questions about social media automation. Join the conversation!', platform: 'Reddit', status: 'scheduled', scheduledAt: new Date('2026-03-25T14:00:00'), likes: 0, comments: 0, shares: 0, impressions: 0, UserId: user.id, AccountId: accounts[10].id },
      { content: 'Throwback to our first office! From a garage startup to serving 10K+ businesses worldwide. The journey continues... 🚀', platform: 'Facebook', status: 'published', scheduledAt: new Date('2026-03-04'), publishedAt: new Date('2026-03-04'), likes: 1890, comments: 234, shares: 567, impressions: 78900, UserId: user.id, AccountId: accounts[3].id },
    ]);

    // Campaigns (15)
    await Campaign.bulkCreate([
      { name: 'Spring Product Launch', description: 'Launch campaign for our new spring product line', status: 'active', startDate: new Date('2026-03-01'), endDate: new Date('2026-04-30'), budget: 15000, spent: 7500, platform: 'Multi-platform', goal: 'Brand Awareness', reach: 450000, conversions: 2340, UserId: user.id },
      { name: 'Q1 Brand Awareness', description: 'Increase brand visibility across all platforms', status: 'active', startDate: new Date('2026-01-01'), endDate: new Date('2026-03-31'), budget: 25000, spent: 18900, platform: 'Instagram', goal: 'Reach', reach: 1200000, conversions: 5600, UserId: user.id },
      { name: 'Influencer Collaboration', description: 'Partner with micro-influencers for product reviews', status: 'active', startDate: new Date('2026-02-15'), endDate: new Date('2026-05-15'), budget: 20000, spent: 8900, platform: 'TikTok', goal: 'Engagement', reach: 890000, conversions: 3400, UserId: user.id },
      { name: 'Customer Testimonials', description: 'Collect and share customer success stories', status: 'active', startDate: new Date('2026-03-01'), endDate: new Date('2026-06-30'), budget: 5000, spent: 1200, platform: 'LinkedIn', goal: 'Social Proof', reach: 230000, conversions: 890, UserId: user.id },
      { name: 'Holiday Season Prep', description: 'Early preparation for holiday marketing', status: 'draft', startDate: new Date('2026-10-01'), endDate: new Date('2026-12-31'), budget: 50000, spent: 0, platform: 'Multi-platform', goal: 'Sales', reach: 0, conversions: 0, UserId: user.id },
      { name: 'Email List Growth', description: 'Social media campaign to grow email subscribers', status: 'completed', startDate: new Date('2026-01-01'), endDate: new Date('2026-02-28'), budget: 8000, spent: 7800, platform: 'Facebook', goal: 'Lead Generation', reach: 560000, conversions: 12000, UserId: user.id },
      { name: 'Video Content Series', description: 'Weekly video series on YouTube and TikTok', status: 'active', startDate: new Date('2026-02-01'), endDate: new Date('2026-07-31'), budget: 30000, spent: 12000, platform: 'YouTube', goal: 'Subscribers', reach: 670000, conversions: 4500, UserId: user.id },
      { name: 'Community Building', description: 'Build and engage online community', status: 'active', startDate: new Date('2026-01-15'), endDate: new Date('2026-12-31'), budget: 12000, spent: 3500, platform: 'Reddit', goal: 'Community', reach: 180000, conversions: 2300, UserId: user.id },
      { name: 'Webinar Promotion', description: 'Promote monthly webinar series', status: 'paused', startDate: new Date('2026-02-01'), endDate: new Date('2026-04-30'), budget: 6000, spent: 3200, platform: 'LinkedIn', goal: 'Registration', reach: 120000, conversions: 890, UserId: user.id },
      { name: 'User-Generated Content', description: 'Encourage customers to share their experiences', status: 'active', startDate: new Date('2026-03-01'), endDate: new Date('2026-08-31'), budget: 10000, spent: 2100, platform: 'Instagram', goal: 'Engagement', reach: 340000, conversions: 1500, UserId: user.id },
      { name: 'Podcast Launch', description: 'Promote new company podcast across social channels', status: 'draft', startDate: new Date('2026-04-01'), endDate: new Date('2026-06-30'), budget: 8000, spent: 0, platform: 'Twitter', goal: 'Downloads', reach: 0, conversions: 0, UserId: user.id },
      { name: 'Retargeting Campaign', description: 'Retarget website visitors on social media', status: 'active', startDate: new Date('2026-02-15'), endDate: new Date('2026-05-15'), budget: 18000, spent: 9600, platform: 'Facebook', goal: 'Conversions', reach: 780000, conversions: 6700, UserId: user.id },
      { name: 'SEO + Social Synergy', description: 'Align social content with SEO strategy', status: 'active', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), budget: 15000, spent: 4500, platform: 'Multi-platform', goal: 'Traffic', reach: 560000, conversions: 8900, UserId: user.id },
      { name: 'Event Promotion', description: 'Promote annual tech conference', status: 'draft', startDate: new Date('2026-06-01'), endDate: new Date('2026-09-15'), budget: 35000, spent: 0, platform: 'Multi-platform', goal: 'Ticket Sales', reach: 0, conversions: 0, UserId: user.id },
      { name: 'Brand Refresh Campaign', description: 'Announce and promote brand visual refresh', status: 'completed', startDate: new Date('2025-11-01'), endDate: new Date('2026-01-31'), budget: 22000, spent: 21500, platform: 'Multi-platform', goal: 'Brand Awareness', reach: 2300000, conversions: 15000, UserId: user.id },
    ]);

    // Hashtags (15)
    await Hashtag.bulkCreate([
      { tag: '#SocialMediaMarketing', category: 'Marketing', popularity: 9500000, posts: 450000, trending: true, platform: 'Instagram', engagement: 4.2 },
      { tag: '#ContentCreation', category: 'Content', popularity: 7800000, posts: 320000, trending: true, platform: 'TikTok', engagement: 5.1 },
      { tag: '#DigitalMarketing', category: 'Marketing', popularity: 12000000, posts: 890000, trending: false, platform: 'LinkedIn', engagement: 3.8 },
      { tag: '#AIMarketing', category: 'AI', popularity: 2300000, posts: 120000, trending: true, platform: 'Twitter', engagement: 6.7 },
      { tag: '#BrandStrategy', category: 'Strategy', popularity: 4500000, posts: 210000, trending: false, platform: 'LinkedIn', engagement: 4.5 },
      { tag: '#SocialMediaTips', category: 'Tips', popularity: 6700000, posts: 380000, trending: true, platform: 'Instagram', engagement: 5.3 },
      { tag: '#MarketingAutomation', category: 'Automation', popularity: 3200000, posts: 150000, trending: false, platform: 'Twitter', engagement: 3.9 },
      { tag: '#GrowthHacking', category: 'Growth', popularity: 5600000, posts: 270000, trending: false, platform: 'Twitter', engagement: 4.1 },
      { tag: '#InfluencerMarketing', category: 'Marketing', popularity: 8900000, posts: 560000, trending: true, platform: 'Instagram', engagement: 5.8 },
      { tag: '#VideoMarketing', category: 'Video', popularity: 4100000, posts: 190000, trending: true, platform: 'TikTok', engagement: 7.2 },
      { tag: '#ContentStrategy', category: 'Strategy', popularity: 3800000, posts: 180000, trending: false, platform: 'LinkedIn', engagement: 4.0 },
      { tag: '#SocialMediaManager', category: 'Career', popularity: 2900000, posts: 140000, trending: false, platform: 'Twitter', engagement: 3.5 },
      { tag: '#EmailMarketing', category: 'Marketing', popularity: 5200000, posts: 240000, trending: false, platform: 'LinkedIn', engagement: 3.2 },
      { tag: '#EcommerceTips', category: 'Ecommerce', popularity: 3400000, posts: 160000, trending: true, platform: 'Instagram', engagement: 4.8 },
      { tag: '#PersonalBranding', category: 'Branding', popularity: 6100000, posts: 290000, trending: true, platform: 'LinkedIn', engagement: 5.5 },
    ]);

    // Templates (15)
    await Template.bulkCreate([
      { name: 'Product Launch Announcement', content: '🚀 Introducing [Product Name]! We\'re thrilled to share our latest innovation that [benefit]. Available now at [link]. #NewLaunch #Innovation', category: 'Launch', platform: 'Twitter', usageCount: 145, tags: ['launch', 'product', 'announcement'] },
      { name: 'Customer Testimonial', content: '"[Quote from customer]" – [Customer Name], [Title] at [Company]. Thank you for the kind words! 🙏 #CustomerLove #Testimonial', category: 'Social Proof', platform: 'LinkedIn', usageCount: 89, tags: ['testimonial', 'review', 'social-proof'] },
      { name: 'Behind the Scenes', content: 'Take a peek behind the curtain! 👀 Here\'s what our team has been working on. [Description] #BTS #TeamWork', category: 'Culture', platform: 'Instagram', usageCount: 234, tags: ['bts', 'culture', 'team'] },
      { name: 'Quick Tip', content: '💡 Quick Tip: [Tip content]. Did you know this? Share with someone who needs to hear this! #Tips #ProTip', category: 'Educational', platform: 'Twitter', usageCount: 312, tags: ['tip', 'educational', 'value'] },
      { name: 'Weekly Poll', content: '📊 Poll time! [Question]?\n\nA) [Option A]\nB) [Option B]\nC) [Option C]\nD) [Option D]\n\nVote below! 👇', category: 'Engagement', platform: 'Twitter', usageCount: 178, tags: ['poll', 'engagement', 'interactive'] },
      { name: 'Holiday Greeting', content: 'Happy [Holiday]! 🎉 From our team to yours, we wish you [greeting]. [CTA] #Happy[Holiday]', category: 'Holiday', platform: 'Multi-platform', usageCount: 67, tags: ['holiday', 'greeting', 'seasonal'] },
      { name: 'Blog Promotion', content: '📝 New on the blog: "[Blog Title]"\n\n[Brief summary in 1-2 sentences]\n\nRead more: [link] #Blog #[Topic]', category: 'Content', platform: 'LinkedIn', usageCount: 198, tags: ['blog', 'content', 'promotion'] },
      { name: 'Milestone Celebration', content: '🎉 We just hit [milestone]! Thank you to our amazing community for being part of this journey. Here\'s to the next [goal]! #Milestone #Grateful', category: 'Celebration', platform: 'Instagram', usageCount: 56, tags: ['milestone', 'celebration', 'community'] },
      { name: 'Industry News', content: '📰 Breaking: [News headline]. Here\'s what this means for [industry/audience]: [Brief analysis]. Thoughts? 👇 #IndustryNews #[Topic]', category: 'News', platform: 'Twitter', usageCount: 123, tags: ['news', 'industry', 'trending'] },
      { name: 'How-To Guide', content: '📋 How to [achieve goal] in [X] easy steps:\n\n1️⃣ [Step 1]\n2️⃣ [Step 2]\n3️⃣ [Step 3]\n\nSave this for later! 🔖 #HowTo #Guide', category: 'Educational', platform: 'Instagram', usageCount: 267, tags: ['howto', 'guide', 'educational'] },
      { name: 'Event Promotion', content: '📅 Mark your calendars! [Event name] is happening on [date]. [Brief description]. Register now: [link] #Event #[EventName]', category: 'Event', platform: 'LinkedIn', usageCount: 89, tags: ['event', 'promotion', 'registration'] },
      { name: 'Flash Sale', content: '⚡ FLASH SALE! [Discount]% off [product/service] for the next [time]. Use code: [CODE]. Don\'t miss out! 🏃 #Sale #Deal', category: 'Sales', platform: 'Instagram', usageCount: 345, tags: ['sale', 'discount', 'promotion'] },
      { name: 'Team Spotlight', content: '👋 Meet [Name], our [Role]! [Fun fact or brief bio]. [Name] is passionate about [interest]. Welcome to the team! #TeamSpotlight #WelcomeAboard', category: 'Culture', platform: 'LinkedIn', usageCount: 78, tags: ['team', 'culture', 'spotlight'] },
      { name: 'Motivational Quote', content: '"[Quote]" – [Author] 💭\n\n[Brief personal reflection]. What motivates you today? #MondayMotivation #Inspiration', category: 'Inspiration', platform: 'Instagram', usageCount: 456, tags: ['quote', 'motivation', 'inspiration'] },
      { name: 'Product Comparison', content: '⚖️ [Product A] vs [Product B]: Which is right for you?\n\n✅ [Feature 1]\n✅ [Feature 2]\n✅ [Feature 3]\n\nFull comparison: [link] #Comparison', category: 'Educational', platform: 'Twitter', usageCount: 134, tags: ['comparison', 'product', 'educational'] },
    ]);

    // Analytics (15)
    const analyticsData = [];
    const metrics = ['followers', 'engagement', 'impressions', 'clicks', 'shares'];
    const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'];
    for (let i = 0; i < 15; i++) {
      const d = new Date('2026-03-01');
      d.setDate(d.getDate() + i);
      analyticsData.push({
        platform: platforms[i % 5],
        metric: metrics[i % 5],
        value: Math.floor(Math.random() * 10000) + 1000,
        date: d.toISOString().split('T')[0],
        category: 'daily',
      });
    }
    await Analytics.bulkCreate(analyticsData);

    // Competitors (15)
    await Competitor.bulkCreate([
      { name: 'Hootsuite', platform: 'Multi-platform', username: '@hootsuite', followers: 890000, engagementRate: 3.2, postFrequency: '5-8 posts/day', topContent: 'Social media tips and product updates', strengths: 'Market leader, strong brand recognition, comprehensive feature set', weaknesses: 'Higher pricing, complex interface for beginners' },
      { name: 'Buffer', platform: 'Multi-platform', username: '@buffer', followers: 560000, engagementRate: 4.1, postFrequency: '3-5 posts/day', topContent: 'Transparency reports, social media advice', strengths: 'Simple UI, transparent company culture, affordable', weaknesses: 'Fewer advanced features, limited analytics' },
      { name: 'Sprout Social', platform: 'Multi-platform', username: '@sproutsocial', followers: 340000, engagementRate: 3.8, postFrequency: '4-6 posts/day', topContent: 'Industry reports, feature announcements', strengths: 'Enterprise features, excellent reporting, CRM integration', weaknesses: 'Premium pricing, steep learning curve' },
      { name: 'Later', platform: 'Instagram', username: '@latermedia', followers: 670000, engagementRate: 5.2, postFrequency: '6-10 posts/day', topContent: 'Visual content tips, Instagram strategies', strengths: 'Visual-first approach, Linkin.bio feature, UGC tools', weaknesses: 'Instagram-focused, limited multi-platform support' },
      { name: 'Canva', platform: 'Multi-platform', username: '@canva', followers: 1200000, engagementRate: 4.5, postFrequency: '8-12 posts/day', topContent: 'Design templates, creative inspiration', strengths: 'Design + social in one, massive template library', weaknesses: 'Not a dedicated SMM tool, basic scheduling' },
      { name: 'HubSpot Social', platform: 'Multi-platform', username: '@hubspot', followers: 780000, engagementRate: 3.5, postFrequency: '5-7 posts/day', topContent: 'Marketing tips, CRM integrations', strengths: 'All-in-one marketing suite, CRM integration', weaknesses: 'Expensive, social is secondary feature' },
      { name: 'Sendible', platform: 'Multi-platform', username: '@sendible', followers: 45000, engagementRate: 2.8, postFrequency: '2-3 posts/day', topContent: 'Agency tips, product features', strengths: 'Agency-focused, white-label options', weaknesses: 'Smaller user base, limited AI features' },
      { name: 'Agorapulse', platform: 'Multi-platform', username: '@agorapulse', followers: 89000, engagementRate: 3.9, postFrequency: '3-5 posts/day', topContent: 'Social media ROI, management tips', strengths: 'Social inbox, ROI tracking, team collaboration', weaknesses: 'Mid-tier pricing, fewer integrations' },
      { name: 'SocialBee', platform: 'Multi-platform', username: '@socialbee', followers: 34000, engagementRate: 4.3, postFrequency: '2-4 posts/day', topContent: 'Content recycling tips, scheduling strategies', strengths: 'Content categories, recycling, AI writer', weaknesses: 'Smaller company, less enterprise support' },
      { name: 'CoSchedule', platform: 'Multi-platform', username: '@coschedule', followers: 67000, engagementRate: 3.1, postFrequency: '3-5 posts/day', topContent: 'Marketing calendar tips, headline analysis', strengths: 'Marketing calendar, headline analyzer', weaknesses: 'Content-focused, limited social features' },
      { name: 'Loomly', platform: 'Multi-platform', username: '@loomly', followers: 28000, engagementRate: 3.6, postFrequency: '1-3 posts/day', topContent: 'Content ideas, approval workflows', strengths: 'Clean UI, content suggestions, approval flows', weaknesses: 'Limited analytics, fewer integrations' },
      { name: 'Zoho Social', platform: 'Multi-platform', username: '@zohosocial', followers: 56000, engagementRate: 2.5, postFrequency: '2-4 posts/day', topContent: 'Business tips, Zoho ecosystem features', strengths: 'Zoho ecosystem integration, affordable', weaknesses: 'Less modern UI, limited AI capabilities' },
      { name: 'Tailwind', platform: 'Pinterest', username: '@tailaboratories', followers: 120000, engagementRate: 4.8, postFrequency: '3-5 posts/day', topContent: 'Pinterest & Instagram strategies', strengths: 'Pinterest-first, SmartSchedule, communities', weaknesses: 'Limited to Pinterest/Instagram, niche tool' },
      { name: 'Brandwatch', platform: 'Multi-platform', username: '@brandwatch', followers: 145000, engagementRate: 3.3, postFrequency: '4-6 posts/day', topContent: 'Consumer insights, trend analysis', strengths: 'Advanced listening, consumer intelligence', weaknesses: 'Enterprise pricing, complex setup' },
      { name: 'Planable', platform: 'Multi-platform', username: '@plaaboratable', followers: 22000, engagementRate: 4.0, postFrequency: '2-3 posts/day', topContent: 'Content planning, team collaboration', strengths: 'Visual planning, approval workflows, collaboration', weaknesses: 'Newer product, limited analytics' },
    ]);

    // Brand Voice (15)
    await BrandVoice.bulkCreate([
      { name: 'Professional Corporate', tone: 'Professional', description: 'Formal, authoritative tone for B2B communications', keywords: ['innovative', 'solutions', 'enterprise', 'scalable', 'strategic'], avoidWords: ['cheap', 'basic', 'simple'], examples: 'We deliver enterprise-grade solutions that drive measurable business outcomes.', platform: 'LinkedIn', isActive: true },
      { name: 'Casual & Friendly', tone: 'Casual', description: 'Relaxed, approachable tone for social engagement', keywords: ['awesome', 'love', 'amazing', 'fun', 'hey'], avoidWords: ['pursuant', 'heretofore', 'synergy'], examples: 'Hey there! We just dropped something awesome you\'re gonna love 🎉', platform: 'Instagram', isActive: true },
      { name: 'Witty & Humorous', tone: 'Humorous', description: 'Clever, funny tone for viral content', keywords: ['plot twist', 'ngl', 'basically', 'lowkey'], avoidWords: ['serious', 'formal', 'corporate'], examples: 'POV: You just realized our product does what 5 other tools can\'t 😏', platform: 'TikTok', isActive: true },
      { name: 'Inspirational Leader', tone: 'Inspirational', description: 'Motivating, thought-leadership voice', keywords: ['transform', 'empower', 'journey', 'vision', 'believe'], avoidWords: ['impossible', 'can\'t', 'never'], examples: 'Every great brand started with a single bold idea. What\'s yours?', platform: 'LinkedIn', isActive: true },
      { name: 'Technical Expert', tone: 'Technical', description: 'Knowledgeable, detail-oriented voice for tech content', keywords: ['API', 'integration', 'architecture', 'performance', 'optimize'], avoidWords: ['magic', 'easy-peasy', 'no-brainer'], examples: 'Our new API endpoint reduces latency by 40% with optimized query caching.', platform: 'Twitter', isActive: true },
      { name: 'Empathetic Support', tone: 'Empathetic', description: 'Caring, understanding voice for customer support', keywords: ['understand', 'help', 'together', 'care', 'appreciate'], avoidWords: ['unfortunately', 'can\'t', 'policy'], examples: 'We hear you, and we\'re here to help. Let\'s work through this together.', platform: 'Multi-platform', isActive: true },
      { name: 'Bold & Edgy', tone: 'Bold', description: 'Provocative, attention-grabbing voice', keywords: ['disrupt', 'revolutionize', 'game-changer', 'bold', 'fearless'], avoidWords: ['maybe', 'possibly', 'traditional'], examples: 'Stop playing it safe. Your competitors aren\'t waiting – why are you?', platform: 'Twitter', isActive: false },
      { name: 'Educational Mentor', tone: 'Educational', description: 'Teaching-focused voice for how-to content', keywords: ['learn', 'discover', 'step-by-step', 'master', 'guide'], avoidWords: ['obviously', 'everyone knows', 'duh'], examples: 'Let\'s break this down step by step. First, you\'ll want to...', platform: 'YouTube', isActive: true },
      { name: 'Community Builder', tone: 'Community', description: 'Inclusive, community-focused voice', keywords: ['together', 'community', 'join', 'share', 'collective'], avoidWords: ['exclusive', 'elite', 'limited'], examples: 'This is YOUR community. Share your wins, your struggles, your ideas. We grow together.', platform: 'Facebook', isActive: true },
      { name: 'Luxury Premium', tone: 'Luxury', description: 'Sophisticated, premium brand voice', keywords: ['curated', 'bespoke', 'exclusive', 'refined', 'artisanal'], avoidWords: ['cheap', 'discount', 'budget'], examples: 'Discover our meticulously curated collection, designed for the discerning professional.', platform: 'Instagram', isActive: false },
      { name: 'Gen Z Native', tone: 'GenZ', description: 'Trendy, meme-aware voice for younger audiences', keywords: ['slay', 'vibe', 'no cap', 'bussin', 'fr fr'], avoidWords: ['groovy', 'rad', 'hip'], examples: 'this new feature is bussin no cap 🔥 your content game is about to be unmatched fr', platform: 'TikTok', isActive: true },
      { name: 'Data-Driven', tone: 'Analytical', description: 'Numbers-focused, evidence-based voice', keywords: ['data', 'metrics', 'ROI', 'analytics', 'benchmark'], avoidWords: ['gut feeling', 'maybe', 'might'], examples: 'The data is clear: brands using AI scheduling see a 47% increase in engagement.', platform: 'LinkedIn', isActive: true },
      { name: 'Storyteller', tone: 'Narrative', description: 'Story-driven voice for emotional connection', keywords: ['story', 'journey', 'chapter', 'once upon', 'imagine'], avoidWords: ['metrics', 'KPI', 'optimize'], examples: 'It all started in a small apartment with a big dream and a WiFi connection...', platform: 'Instagram', isActive: true },
      { name: 'Minimalist', tone: 'Minimalist', description: 'Clean, concise voice with maximum impact', keywords: ['simple', 'clean', 'essential', 'focus', 'clarity'], avoidWords: ['furthermore', 'additionally', 'moreover'], examples: 'Less noise. More impact. That\'s our promise.', platform: 'Twitter', isActive: true },
      { name: 'Eco-Conscious', tone: 'Sustainable', description: 'Environmentally aware, purpose-driven voice', keywords: ['sustainable', 'planet', 'green', 'impact', 'conscious'], avoidWords: ['disposable', 'wasteful', 'greenwashing'], examples: 'Every post we schedule is powered by 100% renewable energy. Small steps, big impact. 🌱', platform: 'Instagram', isActive: true },
    ]);

    // Auto Replies (15)
    await AutoReply.bulkCreate([
      { name: 'Welcome DM', trigger: 'new follower', response: 'Welcome to our community! 🎉 Thanks for following. Check out our latest content and feel free to reach out anytime!', platform: 'Instagram', isActive: true, triggerType: 'mention', usageCount: 2340, aiPowered: false },
      { name: 'Pricing Inquiry', trigger: 'pricing,cost,price,how much', response: 'Thanks for your interest in our pricing! We have flexible plans starting at $30/mo. Visit our website for full details or DM us for a custom quote!', platform: 'Multi-platform', isActive: true, triggerType: 'keyword', usageCount: 567, aiPowered: false },
      { name: 'Support Redirect', trigger: 'help,support,issue,problem,bug', response: 'We\'re sorry to hear you\'re having trouble! Our support team is ready to help. Please reach out at support@techbrand.com or visit our help center.', platform: 'Twitter', isActive: true, triggerType: 'keyword', usageCount: 890, aiPowered: false },
      { name: 'Positive Sentiment Response', trigger: 'positive sentiment detected', response: 'Thank you so much for the kind words! Your support means the world to us. 💙', platform: 'Multi-platform', isActive: true, triggerType: 'sentiment', usageCount: 1230, aiPowered: true },
      { name: 'Negative Sentiment Handler', trigger: 'negative sentiment detected', response: 'We appreciate your feedback and take it seriously. Could you DM us with more details so we can make things right?', platform: 'Multi-platform', isActive: true, triggerType: 'sentiment', usageCount: 456, aiPowered: true },
      { name: 'Business Hours', trigger: 'hours,open,available,when', response: 'Our team is available Monday-Friday, 9 AM - 6 PM EST. For urgent matters outside these hours, email urgent@techbrand.com.', platform: 'Multi-platform', isActive: true, triggerType: 'keyword', usageCount: 234, aiPowered: false },
      { name: 'Demo Request', trigger: 'demo,trial,try,test', response: 'Great choice! You can start a free 14-day trial at our website, or book a personalized demo with our team. Which would you prefer?', platform: 'LinkedIn', isActive: true, triggerType: 'keyword', usageCount: 345, aiPowered: false },
      { name: 'Feature Request', trigger: 'feature,suggest,wish,would be nice', response: 'Love the suggestion! We\'re always looking to improve. I\'ve noted your feedback and shared it with our product team. Keep the ideas coming!', platform: 'Twitter', isActive: true, triggerType: 'keyword', usageCount: 178, aiPowered: false },
      { name: 'Collaboration Inquiry', trigger: 'collaborate,partner,sponsor,collab', response: 'We love collaborations! Please send your proposal to partnerships@techbrand.com and our team will review it within 48 hours.', platform: 'Instagram', isActive: true, triggerType: 'keyword', usageCount: 123, aiPowered: false },
      { name: 'Thank You Response', trigger: 'thank,thanks,appreciate', response: 'You\'re welcome! Happy to help. Don\'t hesitate to reach out if you need anything else. 😊', platform: 'Multi-platform', isActive: true, triggerType: 'keyword', usageCount: 890, aiPowered: false },
      { name: 'AI Smart Reply', trigger: 'any unhandled message', response: 'AI-generated contextual response', platform: 'Multi-platform', isActive: true, triggerType: 'dm', usageCount: 3450, aiPowered: true },
      { name: 'Contest Entry', trigger: 'enter,contest,giveaway,win', response: 'To enter our current giveaway: 1) Follow us 2) Like this post 3) Tag 2 friends. Winner announced Friday! 🎁', platform: 'Instagram', isActive: false, triggerType: 'keyword', usageCount: 567, aiPowered: false },
      { name: 'Job Inquiry', trigger: 'hiring,job,career,work,position', response: 'We\'re always looking for talented people! Check our current openings at careers.techbrand.com. Feel free to apply directly!', platform: 'LinkedIn', isActive: true, triggerType: 'keyword', usageCount: 234, aiPowered: false },
      { name: 'Mention Alert', trigger: '@techbrand mentioned', response: 'Thanks for mentioning us! We appreciate the shoutout. Let us know if there\'s anything we can help with!', platform: 'Twitter', isActive: true, triggerType: 'mention', usageCount: 678, aiPowered: false },
      { name: 'After Hours', trigger: 'message received after 6PM', response: 'Thanks for reaching out! Our team is currently offline but we\'ll get back to you first thing tomorrow morning. For urgent issues, email urgent@techbrand.com.', platform: 'Multi-platform', isActive: true, triggerType: 'dm', usageCount: 345, aiPowered: false },
    ]);

    // Team Members (15)
    await TeamMember.bulkCreate([
      { name: 'Sarah Johnson', email: 'sarah@techbrand.com', role: 'admin', department: 'Marketing', status: 'active', lastActive: new Date('2026-03-17'), permissions: ['all'] },
      { name: 'Mike Chen', email: 'mike@techbrand.com', role: 'editor', department: 'Content', status: 'active', lastActive: new Date('2026-03-17'), permissions: ['posts', 'templates', 'calendar'] },
      { name: 'Emily Davis', email: 'emily@techbrand.com', role: 'manager', department: 'Social Media', status: 'active', lastActive: new Date('2026-03-16'), permissions: ['posts', 'accounts', 'analytics', 'campaigns'] },
      { name: 'James Wilson', email: 'james@techbrand.com', role: 'editor', department: 'Design', status: 'active', lastActive: new Date('2026-03-17'), permissions: ['posts', 'templates'] },
      { name: 'Lisa Brown', email: 'lisa@techbrand.com', role: 'viewer', department: 'Sales', status: 'active', lastActive: new Date('2026-03-15'), permissions: ['analytics', 'reports'] },
      { name: 'David Kim', email: 'david@techbrand.com', role: 'editor', department: 'Content', status: 'active', lastActive: new Date('2026-03-17'), permissions: ['posts', 'hashtags', 'templates'] },
      { name: 'Anna Martinez', email: 'anna@techbrand.com', role: 'manager', department: 'Marketing', status: 'active', lastActive: new Date('2026-03-16'), permissions: ['all'] },
      { name: 'Tom Harris', email: 'tom@techbrand.com', role: 'editor', department: 'Video', status: 'active', lastActive: new Date('2026-03-14'), permissions: ['posts', 'campaigns'] },
      { name: 'Rachel Lee', email: 'rachel@techbrand.com', role: 'viewer', department: 'Executive', status: 'active', lastActive: new Date('2026-03-13'), permissions: ['analytics', 'reports', 'dashboard'] },
      { name: 'Chris Taylor', email: 'chris@techbrand.com', role: 'editor', department: 'Community', status: 'active', lastActive: new Date('2026-03-17'), permissions: ['posts', 'auto-replies'] },
      { name: 'Jessica White', email: 'jessica@techbrand.com', role: 'editor', department: 'Content', status: 'inactive', lastActive: new Date('2026-02-28'), permissions: ['posts', 'templates'] },
      { name: 'Ryan Clark', email: 'ryan@techbrand.com', role: 'manager', department: 'Analytics', status: 'active', lastActive: new Date('2026-03-17'), permissions: ['analytics', 'reports', 'competitors'] },
      { name: 'Sophie Anderson', email: 'sophie@techbrand.com', role: 'editor', department: 'Social Media', status: 'pending', lastActive: null, permissions: ['posts'] },
      { name: 'Kevin Wright', email: 'kevin@techbrand.com', role: 'viewer', department: 'Product', status: 'active', lastActive: new Date('2026-03-12'), permissions: ['dashboard', 'analytics'] },
      { name: 'Megan Thompson', email: 'megan@techbrand.com', role: 'admin', department: 'Engineering', status: 'active', lastActive: new Date('2026-03-17'), permissions: ['all'] },
    ]);

    // Reports (15)
    await Report.bulkCreate([
      { name: 'March 2026 Weekly Report W1', type: 'weekly', platform: 'Multi-platform', startDate: '2026-03-01', endDate: '2026-03-07', metrics: { followers: 15200, engagement: 4.2, impressions: 250000, clicks: 3500, newFollowers: 890 }, status: 'generated', summary: 'Strong week with 4.2% engagement rate. TikTok content outperformed other platforms by 3x.' },
      { name: 'March 2026 Weekly Report W2', type: 'weekly', platform: 'Multi-platform', startDate: '2026-03-08', endDate: '2026-03-14', metrics: { followers: 16100, engagement: 3.8, impressions: 280000, clicks: 4200, newFollowers: 900 }, status: 'generated', summary: 'Slight dip in engagement but impressions up 12%. LinkedIn thought leadership posts driving quality leads.' },
      { name: 'February 2026 Monthly Report', type: 'monthly', platform: 'Multi-platform', startDate: '2026-02-01', endDate: '2026-02-28', metrics: { followers: 14300, engagement: 4.5, impressions: 980000, clicks: 14500, newFollowers: 3200 }, status: 'generated', summary: 'Best month for engagement. Video content strategy on TikTok yielded 145K impressions on top post.' },
      { name: 'January 2026 Monthly Report', type: 'monthly', platform: 'Multi-platform', startDate: '2026-01-01', endDate: '2026-01-31', metrics: { followers: 11100, engagement: 3.9, impressions: 750000, clicks: 11200, newFollowers: 2800 }, status: 'generated', summary: 'Solid start to the year. Brand refresh campaign drove significant awareness boost.' },
      { name: 'Q4 2025 Quarterly Report', type: 'quarterly', platform: 'Multi-platform', startDate: '2025-10-01', endDate: '2025-12-31', metrics: { followers: 8300, engagement: 3.5, impressions: 2100000, clicks: 32000, newFollowers: 5600 }, status: 'generated', summary: 'Holiday campaigns exceeded expectations. 67% increase in conversions vs Q3.' },
      { name: 'Instagram Performance March', type: 'monthly', platform: 'Instagram', startDate: '2026-03-01', endDate: '2026-03-17', metrics: { followers: 89400, engagement: 5.1, impressions: 450000, reels: 12, stories: 45 }, status: 'generated', summary: 'Instagram continues to be our top performer. Reels averaging 8K views each.' },
      { name: 'Twitter Analytics March', type: 'monthly', platform: 'Twitter', startDate: '2026-03-01', endDate: '2026-03-17', metrics: { followers: 45200, engagement: 3.2, impressions: 320000, retweets: 890, mentions: 234 }, status: 'generated', summary: 'Thread content performing well. AI marketing thread went viral with 45K impressions.' },
      { name: 'LinkedIn B2B Report', type: 'monthly', platform: 'LinkedIn', startDate: '2026-03-01', endDate: '2026-03-17', metrics: { followers: 32100, engagement: 4.8, impressions: 180000, clicks: 5600, leads: 89 }, status: 'generated', summary: 'LinkedIn generating highest quality leads. Thought leadership posts driving 5x more engagement than promotional content.' },
      { name: 'TikTok Growth Report', type: 'monthly', platform: 'TikTok', startDate: '2026-03-01', endDate: '2026-03-17', metrics: { followers: 120500, engagement: 7.2, impressions: 890000, views: 1200000, shares: 5600 }, status: 'generated', summary: 'Explosive growth on TikTok. Follower count up 15% this month. Short-form educational content resonating strongly.' },
      { name: 'Campaign ROI Report', type: 'custom', platform: 'Multi-platform', startDate: '2026-01-01', endDate: '2026-03-17', metrics: { totalSpend: 82400, totalRevenue: 245000, roi: 197, campaigns: 15, topCampaign: 'Spring Product Launch' }, status: 'generated', summary: 'Overall 197% ROI across all campaigns. Spring Product Launch is the top performer with 340% ROI.' },
      { name: 'Competitor Benchmark Q1', type: 'quarterly', platform: 'Multi-platform', startDate: '2026-01-01', endDate: '2026-03-31', metrics: { ourEngagement: 4.2, avgCompetitor: 3.5, ourGrowth: 12, avgGrowth: 8 }, status: 'generated', summary: 'Outperforming competitors by 20% in engagement. Growth rate 50% above industry average.' },
      { name: 'Content Performance Analysis', type: 'custom', platform: 'Multi-platform', startDate: '2026-02-01', endDate: '2026-03-17', metrics: { totalPosts: 156, avgEngagement: 4.1, topType: 'Video', worstType: 'Text-only', bestTime: '10 AM EST' }, status: 'generated', summary: 'Video content drives 3x more engagement. Best posting time is 10 AM EST across platforms.' },
      { name: 'Audience Demographics', type: 'custom', platform: 'Multi-platform', startDate: '2026-03-01', endDate: '2026-03-17', metrics: { age_18_24: 22, age_25_34: 38, age_35_44: 25, age_45_plus: 15, male: 45, female: 52, other: 3 }, status: 'generated', summary: 'Core audience is 25-34 year olds. Slight female skew at 52%. Growing Gen Z audience on TikTok.' },
      { name: 'Facebook Ads Performance', type: 'monthly', platform: 'Facebook', startDate: '2026-03-01', endDate: '2026-03-17', metrics: { spend: 4500, impressions: 560000, clicks: 8900, cpc: 0.51, ctr: 1.59, conversions: 234 }, status: 'generated', summary: 'Facebook ads delivering solid CPC at $0.51. Retargeting campaigns outperforming cold audiences 3:1.' },
      { name: 'YouTube Channel Report', type: 'monthly', platform: 'YouTube', startDate: '2026-03-01', endDate: '2026-03-17', metrics: { subscribers: 28900, views: 145000, watchTime: 8900, avgDuration: '4:32', topVideo: 'AI Social Media Tips 2026' }, status: 'pending', summary: 'Report generation in progress for YouTube channel metrics.' },
    ]);

    console.log('Seed data inserted successfully!');
    console.log('Login: admin@socialmgr.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
