'use client'
// src/components/public/blog/BlogPublicPage.tsx

import { useEffect, useState, useCallback, useRef } from 'react'
import AppointmentBanner from '@/components/home/AppointmentBanner'

interface Section { id: number; heading?: string; body: string; imageUrl?: string; imageAlt?: string; order: number }
interface Post {
  id: number; title: string; excerpt?: string; content: string
  coverImage?: string; author: string; readTime?: number
  publishedAt?: string; isFeatured: boolean; tags?: string[]
  sections?: Section[]
}

/* ─────────────────────────────────────────────────────────
   ARTICLE MODAL (same component reused)
───────────────────────────────────────────────────────── */
function ArticleModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [full, setFull] = useState<Post | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)

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
        .modal-scroll::-webkit-scrollbar { width:5px }
        .modal-scroll::-webkit-scrollbar-track { background:transparent }
        .modal-scroll::-webkit-scrollbar-thumb { background:rgba(8,43,86,.15);border-radius:99px }
      `}</style>

      <div onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(6,22,50,.82)', backdropFilter: 'blur(10px)', animation: 'backdropIn .22s ease' }}
      />

      <div style={{ position: 'fixed', inset: 0, zIndex: 901, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', pointerEvents: 'none' }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 860, maxHeight: '92vh',
            background: 'var(--white)', borderRadius: '1.75rem',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 100px rgba(6,22,50,.4)',
            animation: 'modalSlide .28s cubic-bezier(.34,1.26,.64,1)',
            pointerEvents: 'all', position: 'relative',
          }}
        >
          {/* Cover hero */}
          <div style={{ position: 'relative', height: 260, flexShrink: 0, overflow: 'hidden', background: 'var(--navy-700)' }}>
            {data.coverImage && <img src={data.coverImage} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: .35 }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(8,43,86,.65) 0%, rgba(8,43,86,.92) 100%)' }} />
            <div style={{ position: 'absolute', right: '-4rem', top: '-4rem', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,108,.18) 0%,transparent 70%)' }} />

            {data.tags?.length ? (
              <div style={{ position: 'absolute', top: 20, left: 24, display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                {data.tags.slice(0, 4).map(t => (
                  <span key={t} style={{ padding: '.18rem .65rem', background: 'rgba(196,154,108,.25)', border: '1px solid rgba(196,154,108,.4)', borderRadius: 99, fontSize: '.68rem', color: '#e2c99a', fontWeight: 600 }}>#{t}</span>
                ))}
              </div>
            ) : null}

            <button onClick={onClose}
              style={{ position: 'absolute', top: 18, right: 18, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.05rem', transition: 'background .15s', zIndex: 2 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.28)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.15)')}>✕</button>

            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/blog/${data.id}`); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              style={{ position: 'absolute', top: 18, right: 62, height: 36, padding: '0 .9rem', borderRadius: 99, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.35rem', color: 'rgba(255,255,255,.85)', fontSize: '.74rem', fontWeight: 500, fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.22)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}>
              {copied ? '✓ Copied' : '🔗 Share'}
            </button>

            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
              <h2 style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.2rem,3.2vw,1.72rem)', lineHeight: 1.28, fontWeight: 700 }}>
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

          {/* Scrollable body */}
          <div className="modal-scroll" style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.25rem 2.5rem' }}>
            {data.excerpt && (
              <p style={{ margin: '0 0 1.75rem', fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.78, fontStyle: 'italic', borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
                {data.excerpt}
              </p>
            )}

            {(data.sections?.length ?? 0) > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {data.sections!.map((s, i) => (
                  <div key={s.id}>
                    {s.heading && (
                      <h3 style={{ margin: '0 0 .75rem', fontFamily: 'var(--font-heading)', fontSize: '1.18rem', color: 'var(--navy-700)', fontWeight: 700, paddingBottom: '.5rem', borderBottom: '2px solid var(--beige-50)', lineHeight: 1.35 }}>
                        {s.heading}
                      </h3>
                    )}
                    <p style={{ margin: 0, fontSize: '.97rem', lineHeight: 1.9, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{s.body}</p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                  {[92, 100, 86, 100, 78, 100, 94].map((w, i) => (
                    <div key={i} style={{ height: 14, background: 'var(--border)', borderRadius: 6, width: `${w}%`, opacity: .55 }} />
                  ))}
                </div>
              )
            )}

            {data.tags?.length ? (
              <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Topics:</span>
                {data.tags.map(t => (
                  <span key={t} style={{ padding: '.2rem .7rem', background: 'rgba(8,43,86,.06)', borderRadius: 99, fontSize: '.76rem', color: 'var(--primary)', fontWeight: 600, border: '1px solid rgba(8,43,86,.11)' }}>#{t}</span>
                ))}
              </div>
            ) : null}

            <div style={{ marginTop: '2rem', padding: '1.75rem', background: 'linear-gradient(135deg, var(--navy-700) 0%, #1a4a7a 100%)', borderRadius: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontSize: '.72rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em' }}>Glow Medical Center</p>
                <p style={{ margin: '.3rem 0 0', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700 }}>Ready to take the next step?</p>
              </div>
              <a href="/public/appointment"
                style={{ padding: '.72rem 1.75rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, textDecoration: 'none', fontSize: '.9rem', flexShrink: 0 }}
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
   SORT DROPDOWN
───────────────────────────────────────────────────────── */
type SortOption = { label: string; value: string }
const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First',    value: 'newest'   },
  { label: 'Oldest First',    value: 'oldest'   },
  { label: 'Featured First',  value: 'featured' },
  { label: 'Shortest Read',   value: 'short'    },
  { label: 'Longest Read',    value: 'long'     },
]

function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const current = SORT_OPTIONS.find(o => o.value === value) ?? SORT_OPTIONS[0]

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '.55rem',
          padding: '.72rem 1.1rem', borderRadius: 'var(--radius)',
          border: `1.5px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          background: open ? 'rgba(8,43,86,.04)' : 'var(--off-white)',
          color: 'var(--text-primary)', fontSize: '.88rem', fontWeight: 500,
          cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
          transition: 'all .18s', minWidth: 155,
          boxShadow: open ? '0 0 0 3px rgba(8,43,86,.07)' : 'none',
        }}
      >
        <span style={{ fontSize: '.82rem', opacity: .55 }}>↕</span>
        <span style={{ flex: 1, textAlign: 'left' }}>{current.label}</span>
        <span style={{ fontSize: '.68rem', opacity: .45, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          minWidth: '100%', background: 'var(--white)',
          border: '1.5px solid var(--border)', borderRadius: '1rem',
          boxShadow: '0 12px 40px rgba(8,43,86,.14)',
          overflow: 'hidden', zIndex: 50,
          animation: 'fadeDropdown .18s ease',
        }}>
          <style>{`@keyframes fadeDropdown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                display: 'block', width: '100%', padding: '.62rem 1.1rem',
                background: value === opt.value ? 'rgba(8,43,86,.06)' : 'transparent',
                color: value === opt.value ? 'var(--navy-700)' : 'var(--text-secondary)',
                fontWeight: value === opt.value ? 600 : 400,
                fontSize: '.86rem', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit', transition: 'background .12s',
              }}
              onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = 'var(--off-white)' }}
              onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent' }}
            >
              {value === opt.value && <span style={{ marginRight: '.45rem', color: 'var(--primary)' }}>✓</span>}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   POST CARD
───────────────────────────────────────────────────────── */
function PostCard({ post, wide, onOpen }: { post: Post; wide?: boolean; onOpen: () => void }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex', flexDirection: wide ? 'row' : 'column',
        background: 'var(--white)', borderRadius: '1.15rem', overflow: 'hidden',
        boxShadow: '0 2px 14px rgba(8,43,86,.07)', border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'transform .28s cubic-bezier(.34,1.4,.64,1), box-shadow .28s ease',
        gridColumn: wide ? '1 / -1' : undefined,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(8,43,86,.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 14px rgba(8,43,86,.07)' }}
    >
      <div style={{ height: wide ? 'auto' : 195, minHeight: wide ? 260 : undefined, flex: wide ? '0 0 42%' : undefined, background: 'var(--beige-50)', overflow: 'hidden', position: 'relative' }}>
        {post.coverImage
          ? <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s' }} />
          : <div style={{ height: '100%', minHeight: 195, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'linear-gradient(135deg, var(--beige-50) 0%, rgba(8,43,86,.05) 100%)' }}>📝</div>
        }
        {post.isFeatured && <span style={{ position: 'absolute', top: 11, left: 11, background: 'var(--accent)', color: '#fff', padding: '.18rem .6rem', borderRadius: 99, fontSize: '.68rem', fontWeight: 700 }}>★ Featured</span>}
        {post.tags?.length ? (
          <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
            {post.tags.slice(0, wide ? 3 : 2).map(t => (
              <span key={t} style={{ padding: '.15rem .52rem', background: 'rgba(8,43,86,.72)', backdropFilter: 'blur(4px)', borderRadius: 99, fontSize: '.64rem', color: '#fff', fontWeight: 600 }}>#{t}</span>
            ))}
          </div>
        ) : null}
        {/* Hover overlay */}
        {!wide && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .22s', background: 'rgba(8,43,86,.38)', backdropFilter: 'blur(2px)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
            <span style={{ padding: '.45rem 1.1rem', background: '#fff', borderRadius: 99, fontWeight: 700, fontSize: '.8rem', color: 'var(--navy-700)' }}>Read Article</span>
          </div>
        )}
      </div>

      <div style={{ padding: wide ? '2rem 2.25rem' : '1.15rem 1.2rem 1.35rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.3rem', justifyContent: wide ? 'center' : undefined }}>
        <h3 style={{ margin: 0, fontSize: wide ? '1.38rem' : '.97rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', lineHeight: 1.38, display: '-webkit-box', WebkitLineClamp: wide ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{ margin: '.1rem 0 0', fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: wide ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {post.excerpt}
          </p>
        )}
        {wide && (
          <span style={{ marginTop: '.8rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.55rem 1.25rem', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '.85rem', alignSelf: 'flex-start' }}>
            Read Article →
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: wide ? '1rem' : '.65rem', paddingTop: wide ? '1rem' : '.65rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <p style={{ margin: 0, fontSize: '.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{post.author}</p>
            {date && <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-muted)' }}>{date}</p>}
          </div>
          {post.readTime && <span style={{ fontSize: '.73rem', color: 'var(--text-muted)', background: 'var(--off-white)', border: '1px solid var(--border)', padding: '.2rem .6rem', borderRadius: 99 }}>⏱ {post.readTime} min</span>}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background: 'var(--white)', borderRadius: '1.15rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ height: 195, background: 'linear-gradient(90deg, var(--surface-2,#f1f5f9) 0%, var(--border,#e2e8f0) 50%, var(--surface-2,#f1f5f9) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite' }} />
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[80, 65, 45].map((w, i) => <div key={i} style={{ height: i === 0 ? 16 : 12, background: 'var(--border)', borderRadius: 6, width: `${w}%` }} />)}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
function sortPosts(posts: Post[], sort: string): Post[] {
  const arr = [...posts]
  if (sort === 'oldest')   return arr.sort((a, b) => new Date(a.publishedAt ?? 0).getTime() - new Date(b.publishedAt ?? 0).getTime())
  if (sort === 'featured') return arr.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
  if (sort === 'short')    return arr.sort((a, b) => (a.readTime ?? 99) - (b.readTime ?? 99))
  if (sort === 'long')     return arr.sort((a, b) => (b.readTime ?? 0) - (a.readTime ?? 0))
  return arr.sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
}

export default function BlogPublicPage() {
  const [posts,       setPosts]       = useState<Post[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeTag,   setActiveTag]   = useState('')
  const [sort,        setSort]        = useState('newest')
  const [page,        setPage]        = useState(1)
  const [pages,       setPages]       = useState(1)
  const [total,       setTotal]       = useState(0)
  const [selected,    setSelected]    = useState<Post | null>(null)

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags ?? [])))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ published: 'true', limit: '9', page: String(page) })
      if (search) p.set('search', search)
      const res  = await fetch(`/api/dashboard/blog?${p}`)
      const data = await res.json()
      setPosts(data.posts ?? []); setPages(data.pages ?? 1); setTotal(data.total ?? 0)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { load() }, [load])

  const doSearch = () => { setSearch(searchInput.trim()); setPage(1); setActiveTag('') }
  const doClear  = () => { setSearch(''); setSearchInput(''); setActiveTag(''); setPage(1) }

  const tagFiltered  = activeTag ? posts.filter(p => p.tags?.includes(activeTag)) : posts
  const sorted       = sortPosts(tagFiltered, sort)
  const showWide     = !search && !activeTag && page === 1 && sort === 'newest'
  const featuredP    = showWide ? sorted.find(p => p.isFeatured) : undefined
  const rest         = showWide && featuredP ? sorted.filter(p => p !== featuredP) : sorted

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--navy-700)', padding: '9rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', right: '-4rem', top: '-4rem', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,108,.15) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', left: '-4rem', bottom: '-4rem', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,108,.08) 0%,transparent 70%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="badge badge-white" style={{ marginBottom: '1rem' }}>Health Insights</span>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Medical Knowledge,<br /><em style={{ color: 'var(--beige-300)' }}>Simply Explained</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', maxWidth: 500, margin: '1.5rem auto 0', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Expert articles and health tips from our team — written for everyone.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">

          {/* ── Filter bar ── */}
          <div style={{ background: 'var(--white)', borderRadius: '1.25rem', padding: '1.4rem 1.5rem', boxShadow: '0 2px 20px rgba(8,43,86,.07)', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>

            {/* Row 1 — search + sort */}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 220px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '1rem' }}>🔍</span>
                <input
                  type="text" value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  placeholder="Search articles by title or author…"
                  style={{ width: '100%', padding: '.72rem .9rem .72rem 2.4rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '.9rem', background: 'var(--off-white)', outline: 'none', boxSizing: 'border-box', color: 'var(--text-primary)', fontFamily: 'inherit', transition: 'border-color .2s, box-shadow .2s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(8,43,86,.07)' }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* Sort dropdown */}
              <SortDropdown value={sort} onChange={v => { setSort(v); setPage(1) }} />

              <button onClick={doSearch}
                style={{ padding: '.72rem 1.55rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'opacity .2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Search
              </button>
              {(search || activeTag) && (
                <button onClick={doClear}
                  style={{ padding: '.72rem 1rem', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border)', fontSize: '.85rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Count */}
            {!loading && (
              <p style={{ margin: '.85rem 0 0', fontSize: '.8rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> {total === 1 ? 'article' : 'articles'}
                {search    && <> matching <strong style={{ color: 'var(--navy-700)' }}>"{search}"</strong></>}
                {activeTag && <> tagged <strong style={{ color: 'var(--primary)' }}>#{activeTag}</strong></>}
              </p>
            )}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            ) : sorted.length > 0 ? (
              <>
                {featuredP && <PostCard post={featuredP} wide onOpen={() => setSelected(featuredP)} />}
                {rest.map(p => <PostCard key={p.id} post={p} onOpen={() => setSelected(p)} />)}
              </>
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 1rem' }}>
                <p style={{ fontSize: '3rem', margin: '0 0 .75rem' }}>🔍</p>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 .4rem', fontSize: '1.05rem' }}>No articles found</p>
                <p style={{ fontSize: '.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>Try a different search or clear the filters</p>
                <button onClick={doClear} style={{ padding: '.6rem 1.5rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear Filters</button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '.45rem 1rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: page === 1 ? 'default' : 'pointer', fontSize: '.84rem', fontFamily: 'inherit', opacity: page === 1 ? .5 : 1 }}>← Prev</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 38, height: 38, borderRadius: 'var(--radius)', border: `1.5px solid ${page === n ? 'var(--primary)' : 'var(--border)'}`, background: page === n ? 'var(--primary)' : 'var(--white)', color: page === n ? '#fff' : 'var(--text-secondary)', fontWeight: page === n ? 700 : 400, cursor: 'pointer', fontSize: '.84rem', fontFamily: 'inherit', transition: 'all .15s' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                style={{ padding: '.45rem 1rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: page === pages ? 'default' : 'pointer', fontSize: '.84rem', fontFamily: 'inherit', opacity: page === pages ? .5 : 1 }}>Next →</button>
            </div>
          )}
        </div>
      </section>

      {selected && <ArticleModal post={selected} onClose={() => setSelected(null)} />}
      <AppointmentBanner />
    </>
  )
}
