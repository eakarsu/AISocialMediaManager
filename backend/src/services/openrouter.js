async function callOpenRouter(prompt, systemPrompt = 'You are a helpful social media management AI assistant.') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');
  if (!apiKey || !model || !baseUrl) throw new Error('Exact OpenRouter configuration is required');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.CLIENT_URL,
      'X-Title': 'AI Social Media Manager',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
  const parsed = await response.json();
  const content = String(parsed.choices?.[0]?.message?.content || '').trim();
  if (!content) throw new Error('OpenRouter returned empty content');
  return {
    content,
    model: parsed.model || model,
    usage: parsed.usage,
    id: parsed.id,
    finishReason: parsed.choices?.[0]?.finish_reason,
  };
}

module.exports = { callOpenRouter };
