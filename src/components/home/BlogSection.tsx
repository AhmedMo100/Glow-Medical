'use client'
// src/components/public/blog/BlogSection.tsx

import { useEffect, useState } from 'react'
import SectionTitle from '@/components/ui/SectionTitle'
import Button       from '@/components/ui/Button'

interface Section { id: number; heading?: string; body: string; imageUrl?: string; imageAlt?: string; order: number }
interface Post {
  id: number; title: string; excerpt?: string; content: string
  coverImage?: string; author: string; readTime?: number
  publishedAt?: string; isFeatured: boolean; tags?: string[]
  sections?: Section[]
}

/* ─────────────────────────────────────────────────────────
   ARTICLE MODAL
───────────────────────────────────────────────────────── */
function ArticleModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [full, setFull] = useState<Post | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)

    // fetch full post with sections
    fetch(`/api/public/blog/${post.id}`)
      .then(r => r.json())
      .then(d => setFull(d.post ?? post))
      .catch(() => setFull(post))

    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [post, onClose])

  const data = full ?? post
  const date = data.publishedAt
    ? new Date(data.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <>
      <style>{`
        @keyframes backdropIn { from{opacity:0} to{opacity:1} }
        @keyframes modalSlide { from{opacity:0;transform:translateY(40px) scale(.97)} to{opacity:1;transform:none} }
        .modal-scroll::-webkit-scrollbar { width: 5px }
        .modal-scroll::-webkit-scrollbar-track { background: transparent }
        .modal-scroll::-webkit-scrollbar-thumb { background: rgba(8,43,86,.15); border-radius: 99px }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 900,
          background: 'rgba(6,22,50,.82)', backdropFilter: 'blur(10px)',
          animation: 'backdropIn .22s ease',
        }}
      />

      {/* Modal shell */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 901,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.25rem', pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%', maxWidth: 860, maxHeight: '92vh',
            background: 'var(--white)', borderRadius: '1.75rem',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 100px rgba(6,22,50,.4)',
            animation: 'modalSlide .28s cubic-bezier(.34,1.26,.64,1)',
            pointerEvents: 'all', position: 'relative',
          }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── Cover hero ── */}
          <div style={{ position: 'relative', height: 260, flexShrink: 0, overflow: 'hidden', background: 'var(--navy-700)' }}>
            {data.coverImage && (
              <img src={data.coverImage} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: .35 }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(8,43,86,.65) 0%, rgba(8,43,86,.92) 100%)' }} />
            <div style={{ position: 'absolute', right: '-4rem', top: '-4rem', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,154,108,.18) 0%, transparent 70%)' }} />

            {/* Tags */}
            {data.tags?.length ? (
              <div style={{ position: 'absolute', top: 20, left: 24, display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                {data.tags.slice(0, 4).map(t => (
                  <span key={t} style={{ padding: '.18rem .65rem', background: 'rgba(196,154,108,.25)', border: '1px solid rgba(196,154,108,.4)', borderRadius: 99, fontSize: '.68rem', color: '#e2c99a', fontWeight: 600 }}>#{t}</span>
                ))}
              </div>
            ) : null}

            {/* Close */}
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: 18, right: 18, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.05rem', transition: 'background .15s', zIndex: 2 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.28)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.15)')}
            >✕</button>

            {/* Share */}
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/blog/${data.id}`); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              style={{ position: 'absolute', top: 18, right: 62, height: 36, padding: '0 .9rem', borderRadius: 99, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem', color: 'rgba(255,255,255,.85)', fontSize: '.74rem', fontWeight: 500, transition: 'background .15s', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.22)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
            >{copied ? '✓ Copied' : '🔗 Share'}</button>

            {/* Title + meta */}
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
              <h2 style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.2rem, 3.2vw, 1.72rem)', lineHeight: 1.28, fontWeight: 700 }}>
                {data.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '.65rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '.42rem' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.72rem', flexShrink: 0 }}>{data.author.charAt(0).toUpperCase()}</span>
                  <span style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>{data.author}</span>
                </span>
                {date && <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.55)' }}>{date}</span>}
                {data.readTime && <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.55)' }}>⏱ {data.readTime} min read</span>}
              </div>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="modal-scroll" style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.25rem 2.5rem' }}>

            {/* Excerpt */}
            {data.excerpt && (
              <p style={{ margin: '0 0 1.75rem', fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.78, fontStyle: 'italic', borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
                {data.excerpt}
              </p>
            )}

            {/* Sections */}
            {(data.sections?.length ?? 0) > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {data.sections!.map((s, i) => (
                  <div key={s.id}>
                    {s.heading && (
                      <h3 style={{ margin: '0 0 .75rem', fontFamily: 'var(--font-heading)', fontSize: '1.18rem', color: 'var(--navy-700)', fontWeight: 700, paddingBottom: '.5rem', borderBottom: '2px solid var(--beige-50)', lineHeight: 1.35 }}>
                        {s.heading}
                      </h3>
                    )}
                    <p style={{ margin: 0, fontSize: '.97rem', lineHeight: 1.9, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {s.body}
                    </p>
                    {s.imageUrl && (
                      <figure style={{ margin: '1.25rem 0 0' }}>
                        <img src={s.imageUrl} alt={s.imageAlt ?? `Image ${i + 1}`} style={{ width: '100%', borderRadius: '.85rem', display: 'block', boxShadow: '0 4px 20px rgba(8,43,86,.1)' }} />
                        {s.imageAlt && <figcaption style={{ marginTop: '.5rem', fontSize: '.76rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>{s.imageAlt}</figcaption>}
                      </figure>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !full && (
                /* skeleton while loading */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[90, 100, 85, 100, 78, 100, 92].map((w, i) => (
                    <div key={i} style={{ height: 14, background: 'var(--border)', borderRadius: 6, width: `${w}%`, opacity: .6 }} />
                  ))}
                </div>
              )
            )}

            {/* Tags footer */}
            {data.tags?.length ? (
              <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Topics:</span>
                {data.tags.map(t => (
                  <span key={t} style={{ padding: '.2rem .7rem', background: 'rgba(8,43,86,.06)', borderRadius: 99, fontSize: '.76rem', color: 'var(--primary)', fontWeight: 600, border: '1px solid rgba(8,43,86,.11)' }}>#{t}</span>
                ))}
              </div>
            ) : null}

            {/* CTA */}
            <div style={{ marginTop: '2rem', padding: '1.75rem', background: 'linear-gradient(135deg, var(--navy-700) 0%, #1a4a7a 100%)', borderRadius: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontSize: '.72rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em' }}>Glow Medical Center</p>
                <p style={{ margin: '.3rem 0 0', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700 }}>Ready to take the next step?</p>
              </div>
              <a href="/public/appointment"
                style={{ padding: '.72rem 1.75rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, textDecoration: 'none', fontSize: '.9rem', flexShrink: 0, transition: 'opacity .2s, transform .15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = '' }}>
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────
   BLOG SECTION — Homepage
───────────────────────────────────────────────────────── */
function BlogCard({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--white)', borderRadius: '1.15rem', overflow: 'hidden',
        boxShadow: '0 2px 14px rgba(8,43,86,.07)', border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'transform .28s cubic-bezier(.34,1.4,.64,1), box-shadow .28s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 18px 42px rgba(8,43,86,.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 14px rgba(8,43,86,.07)' }}
    >
      <div style={{ height: 200, background: 'var(--beige-50)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        {post.coverImage
          ? <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s ease' }} />
          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'linear-gradient(135deg, var(--beige-50) 0%, rgba(8,43,86,.06) 100%)' }}>📝</div>
        }
        {post.tags?.length ? (
          <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
            {post.tags.slice(0, 2).map(t => (
              <span key={t} style={{ padding: '.15rem .52rem', background: 'rgba(8,43,86,.72)', backdropFilter: 'blur(4px)', borderRadius: 99, fontSize: '.64rem', color: '#fff', fontWeight: 600 }}>#{t}</span>
            ))}
          </div>
        ) : null}
        {/* Read indicator */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .25s', background: 'rgba(8,43,86,.35)', backdropFilter: 'blur(2px)' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
          <span style={{ padding: '.5rem 1.2rem', background: '#fff', borderRadius: 99, fontWeight: 700, fontSize: '.82rem', color: 'var(--navy-700)' }}>Read Article</span>
        </div>
      </div>

      <div style={{ padding: '1.15rem 1.2rem 1.35rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.28rem' }}>
        <h3 style={{ margin: 0, fontSize: '.97rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{ margin: '.1rem 0 0', fontSize: '.81rem', color: 'var(--text-secondary)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {post.excerpt}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.65rem', paddingTop: '.65rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '.74rem', color: 'var(--text-muted)' }}>{date ?? post.author}</span>
          {post.readTime && <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', background: 'var(--off-white)', border: '1px solid var(--border)', padding: '.17rem .52rem', borderRadius: 99 }}>⏱ {post.readTime} min</span>}
        </div>
      </div>
    </div>
  )
}

export default function BlogSection() {
  const [posts,    setPosts]   = useState<Post[]>([])
  const [loading,  setLoading] = useState(true)
  const [selected, setSelected]= useState<Post | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/blog?published=true&limit=20')
      .then(r => r.json())
      .then(d => setPosts((d.posts ?? []).filter((p: Post) => p.isFeatured).slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !posts.length) return null

  return (
    <section className="section" style={{ background: 'var(--beige-50)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <SectionTitle label="Health Insights" title="Latest from Our<br/>Medical Blog" description="Expert advice and health tips from our specialists." />
          <Button href="/public/blog" variant="outline">View All Articles</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {posts.map(p => <BlogCard key={p.id} post={p} onOpen={() => setSelected(p)} />)}
        </div>
      </div>
      {selected && <ArticleModal post={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
