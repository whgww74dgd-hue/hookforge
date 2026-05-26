export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { topic, platform, tone } = req.body
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 1000,
        messages: [{ role: 'user', content: `Generate viral hooks for topic: ${topic}, platform: ${platform}, tone: ${tone}. Return only this exact JSON format: {"hooks":[{"text":"hook here","type":"curiosity","score":85},{"text":"hook here","type":"bold_claim","score":90},{"text":"hook here","type":"story","score":78},{"text":"hook here","type":"controversy","score":88},{"text":"hook here","type":"how_to","score":82}],"repurposed":{"tweet_thread_opener":"...","linkedin_post":"...","tiktok_script_hook":"...","youtube_title":"...","newsletter_subject":"..."},"viral_tip":"tip here"}` }],
      }),
    })
    const d = await r.json()
    console.log('STATUS:', r.status, 'BODY:', JSON.stringify(d))
    if (d.error) return res.status(500).json({ error: d.error.message })
    const txt = d.content[0].text.replace(/```json|```/g, '').trim()
    return res.status(200).json(JSON.parse(txt))
  } catch (e) {
    console.error('CATCH:', e.message)
    return res.status(500).json({ error: e.message })
  }
}
