import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

const PLATFORMS = [
  { id: 'twitter', label: '𝕏 / Twitter', icon: '✦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '◈' },
  { id: 'tiktok', label: 'TikTok', icon: '◉' },
  { id: 'youtube', label: 'YouTube', icon: '▶' },
  { id: 'instagram', label: 'Instagram', icon: '◆' },
  { id: 'newsletter', label: 'Newsletter', icon: '◎' },
]

const TONES = ['Provocative', 'Curious', 'Inspiring', 'Urgent', 'Relatable', 'Contrarian']

const FREE_LIMIT = 5

const typeEmoji = {
  curiosity: '🔍',
  bold_claim: '⚡',
  story: '📖',
  controversy: '🔥',
  how_to: '🎯',
  listicle: '📋',
}

export default function Home() {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('twitter')
  const [tone, setTone] = useState('Provocative')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usageCount, setUsageCount] = useState(0)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [activeTab, setActiveTab] = useState('hooks')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('hf_usage') || '0')
    setUsageCount(saved)
  }, [])

  const remaining = Math.max(0, FREE_LIMIT - usageCount)

  async function generate() {
    if (!topic.trim()) return
    if (usageCount >= FREE_LIMIT) {
      setShowUpgrade(true)
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      const newCount = usageCount + 1
      setUsageCount(newCount)
      localStorage.setItem('hf_usage', String(newCount))
      setActiveTab('hooks')
      if (newCount >= FREE_LIMIT) setShowUpgrade(true)
    } catch (e) {
      setError('Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout(plan) {
    setCheckoutLoading(true)
    try {
      const variantId =
        plan === 'monthly'
          ? process.env.NEXT_PUBLIC_LS_MONTHLY_VARIANT
          : process.env.NEXT_PUBLIC_LS_LIFETIME_VARIANT

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Could not open checkout. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  function copyText(text, idx) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const scoreColor = (s) =>
    s >= 90 ? '#00FF94' : s >= 75 ? '#FFD600' : '#FF6B6B'

  return (
    <>
      <Head>
        <title>HookForge — AI Viral Hook Generator</title>
        <meta name="description" content="Turn any topic into scroll-stopping hooks for Twitter, LinkedIn, TikTok, YouTube and more. Powered by AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        color: '#E8E8F0',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,40,255,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(255,60,100,0.08), transparent)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '0 20px 80px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', padding: '50px 0 40px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(120,40,255,0.15)', border: '1px solid rgba(120,40,255,0.3)',
              borderRadius: 100, padding: '6px 16px', fontSize: 12, marginBottom: 24,
              color: '#A97FFF', letterSpacing: 2, textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF94', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              AI-Powered · Free Beta
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(42px, 7vw, 72px)',
              fontWeight: 800, margin: '0 0 12px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #A97FFF 50%, #FF6B9D 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundSize: '200%', animation: 'shimmer 4s linear infinite',
            }}>
              HookForge
            </h1>

            <p style={{ color: '#888', fontSize: 17, margin: 0, lineHeight: 1.6 }}>
              Turn any topic into <span style={{ color: '#A97FFF' }}>scroll-stopping hooks</span> for every platform.<br />
              No blank page. No guessing. Just viral content.
            </p>

            {/* Usage dots */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
              {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                <div key={i} style={{
                  width: 28, height: 6, borderRadius: 3,
                  background: i < usageCount ? 'rgba(120,40,255,0.25)' : '#7828FF',
                  transition: 'all 0.3s ease',
                }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 12, color: '#555' }}>
                {remaining} free left
              </span>
            </div>
          </div>

          {/* Input card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 28, marginBottom: 24,
          }}>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={"Paste your content, article, idea, or topic here...\n\ne.g. 'How to wake up at 5am without hating your life'"}
              rows={5}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                color: '#E8E8F0', fontSize: 15, padding: '14px 16px',
                resize: 'vertical', lineHeight: 1.6, transition: 'border-color 0.2s',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                    color: '#E8E8F0', fontSize: 14, padding: '10px 14px',
                  }}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                    color: '#E8E8F0', fontSize: 14, padding: '10px 14px',
                  }}
                >
                  {TONES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading || !topic.trim()}
              className="btn-glow"
              style={{
                width: '100%', marginTop: 16, padding: '14px 24px',
                background: 'linear-gradient(135deg, #7828FF, #FF3C7F)',
                border: 'none', borderRadius: 12, color: 'white',
                fontSize: 16, fontWeight: 600,
                cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
                opacity: !topic.trim() ? 0.5 : 1,
                boxShadow: '0 4px 20px rgba(120,40,255,0.3)',
                letterSpacing: 0.5,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block',
                  }} />
                  Forging hooks...
                </span>
              ) : '⚡ Forge Hooks'}
            </button>

            {error && (
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.2)',
                borderRadius: 8, color: '#FF6B6B', fontSize: 13,
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div style={{ animation: 'slideUp 0.4s ease' }}>
              {result.viral_tip && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,255,148,0.08), rgba(120,40,255,0.08))',
                  border: '1px solid rgba(0,255,148,0.2)', borderRadius: 14,
                  padding: '14px 18px', marginBottom: 20,
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#00FF94', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Viral Tip</div>
                    <div style={{ fontSize: 14, color: '#CCC', lineHeight: 1.5 }}>{result.viral_tip}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
                {['hooks', 'repurposed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: 'none', border: 'none',
                      color: activeTab === tab ? 'white' : '#666',
                      padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 500,
                      borderBottom: activeTab === tab ? '2px solid #7828FF' : '2px solid transparent',
                      marginBottom: -1, transition: 'all 0.2s',
                    }}
                  >
                    {tab === 'hooks' ? `🎣 ${result.hooks?.length} Hooks` : '🔄 Repurposed'}
                  </button>
                ))}
              </div>

              {activeTab === 'hooks' && result.hooks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.hooks.map((hook, i) => (
                    <div key={i} className="hook-card" style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14, padding: '18px 20px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                            <span>{typeEmoji[hook.type] || '✦'}</span>
                            <span style={{
                              fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#666',
                              background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 20,
                            }}>
                              {hook.type?.replace(/_/g, ' ')}
                            </span>
                            {hook.score && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(hook.score), marginLeft: 'auto' }}>
                                {hook.score}% viral score
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: '#E8E8F0' }}>{hook.text}</p>
                        </div>
                        <button
                          onClick={() => copyText(hook.text, i)}
                          style={{
                            flexShrink: 0,
                            background: copiedIndex === i ? 'rgba(0,255,148,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${copiedIndex === i ? 'rgba(0,255,148,0.3)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: 8, padding: '7px 12px',
                            color: copiedIndex === i ? '#00FF94' : '#888',
                            fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
                          }}
                        >
                          {copiedIndex === i ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'repurposed' && result.repurposed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(result.repurposed).map(([key, val], i) => {
                    const labels = {
                      tweet_thread_opener: { label: '𝕏 Thread Opener', icon: '✦' },
                      linkedin_post: { label: 'LinkedIn Post', icon: '◈' },
                      tiktok_script_hook: { label: 'TikTok Script Hook', icon: '◉' },
                      youtube_title: { label: 'YouTube Title', icon: '▶' },
                      newsletter_subject: { label: 'Newsletter Subject', icon: '◎' },
                    }
                    const meta = labels[key] || { label: key, icon: '•' }
                    return (
                      <div key={key} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 14, padding: '18px 20px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: '#A97FFF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
                              {meta.icon} {meta.label}
                            </div>
                            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#CCC' }}>{val}</p>
                          </div>
                          <button
                            onClick={() => copyText(val, `r${i}`)}
                            style={{
                              flexShrink: 0,
                              background: copiedIndex === `r${i}` ? 'rgba(0,255,148,0.15)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${copiedIndex === `r${i}` ? 'rgba(0,255,148,0.3)' : 'rgba(255,255,255,0.1)'}`,
                              borderRadius: 8, padding: '7px 12px',
                              color: copiedIndex === `r${i}` ? '#00FF94' : '#888',
                              fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
                            }}
                          >
                            {copiedIndex === `r${i}` ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upgrade modal */}
          {showUpgrade && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100, padding: 20,
            }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowUpgrade(false) }}
            >
              <div style={{
                background: '#13131A', border: '1px solid rgba(120,40,255,0.3)',
                borderRadius: 24, padding: 36, maxWidth: 480, width: '100%',
                animation: 'slideUp 0.3s ease',
              }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, marginBottom: 8 }}>
                    Unlock Unlimited Hooks
                  </h2>
                  <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
                    You've used your 5 free generations.<br />
                    Upgrade for unlimited access to all features.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    onClick={() => handleCheckout('monthly')}
                    disabled={checkoutLoading}
                    className="btn-glow"
                    style={{
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #7828FF, #FF3C7F)',
                      border: 'none', borderRadius: 12, color: 'white',
                      fontSize: 16, fontWeight: 600, cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(120,40,255,0.4)',
                    }}
                  >
                    {checkoutLoading ? 'Loading...' : 'Pro Plan — $9 / month'}
                  </button>

                  <button
                    onClick={() => handleCheckout('lifetime')}
                    disabled={checkoutLoading}
                    style={{
                      padding: '16px 24px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12, color: '#E8E8F0',
                      fontSize: 15, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Lifetime Deal — $29 one-time
                  </button>

                  <button
                    onClick={() => setShowUpgrade(false)}
                    style={{
                      background: 'none', border: 'none', color: '#555',
                      fontSize: 13, cursor: 'pointer', padding: '8px',
                    }}
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Social proof */}
          {!result && (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <p style={{ color: '#333', fontSize: 13, marginBottom: 20 }}>
                Trusted by creators growing on every platform
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
                {[
                  { stat: '50K+', label: 'Hooks generated' },
                  { stat: '12K+', label: 'Creators' },
                  { stat: '4.9★', label: 'Rating' },
                ].map(({ stat, label }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: '#A97FFF' }}>{stat}</div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
