'use client'
// components/public/blog/BlogPostPage.tsx

import { useEffect, useState } from 'react'
import AppointmentBanner from '@/components/home/AppointmentBanner'

interface Section  { id: number; heading?: string; body: string; imageUrl?: string; imageAlt?: string; order: number }
interface BlogPost  { id: number; title: string; slug: string; excerpt?: string; content: string; coverImage?: string; author: string; readTime?: number; publishedAt?: string; tags: string[]; sections: Section[] }

export default function BlogPostPage({ slug }: { slug: string }) {
  const [post,     setPost]     = useState<BlogPost | null>(null)
  const [related,  setRelated]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // ✅ يـfetch من /api/public/blog/[slug] (slug وليس id)
        const res = await fetch(`/api/public/blog/${slug}`)
        if (!res.ok) { setNotFound(true); return }
        const { post } = await res.json()
        setPost(post)

        // Related
        const relRes  = await fetch('/api/dashboard/blog?published=true&limit=4')
        const relData = await relRes.json()
        setRelated((relData.posts ?? []).filter((p: any) => p.slug !== slug).slice(0, 3))
      } catch { setNotFound(true) } finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound || !post) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <p style={{ fontSize: '3.5rem', margin: 0 }}>📄</p>
      <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', margin: 0 }}>Article Not Found</h2>
      <p style={{ color: 'var(--text-muted)', margin: 0 }}>This article may have been removed or the link is incorrect.</p>
      <a href="/blog" style={{ marginTop: '.5rem', padding: '.65rem 1.6rem', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, textDecoration: 'none', fontSize: '.9rem' }}>← Back to Blog</a>
    </div>
  )

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <>
      {/* ── Hero ─────────────────────────────── */}
      <section style={{ background: 'var(--navy-700)', padding: '8rem 0 4.5rem', position: 'relative', overflow: 'hidden', minHeight: 320 }}>
        {post.coverImage && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={post.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .18 }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(8,43,86,.75) 0%,rgba(8,43,86,.96) 100%)' }} />
        <div style={{ position: 'absolute', right: '-5rem', bottom: '-5rem', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,108,.12) 0%,transparent 70%)' }} />

        <div className="container" style={{ position: 'relative', maxWidth: 820 }}>
          <a href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontSize: '.84rem', marginBottom: '1.75rem', fontWeight: 500, transition: 'color .2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.55)')}>
            ← Back to Blog
          </a>

          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {post.tags.map(t => (
                <span key={t} style={{ padding: '.18rem .65rem', background: 'rgba(196,154,108,.22)', border: '1px solid rgba(196,154,108,.35)', borderRadius: 99, fontSize: '.7rem', color: '#e2c99a', fontWeight: 600 }}>#{t}</span>
              ))}
            </div>
          )}

          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.55rem,4vw,2.4rem)', lineHeight: 1.28, marginBottom: '1rem', maxWidth: 680 }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ color: 'rgba(255,255,255,.72)', fontSize: '1.02rem', lineHeight: 1.72, marginBottom: '1.5rem', maxWidth: 620 }}>
              {post.excerpt}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.9rem', flexShrink: 0 }}>
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: '.88rem' }}>{post.author}</p>
                {date && <p style={{ margin: 0, fontSize: '.75rem', color: 'rgba(255,255,255,.5)' }}>{date}</p>}
              </div>
            </div>
            {post.readTime && <span style={{ color: 'rgba(255,255,255,.55)', fontSize: '.84rem' }}>⏱ {post.readTime} min read</span>}
          </div>
        </div>
      </section>

      {/* ── Article ──────────────────────────── */}
      <section style={{ background: 'var(--off-white)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: 820 }}>

          {/* Share */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.45rem 1.1rem', borderRadius: 99, border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--text-secondary)', fontSize: '.83rem', cursor: 'pointer', fontWeight: 500, transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              {copied ? '✓ Copied!' : '🔗 Share'}
            </button>
          </div>

          {/* Cover (below hero) */}
          {post.coverImage && (
            <div style={{ marginBottom: '2.5rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 8px 32px rgba(8,43,86,.12)' }}>
              <img src={post.coverImage} alt={post.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Sections */}
          {post.sections.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {post.sections.map((s, i) => (
                <div key={s.id}>
                  {s.heading && (
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.32rem', color: 'var(--navy-700)', fontWeight: 700, marginBottom: '.85rem', paddingBottom: '.5rem', borderBottom: '2px solid var(--beige-50)', lineHeight: 1.35 }}>
                      {s.heading}
                    </h2>
                  )}
                  <p style={{ fontSize: '1rem', lineHeight: 1.88, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {s.body}
                  </p>
                  {s.imageUrl && (
                    <figure style={{ margin: '1.5rem 0 0' }}>
                      <img src={s.imageUrl} alt={s.imageAlt ?? s.heading ?? `Image ${i + 1}`} style={{ width: '100%', borderRadius: '.85rem', display: 'block', boxShadow: '0 4px 20px rgba(8,43,86,.1)' }} />
                      {s.imageAlt && <figcaption style={{ marginTop: '.55rem', fontSize: '.78rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>{s.imageAlt}</figcaption>}
                    </figure>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '1rem', lineHeight: 1.88, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{post.content}</div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ marginTop: '2.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '.83rem', color: 'var(--text-muted)', fontWeight: 600 }}>Topics:</span>
              {post.tags.map(t => (
                <a key={t} href="/blog"
                  style={{ padding: '.2rem .7rem', background: 'rgba(8,43,86,.06)', borderRadius: 99, fontSize: '.78rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(8,43,86,.12)', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,43,86,.06)'; e.currentTarget.style.color = 'var(--primary)' }}>
                  #{t}
                </a>
              ))}
            </div>
          )}

          {/* Author */}
          <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--white)', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', gap: '1.1rem', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(8,43,86,.06)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#1a4a7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '.97rem', color: 'var(--navy-700)', fontFamily: 'var(--font-heading)' }}>{post.author}</p>
              <p style={{ margin: '.3rem 0 0', fontSize: '.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Medical content specialist at Glow Medical Center — making complex healthcare topics clear and accessible for everyone.</p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: '2.5rem', padding: '2.25rem', background: 'linear-gradient(135deg,var(--navy-700) 0%,#1a4a7a 100%)', borderRadius: '1.15rem', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 .6rem' }}>Glow Medical Center</p>
            <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '.7rem', fontSize: '1.3rem' }}>Ready to take the next step?</h3>
            <p style={{ color: 'rgba(255,255,255,.68)', fontSize: '.9rem', marginBottom: '1.35rem' }}>Book a free consultation with our specialists today.</p>
            <a href="/book"
              style={{ display: 'inline-block', padding: '.78rem 2.2rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, textDecoration: 'none', fontSize: '.95rem', transition: 'opacity .2s,transform .2s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.transform = '' }}>
              Book Appointment
            </a>
          </div>
        </div>
      </section>

      {/* ── Related ──────────────────────────── */}
      {related.length > 0 && (
        <section style={{ background: 'var(--beige-50)', padding: '4rem 0' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', marginBottom: '2rem', textAlign: 'center', fontSize: '1.6rem' }}>Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: '1.5rem' }}>
              {related.map(p => (
                <a key={p.id} href={`/blog/${p.slug}`}   // ✅ slug وليس id
                  style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: '1rem', overflow: 'hidden', textDecoration: 'none', boxShadow: '0 2px 14px rgba(8,43,86,.07)', border: '1px solid var(--border)', transition: 'transform .25s, box-shadow .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 26px rgba(8,43,86,.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 14px rgba(8,43,86,.07)' }}>
                  <div style={{ height: 155, background: 'var(--beige-50)', overflow: 'hidden' }}>
                    {p.coverImage ? <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📝</div>}
                  </div>
                  <div style={{ padding: '.95rem 1.05rem 1.2rem' }}>
                    <h4 style={{ margin: 0, fontSize: '.88rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.55rem' }}>
                      <span style={{ fontSize: '.73rem', color: 'var(--text-muted)' }}>{p.author}</span>
                      {p.readTime && <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>⏱ {p.readTime} min</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <AppointmentBanner />
    </>
  )
}
