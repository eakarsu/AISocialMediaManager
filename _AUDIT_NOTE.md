# Audit Note — AISocialMediaManager

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_07.md` (section 36).

## Original Recommendations

### Missing AI Endpoints
- `/posting-time-optimizer`
- `/content-mix-recommender`
- `/competitor-content-swipe`
- `/influencer-finder`
- `/audience-sentiment-analysis`

### Missing Non-AI Features
- Social platform API integration (Twitter/IG/LinkedIn)
- Comment/message management
- Employee advocacy program
- Paid ads management, influencer outreach workflow
- Crisis detection/alerts

### Custom Feature Suggestions
- Agentic social manager
- Cross-platform content adaptation
- Viral potential scoring
- Competitor benchmarking
- Micro-influencer matching
- Sentiment-driven response

## Implemented (this round)
1. `POST /api/ai/posting-time-optimizer` — DB-grounded with `Analytics`, returns best/worst times.
2. `POST /api/ai/content-mix-recommender` — content-type mix and cadence recommender.
3. `POST /api/ai/audience-sentiment-analysis` — DB-grounded with `AutoReply` samples.

All follow existing OpenRouter + `persistAIResult` + `aiRateLimiter` pattern. Syntax-checked.

## Backlog (prioritized)
1. **MECHANICAL** `POST /api/ai/competitor-content-swipe` — uses Competitor model.
2. **MECHANICAL** `POST /api/ai/influencer-finder` — generic LLM call.
3. **NEEDS-CREDS** Real platform integrations (Twitter, Instagram, LinkedIn APIs).
4. **NEEDS-PRODUCT-DECISION** Crisis-detection/alert routing, paid ads management.

## Apply pass 3 (frontend)

LEFT-AS-IS. FE already wired. `frontend/src/pages/AIInsights.jsx` covers the 3 audit-driven endpoints (`posting-time-optimizer`, `content-mix-recommender`, `audience-sentiment-analysis`) and `AIGenerator.jsx` is a launcher for 8 generator endpoints. Per-domain pages (Hashtags, BrandVoice, Competitors, Calendar, Posts, AutoReplies, Reports, PerformanceAnalytics, ScheduledPosts, ContentCalendar) call their own `/api/ai/*` endpoints. JWT bearer is set in `frontend/src/api.js`. The two backlog endpoints (`competitor-content-swipe`, `influencer-finder`) are absent from both FE and BE and remain backlog. No changes made.

## Apply pass 4 (mechanical backlog)

LEFT-AS-IS. Both items in the MECHANICAL backlog (`/api/ai/competitor-content-swipe`, `/api/ai/influencer-finder`) are already implemented in `backend/src/routes/ai.js` (lines 409–464) with explicit `OPENROUTER_API_KEY` 503 guards, `auth + aiRateLimiter` middleware, `parseAIJson` post-processing, and `persistAIResult` audit logging. FE is wired in `frontend/src/pages/AIInsights.jsx` (entries `competitor-swipe` and `influencer-finder` at lines 46 and 58, endpoints `/ai/competitor-content-swipe` and `/ai/influencer-finder`); the page surfaces a `[503]` prefix on no-key errors (line 103). Remaining backlog is NEEDS-CREDS (Twitter / Instagram / LinkedIn API integrations) or NEEDS-PRODUCT-DECISION (crisis-detection alert routing, paid-ads management). No changes made.
