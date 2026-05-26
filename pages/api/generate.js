export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { topic, platform, tone } = req.body
  if (!topic || !platform || !tone) {
    return res.status(400).json({ error: 'Missing fields' })
  }
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
        messages: [{ role: 'user', content: `Generate 5 viral hooks for: ${topic} on ${platform} with ${tone} tone. Return only JSON: {"hooks":[{"text":"...","type":"curiosity","score":85}],"repurposed":{"tweet_thread_opener":"...","linkedin_post":"...","tiktok_script_hook":"...","youtube_title":"...","newsletter_subject":"..."},"viral_tip":"..."}` }],
      }),
    })
    const data = await response.json()
    console.log('API response:', JSON.stringify(data))
    if (!data.content) return res.status(500).json({ error: JSON.stringify(data) })
    const raw = data.content.map(b => b.text || '').join('').trim()
    const clean = raw.replace(/```json|```/g, '').trim()
    return res.status(200).json(JSON.parse(clean))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
