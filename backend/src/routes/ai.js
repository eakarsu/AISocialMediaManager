const router = require('express').Router();
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');

// Generate social media post content
router.post('/generate-post', auth, async (req, res) => {
  try {
    const { topic, platform, tone, length } = req.body;
    const prompt = `Generate a ${tone || 'professional'} social media post for ${platform || 'Twitter'} about "${topic}". ${length === 'short' ? 'Keep it under 100 characters.' : length === 'long' ? 'Make it detailed, 200-300 characters.' : 'Keep it medium length, 100-200 characters.'} Include relevant emojis and a call to action. Only return the post content, nothing else.`;
    const result = await callOpenRouter(prompt, 'You are an expert social media content creator. Generate engaging, platform-optimized content.');
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate hashtags
router.post('/generate-hashtags', auth, async (req, res) => {
  try {
    const { topic, platform, count } = req.body;
    const prompt = `Generate ${count || 10} relevant hashtags for a ${platform || 'Instagram'} post about "${topic}". Return only the hashtags, one per line, each starting with #.`;
    const result = await callOpenRouter(prompt, 'You are a social media hashtag expert. Generate trending, relevant hashtags.');
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate image caption
router.post('/generate-caption', auth, async (req, res) => {
  try {
    const { description, platform, mood } = req.body;
    const prompt = `Generate an engaging ${mood || 'inspiring'} image caption for ${platform || 'Instagram'} for an image described as: "${description}". Include relevant emojis. Only return the caption.`;
    const result = await callOpenRouter(prompt, 'You are a creative social media caption writer.');
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Analyze competitor
router.post('/analyze-competitor', auth, async (req, res) => {
  try {
    const { competitorName, platform, industry } = req.body;
    const prompt = `Provide a brief competitive social media analysis for "${competitorName}" on ${platform || 'all platforms'} in the ${industry || 'general'} industry. Include: 1) Estimated strengths 2) Potential weaknesses 3) Content strategy observations 4) Recommendations for competing against them. Format with clear sections.`;
    const result = await callOpenRouter(prompt, 'You are a social media competitive analysis expert.');
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate auto-reply
router.post('/generate-reply', auth, async (req, res) => {
  try {
    const { message, tone, context } = req.body;
    const prompt = `Generate a ${tone || 'friendly'} auto-reply for this social media message: "${message}". Context: ${context || 'general customer inquiry'}. Keep it conversational and helpful. Only return the reply.`;
    const result = await callOpenRouter(prompt, 'You are a friendly social media community manager.');
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate content calendar suggestions
router.post('/calendar-suggestions', auth, async (req, res) => {
  try {
    const { industry, platforms, days } = req.body;
    const prompt = `Generate ${days || 7} days of social media content calendar suggestions for a ${industry || 'technology'} company on ${platforms?.join(', ') || 'Instagram, Twitter, LinkedIn'}. For each day provide: the day, platform, content type, topic, and a brief description. Format clearly.`;
    const result = await callOpenRouter(prompt, 'You are a social media content strategist.');
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Brand voice analysis
router.post('/analyze-brand-voice', auth, async (req, res) => {
  try {
    const { sampleText, brandName } = req.body;
    const prompt = `Analyze the brand voice from this sample text from "${brandName || 'the brand'}": "${sampleText}". Identify: 1) Tone characteristics 2) Language style 3) Key themes 4) Suggested keywords to use 5) Words to avoid 6) Recommendations for consistency. Format clearly.`;
    const result = await callOpenRouter(prompt, 'You are a brand voice and communications expert.');
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate report summary
router.post('/report-summary', auth, async (req, res) => {
  try {
    const { metrics, period, platform } = req.body;
    const prompt = `Generate an executive summary for a social media performance report. Period: ${period || 'monthly'}. Platform: ${platform || 'all platforms'}. Metrics: ${JSON.stringify(metrics || { followers: 15000, engagement: '4.2%', impressions: 250000, clicks: 3500 })}. Include: key highlights, areas of improvement, and actionable recommendations.`;
    const result = await callOpenRouter(prompt, 'You are a social media analytics expert creating executive reports.');
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
