export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { topic, platform, tone } = req.body

  if (!topic || !platform || !tone) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const SYSTEM_PROMPT = `You are HookForge — the world's best viral content hook writer and repurposer.

Your job: take ANY topic or content and generate scroll-stopping hooks and repurposed content tailored to specific platforms.

Rules:
- Hooks must be PUNCHY, under 280 chars unless specified
- Use psychological triggers: curiosity gap, pattern interrupt, bold claim, social proof, controversy, FOMO
- Each hook must feel platform-native
- Output ONLY valid JSON. No markdown, no backticks, no explanation.

Output format:
{
  "hooks": [
    { "text": "...", "type": "curiosity|bold_claim|story|controversy|how_to|listicle", "score": 85 },
    { "text": "...", "type": "...", "score": 90 },
    { "text": "...", "type": "...", "score": 78 },
    { "text": "...", "type": "...", "score": 88 },
    { "text": "...", "type": "...", "score": 82 }
  ],
  "repurposed": {
    "tweet_thread_opener": "...",
    "linkedin_post": "...",
    "tiktok_script_hook": "...",
    "youtube_title": "...",
    "newsletter_subject": "..."
  },
  "viral_tip": "One specific tip to make this content go viral based on current trends"
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Platform: ${platform}\nTone: ${tone}\nContent/Topic: ${topic}\n\nGenerate 5 killer hooks and repurposed content. Return only JSON.`,
          },
        ],
      }),
    })

    const data = await response.json()
    const raw = data.content?.map((b) => b.text || '').join('').trim()
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return res.status(200).json(parsed)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Generation failed' })
  }
}
