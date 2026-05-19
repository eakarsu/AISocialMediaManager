const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openrouter');
const { BrandVoice, Post, Campaign, Analytics, AutoReply, Competitor, sequelize } = require('../models');
const { Op } = require('sequelize');

// Initialize ai_results table
sequelize.query(`
  CREATE TABLE IF NOT EXISTS ai_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(100),
    input_data JSONB,
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

// Parse AI JSON from response
function parseAIJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) {
    let cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
    }
    return null;
  }
}

async function persistAIResult(userId, endpoint, inputData, result) {
  try {
    await sequelize.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES (:userId, :endpoint, :inputData, :result)`,
      { replacements: { userId: userId || null, endpoint, inputData: JSON.stringify(inputData), result: JSON.stringify(result) } }
    );
  } catch (e) { console.error('persistAIResult:', e.message); }
}

// Generate social media post content
router.post('/generate-post', auth, aiRateLimiter, async (req, res) => {
  try {
    const { topic, platform, tone, length } = req.body;

    // Fetch brand voice for DB-grounded prompt
    const brandVoices = await BrandVoice.findAll({ where: { isActive: true }, limit: 3 });
    const brandContext = brandVoices.length > 0
      ? `Brand Voice Context: ${brandVoices.map(bv => `${bv.name} (${bv.tone}): ${bv.description}`).join('; ')}`
      : '';

    const prompt = `Generate a ${tone || 'professional'} social media post for ${platform || 'Twitter'} about "${topic}".
${length === 'short' ? 'Keep it under 100 characters.' : length === 'long' ? 'Make it detailed, 200-300 characters.' : 'Keep it medium length, 100-200 characters.'}
${brandContext}
Respond ONLY with JSON:
{
  "generated_text": "...",
  "hashtags": ["#tag1", "#tag2"],
  "engagement_tips": ["..."],
  "best_post_time": "e.g. Tuesday 10am EST"
}`;

    const result = await callOpenRouter(prompt, 'You are an expert social media content creator. Respond ONLY with valid JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON', raw: result.content });
    await persistAIResult(req.user.id, 'generate-post', { topic, platform, tone }, parsed);
    res.json({ success: true, ...parsed, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate hashtags
router.post('/generate-hashtags', auth, aiRateLimiter, async (req, res) => {
  try {
    const { topic, platform, count } = req.body;
    const prompt = `Generate ${count || 10} relevant hashtags for a ${platform || 'Instagram'} post about "${topic}".
Respond ONLY with JSON: { "hashtags": ["#tag1"], "trending_tags": ["#trend1"], "niche_tags": ["#niche1"] }`;
    const result = await callOpenRouter(prompt, 'You are a social media hashtag expert. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'generate-hashtags', { topic, platform }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate image caption
router.post('/generate-caption', auth, aiRateLimiter, async (req, res) => {
  try {
    const { description, platform, mood } = req.body;
    const prompt = `Generate an engaging ${mood || 'inspiring'} image caption for ${platform || 'Instagram'} for: "${description}".
Respond ONLY with JSON: { "caption": "...", "hashtags": ["#tag1"], "emojis": ["emoji1"], "cta": "call to action" }`;
    const result = await callOpenRouter(prompt, 'You are a creative caption writer. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'generate-caption', { description, platform }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Analyze competitor - DB-grounded with Competitor table
router.post('/analyze-competitor', auth, aiRateLimiter, async (req, res) => {
  try {
    const { competitorName, platform, industry } = req.body;
    const dbCompetitors = await Competitor.findAll({ where: { name: { [Op.iLike]: `%${competitorName}%` } }, limit: 3 });
    const dbContext = dbCompetitors.length > 0
      ? `Existing competitor data: ${JSON.stringify(dbCompetitors.map(c => ({ name: c.name, platform: c.platform, followers: c.followers, engagementRate: c.engagementRate, strengths: c.strengths })))}`
      : '';

    const prompt = `Analyze "${competitorName}" on ${platform || 'all platforms'} in ${industry || 'general'} industry.
${dbContext}
Respond ONLY with JSON:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "content_strategy": "...",
  "engagement_tactics": ["..."],
  "recommendations": ["..."],
  "threat_level": "High|Medium|Low",
  "opportunities": ["..."]
}`;

    const result = await callOpenRouter(prompt, 'You are a social media competitive intelligence expert. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'analyze-competitor', { competitorName, platform }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate auto-reply
router.post('/generate-reply', auth, aiRateLimiter, async (req, res) => {
  try {
    const { message, tone, context } = req.body;
    const autoReplies = await AutoReply.findAll({ where: { isActive: true }, limit: 5 });
    const brandVoices = await BrandVoice.findAll({ where: { isActive: true }, limit: 2 });
    const brandContext = brandVoices.length > 0 ? `Brand voice: ${brandVoices[0].tone} - ${brandVoices[0].description}` : '';

    const prompt = `Generate a ${tone || 'friendly'} reply for: "${message}". Context: ${context || 'customer inquiry'}.
${brandContext}
Existing auto-reply patterns: ${JSON.stringify(autoReplies.map(ar => ({ trigger: ar.trigger, response: ar.response })).slice(0, 3))}
Respond ONLY with JSON: { "generated_text": "...", "hashtags": [], "engagement_tips": ["..."], "best_post_time": "" }`;

    const result = await callOpenRouter(prompt, 'You are a community manager. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'generate-reply', { message }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Calendar suggestions - structured JSON 30-day calendar
router.post('/calendar-suggestions', auth, aiRateLimiter, async (req, res) => {
  try {
    const { industry, platforms, days } = req.body;
    const brandVoices = await BrandVoice.findAll({ where: { isActive: true }, limit: 3 });
    const campaigns = await Campaign.findAll({ where: { status: 'active' }, limit: 5 });

    const prompt = `Generate a ${days || 7}-day social media content calendar for a ${industry || 'technology'} company.
Platforms: ${platforms?.join(', ') || 'Instagram, Twitter, LinkedIn'}
Brand Voices: ${JSON.stringify(brandVoices.map(bv => ({ name: bv.name, tone: bv.tone })))}
Active Campaigns: ${JSON.stringify(campaigns.map(c => ({ name: c.name, goal: c.goal })))}
Respond ONLY with JSON:
{
  "calendar": [
    {"date": "2024-01-01", "platform": "Instagram", "content": "...", "hashtags": ["#tag"], "type": "educational|promotional|engagement", "best_time": "10:00 AM"}
  ],
  "strategy_notes": "..."
}`;

    const result = await callOpenRouter(prompt, 'You are a content calendar strategist. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'calendar-suggestions', { industry, platforms, days }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Brand voice analysis - DB-grounded
router.post('/analyze-brand-voice', auth, aiRateLimiter, async (req, res) => {
  try {
    const { sampleText, brandName } = req.body;
    const existingVoices = await BrandVoice.findAll({ limit: 5 });

    const prompt = `Analyze brand voice for "${brandName || 'the brand'}".
Sample text: "${sampleText}"
Existing brand voice records: ${JSON.stringify(existingVoices.map(bv => ({ name: bv.name, tone: bv.tone, keywords: bv.keywords })))}
Respond ONLY with JSON:
{
  "tone_scores": {"formal": 0-100, "casual": 0-100, "enthusiastic": 0-100, "authoritative": 0-100, "empathetic": 0-100},
  "key_themes": ["..."],
  "keywords": ["..."],
  "avoid_words": ["..."],
  "recommendations": ["..."],
  "consistency_score": 0-100,
  "summary": "..."
}`;

    const result = await callOpenRouter(prompt, 'You are a brand voice expert. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'analyze-brand-voice', { sampleText, brandName }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate report summary
router.post('/report-summary', auth, aiRateLimiter, async (req, res) => {
  try {
    const { metrics, period, platform } = req.body;
    const analyticsData = await Analytics.findAll({
      where: platform ? { platform } : {},
      order: [['date', 'DESC']],
      limit: 20
    });

    const prompt = `Generate an executive social media report summary.
Period: ${period || 'monthly'}, Platform: ${platform || 'all platforms'}
Metrics: ${JSON.stringify(metrics || {})}
Analytics DB Data: ${JSON.stringify(analyticsData.map(a => ({ platform: a.platform, metric: a.metric, value: a.value, date: a.date })))}
Respond ONLY with JSON:
{
  "highlights": ["..."],
  "improvements_needed": ["..."],
  "recommendations": ["..."],
  "top_performing_content": "...",
  "growth_rate": "...",
  "summary": "..."
}`;

    const result = await callOpenRouter(prompt, 'You are a social media analytics expert. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'report-summary', { period, platform }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// NEW: 30-day content calendar generator
router.post('/generate-calendar', auth, aiRateLimiter, async (req, res) => {
  try {
    const { startDate, industry } = req.body;
    const brandVoices = await BrandVoice.findAll({ where: { isActive: true }, limit: 3 });
    const campaigns = await Campaign.findAll({ where: { status: { [Op.in]: ['active', 'draft'] } }, limit: 5 });

    const prompt = `Generate a 30-day social media content calendar starting from ${startDate || new Date().toISOString().split('T')[0]}.
Industry: ${industry || 'technology'}
Brand Voices: ${JSON.stringify(brandVoices.map(bv => ({ tone: bv.tone, keywords: bv.keywords })))}
Active Campaigns: ${JSON.stringify(campaigns.map(c => ({ name: c.name, goal: c.goal, startDate: c.startDate, endDate: c.endDate })))}
Respond ONLY with JSON:
{
  "calendar": [
    {"date": "YYYY-MM-DD", "platform": "Instagram|Twitter|LinkedIn|Facebook", "content": "...", "hashtags": ["#tag"], "type": "educational|promotional|engagement|entertainment", "best_time": "10:00 AM EST"}
  ]
}
Generate exactly 30 entries.`;

    const result = await callOpenRouter(prompt, 'You are a content calendar strategist. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON', raw: result.content?.substring(0, 200) });
    await persistAIResult(req.user.id, 'generate-calendar', { startDate, industry }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// NEW: Performance analyzer
router.post('/analyze-performance', auth, aiRateLimiter, async (req, res) => {
  try {
    const analyticsData = await Analytics.findAll({ order: [['date', 'DESC']], limit: 50 });
    const posts = await Post.findAll({
      order: [['likes', 'DESC']],
      limit: 10,
      attributes: ['id', 'content', 'platform', 'likes', 'comments', 'shares', 'impressions', 'status', 'publishedAt']
    });

    const prompt = `Analyze social media performance and identify top vs bottom performing posts. Respond ONLY with JSON:
Analytics Data (last 50 records): ${JSON.stringify(analyticsData.map(a => ({ platform: a.platform, metric: a.metric, value: a.value, date: a.date })))}
Top Posts by Likes: ${JSON.stringify(posts.map(p => ({ id: p.id, platform: p.platform, likes: p.likes, comments: p.comments, shares: p.shares, impressions: p.impressions })))}

Return:
{
  "top_performers": [{"post_id": 0, "reason": "..."}],
  "bottom_performers": [{"post_id": 0, "reason": "..."}],
  "engagement_patterns": "...",
  "best_platforms": ["..."],
  "best_post_times": {"platform": "time"},
  "content_type_performance": {"educational": 0, "promotional": 0, "engagement": 0},
  "strategy_recommendations": ["..."],
  "overall_health": "Strong|Good|Needs Improvement|Poor",
  "summary": "..."
}`;

    const result = await callOpenRouter(prompt, 'You are a social media analytics expert. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'analyze-performance', {}, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// NEW: Auto-reply suggester
router.post('/suggest-reply', auth, aiRateLimiter, async (req, res) => {
  try {
    const { comment, platform, context } = req.body;
    if (!comment) return res.status(400).json({ error: 'comment is required' });

    const autoReplies = await AutoReply.findAll({ where: { isActive: true }, limit: 5 });
    const brandVoices = await BrandVoice.findAll({ where: { isActive: true }, limit: 2 });

    const prompt = `Suggest a contextual reply for this ${platform || 'social media'} comment: "${comment}"
Context: ${context || 'general engagement'}
Brand voice: ${brandVoices.length > 0 ? `${brandVoices[0].tone} - ${brandVoices[0].description}` : 'Professional and friendly'}
Existing auto-reply triggers: ${JSON.stringify(autoReplies.map(ar => ar.trigger))}
Respond ONLY with JSON:
{
  "generated_text": "...",
  "hashtags": [],
  "engagement_tips": ["don't add hashtags to replies", "keep it personal"],
  "best_post_time": "",
  "tone": "...",
  "alternative_replies": ["reply 1", "reply 2"]
}`;

    const result = await callOpenRouter(prompt, 'You are a community manager. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'suggest-reply', { comment, platform }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Posting time optimizer — when to post for engagement
router.post('/posting-time-optimizer', auth, aiRateLimiter, async (req, res) => {
  try {
    const { platform, audienceTimezone, contentType } = req.body;
    const recentAnalytics = await Analytics.findAll({ limit: 50, order: [['createdAt', 'DESC']] }).catch(() => []);
    const analyticsContext = recentAnalytics.length
      ? `Recent analytics signal: ${JSON.stringify(recentAnalytics.slice(0, 10).map(a => ({ platform: a.platform, metric: a.metric, value: a.value, recordedAt: a.recordedAt })))}`
      : '';
    const prompt = `Recommend the optimal posting times for ${platform || 'Instagram'} content of type "${contentType || 'general'}" in audience timezone "${audienceTimezone || 'EST'}".
${analyticsContext}
Respond ONLY with JSON:
{
  "best_times": [{"day": "Monday", "time": "10:00", "rationale": "..."}],
  "worst_times": [{"day": "...", "time": "...", "rationale": "..."}],
  "weekly_cadence": "<posts/week>",
  "notes": "..."
}`;
    const result = await callOpenRouter(prompt, 'You are a social media engagement timing expert. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'posting-time-optimizer', { platform, audienceTimezone, contentType }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Content mix recommender — balance of content types
router.post('/content-mix-recommender', auth, aiRateLimiter, async (req, res) => {
  try {
    const { platform, businessGoals, brandFocus } = req.body;
    const prompt = `Recommend an optimal content mix (educational, promotional, entertaining, user-generated, behind-the-scenes, etc.) for ${platform || 'Instagram'}.
Goals: ${businessGoals || 'general engagement'}
Brand focus: ${brandFocus || 'general'}
Respond ONLY with JSON:
{
  "mix": [{"type": "educational", "percent": 40, "rationale": "..."}],
  "cadence": {"posts_per_week": <number>, "stories_per_week": <number>},
  "rationale": "...",
  "watch_outs": ["..."]
}`;
    const result = await callOpenRouter(prompt, 'You are a content strategy expert. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'content-mix-recommender', { platform, businessGoals, brandFocus }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Audience sentiment analysis — overall perception across recent activity
router.post('/audience-sentiment-analysis', auth, aiRateLimiter, async (req, res) => {
  try {
    const { brand, platform, sampleComments } = req.body;
    const recentReplies = await AutoReply.findAll({ limit: 30, order: [['createdAt', 'DESC']] }).catch(() => []);
    const replyContext = recentReplies.length
      ? `Recent replies sample: ${JSON.stringify(recentReplies.slice(0, 10).map(r => ({ trigger: r.trigger, response: r.response })))}`
      : '';
    const prompt = `Assess overall audience sentiment toward "${brand || 'the brand'}" on ${platform || 'social media'}.
${replyContext}
${sampleComments ? `Sample comments: ${JSON.stringify(sampleComments).slice(0, 4000)}` : ''}
Respond ONLY with JSON:
{
  "overall_sentiment": "positive|neutral|negative|mixed",
  "score": <-1.0..1.0>,
  "themes": [{"theme": "...", "sentiment": "...", "mentions": <number>}],
  "risks": ["..."],
  "opportunities": ["..."],
  "summary": "..."
}`;
    const result = await callOpenRouter(prompt, 'You are an audience sentiment analyst. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'audience-sentiment-analysis', { brand, platform }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Competitor content swipe — pull from Competitor model and surface swipe-worthy ideas
router.post('/competitor-content-swipe', auth, aiRateLimiter, async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: 'OPENROUTER_API_KEY is not configured. AI features unavailable.' });
  try {
    const { competitorIds, platform, count = 5 } = req.body;
    const where = competitorIds && competitorIds.length ? { id: { [Op.in]: competitorIds } } : {};
    const competitors = await Competitor.findAll({ where, limit: 20, order: [['createdAt', 'DESC']] });
    if (!competitors.length) return res.status(404).json({ error: 'No competitors found' });
    const ctx = competitors.slice(0, 10).map(c => `name=${c.name || c.handle || '?'} platform=${c.platform || '?'} notes=${(c.notes || c.description || '').toString().slice(0, 120)}`).join('; ');
    const prompt = `Generate ${count} swipe-worthy content ideas inspired by these competitors for ${platform || 'Instagram'}. Adapt — do not copy.

Competitors: ${ctx}

Respond ONLY with JSON:
{
  "swipes": [{"idea": "...", "format": "...", "hook": "...", "inspired_by": "<competitor name>", "differentiator": "..."}],
  "themes": ["..."],
  "warnings": ["..."]
}`;
    const result = await callOpenRouter(prompt, 'You are a competitive content strategist. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'competitor-content-swipe', { competitorIds, platform, count }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Influencer finder — generic LLM call to surface influencer profiles
router.post('/influencer-finder', auth, aiRateLimiter, async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: 'OPENROUTER_API_KEY is not configured. AI features unavailable.' });
  try {
    const { niche, platform, audienceSize, region, budgetUsd, count = 8 } = req.body;
    if (!niche) return res.status(400).json({ error: 'niche is required' });
    const prompt = `Suggest ${count} influencer archetypes / handles to consider for an outreach campaign.

Niche: ${niche}
Platform: ${platform || 'Instagram'}
Target audience size: ${audienceSize || 'micro (10k-100k)'}
Region: ${region || 'global'}
Budget (USD): ${budgetUsd || 'unspecified'}

Note: real handles must be marked is_real=false unless verified — surface archetypes when uncertain.

Respond ONLY with JSON:
{
  "candidates": [{"handle_or_archetype": "...", "is_real": <bool>, "platform": "...", "estimated_followers": "...", "fit_score": <0-100>, "rationale": "...", "outreach_angle": "..."}],
  "outreach_template": "...",
  "screening_criteria": ["..."],
  "red_flags": ["..."]
}`;
    const result = await callOpenRouter(prompt, 'You are an influencer marketing strategist. Respond ONLY with JSON.');
    const parsed = parseAIJson(result.content);
    if (!parsed) return res.status(422).json({ error: 'AI returned invalid JSON' });
    await persistAIResult(req.user.id, 'influencer-finder', { niche, platform, audienceSize, region, budgetUsd, count }, parsed);
    res.json({ success: true, ...parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET scheduler status
router.get('/scheduler/status', auth, async (req, res) => {
  try {
    const scheduledCount = await Post.count({ where: { status: 'scheduled' } });
    const publishedToday = await Post.count({
      where: {
        status: 'published',
        publishedAt: { [Op.gte]: new Date(new Date().setHours(0,0,0,0)) }
      }
    });
    res.json({ scheduler: 'running', scheduled_posts: scheduledCount, published_today: publishedToday });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
