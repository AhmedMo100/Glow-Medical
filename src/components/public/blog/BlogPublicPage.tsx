'use client'
// components/public/blog/BlogPublicPage.tsx

import { useEffect, useState, useCallback } from 'react'
import SectionTitle    from '@/components/ui/SectionTitle'
import AppointmentBanner from '@/components/home/AppointmentBanner'

interface Post {
  id         : number
  title      : string
  slug       : string          // ← الرابط بيعتمد على slug
  excerpt?   : string
  coverImage?: string
  author     : string
  readTime?  : number
  publishedAt?: string
  isFeatured : boolean
  tags?      : string[]
}

/* ── Skeleton ─────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background: 'var(--white)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ height: 200, background: 'var(--surface-2)' }} />
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 12, background: 'var(--border)', borderRadius: 6, width: '35%' }} />
        <div style={{ height: 16, background: 'var(--border)', borderRadius: 6, width: '80%' }} />
        <div style={{ height: 14, background: 'var(--border)', borderRadius: 6, width: '65%' }} />
        <div style={{ height: 12, background: 'var(--border)', borderRadius: 6, width: '45%', marginTop: 4 }} />
      </div>
    </div>
  )
}

/* ── Card ─────────────────────────────────── */
function PostCard({ post, wide }: { post: Post; wide?: boolean }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <a
      href={`/blog/${post.slug}`}   // ✅ slug وليس id
      style={{
        display: 'flex', flexDirection: wide ? 'row' : 'column',
        background: 'var(--white)', borderRadius: '1rem', overflow: 'hidden',
        boxShadow: '0 2px 14px rgba(8,43,86,.07)', border: '1px solid var(--border)',
        textDecoration: 'none', transition: 'transform .25s, box-shadow .25s',
        gridColumn: wide ? '1 / -1' : undefined,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(8,43,86,.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = '';                 e.currentTarget.style.boxShadow = '0 2px 14px rgba(8,43,86,.07)' }}
    >
      {/* Cover */}
      <div style={{ height: wide ? 'auto' : 200, minHeight: wide ? 270 : undefined, flex: wide ? '0 0 44%' : undefined, background: 'var(--beige-50)', overflow: 'hidden', position: 'relative' }}>
        {post.coverImage
          ? <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ height: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📝</div>
        }
        {post.isFeatured && (
          <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--accent)', color: '#fff', padding: '.2rem .65rem', borderRadius: 99, fontSize: '.7rem', fontWeight: 700 }}>★ Featured</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: wide ? '2rem 2.25rem' : '1.15rem 1.2rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.35rem', justifyContent: wide ? 'center' : undefined }}>
        {post.tags?.length ? (
          <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginBottom: '.1rem' }}>
            {post.tags.slice(0, wide ? 4 : 2).map(t => (
              <span key={t} style={{ padding: '.12rem .52rem', background: 'rgba(8,43,86,.07)', borderRadius: 99, fontSize: '.68rem', color: 'var(--primary)', fontWeight: 600 }}>#{t}</span>
            ))}
          </div>
        ) : null}

        <h3 style={{ margin: 0, fontSize: wide ? '1.38rem' : '.97rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', lineHeight: 1.38, display: '-webkit-box', WebkitLineClamp: wide ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h3>

        {post.excerpt && (
          <p style={{ margin: '.1rem 0 0', fontSize: '.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: wide ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {post.excerpt}
          </p>
        )}

        {wide && (
          <div style={{ marginTop: '.85rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.55rem 1.25rem', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '.85rem' }}>
              Read Article →
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: wide ? '1.1rem' : '.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.72rem', fontWeight: 700, flexShrink: 0 }}>
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>{post.author}</p>
              {date && <p style={{ margin: 0, fontSize: '.7rem', color: 'var(--text-muted)' }}>{date}</p>}
            </div>
          </div>
          {post.readTime && <span style={{ fontSize: '.73rem', color: 'var(--text-muted)' }}>⏱ {post.readTime} min</span>}
        </div>
      </div>
    </a>
  )
}

/* ── Main Page ────────────────────────────── */
export default function BlogPublicPage() {
  const [posts,       setPosts]       = useState<Post[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeTag,   setActiveTag]   = useState('')
  const [page,        setPage]        = useState(1)
  const [pages,       setPages]       = useState(1)
  const [total,       setTotal]       = useState(0)

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

  const filtered  = activeTag ? posts.filter(p => p.tags?.includes(activeTag)) : posts
  const hasFilter = !search && !activeTag && page === 1
  const featuredP = hasFilter ? filtered.find(p => p.isFeatured) : undefined
  const rest      = filteredP => hasFilter && featuredP ? filtered.filter(p => p !== featuredP) : filtered

  return (
    <>
      {/* ── Hero ─────────────────────────────── */}
      <section style={{ background: 'var(--navy-700)', padding: '9rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', right: '-4rem', top: '-4rem', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,108,.15) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', left: '-5rem', bottom: '-5rem', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,108,.08) 0%,transparent 70%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="badge badge-white" style={{ marginBottom: '1rem' }}>Health Insights</span>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Medical Knowledge,<br /><em style={{ color: 'var(--beige-300)' }}>Simply Explained</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', maxWidth: 500, margin: '1.5rem auto 0', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Expert articles and health tips from our team of specialists — written for everyone.
          </p>
        </div>
      </section>

      {/* ── Content ─────────────────────────── */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">

          {/* ── Filter Card ──────────────────── */}
          <div style={{ background: 'var(--white)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 20px rgba(8,43,86,.07)', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>

            {/* Search row */}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 240px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
                <input
                  type="text" value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  placeholder="Search articles by title or author…"
                  style={{ width: '100%', padding: '.72rem .9rem .72rem 2.4rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '.9rem', background: 'var(--off-white)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(8,43,86,.08)' }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--border)';  e.target.style.boxShadow = 'none' }}
                />
              </div>
              <button onClick={doSearch}
                style={{ padding: '.72rem 1.6rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'opacity .2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Search
              </button>
              {(search || activeTag) && (
                <button onClick={doClear}
                  style={{ padding: '.72rem 1.1rem', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border)', fontSize: '.85rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Divider + Tag pills */}
            {allTags.length > 0 && (
              <>
                <div style={{ height: 1, background: 'var(--border)', margin: '1.1rem 0' }} />
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '.73rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginRight: '.2rem', flexShrink: 0 }}>Filter:</span>
                  {(['', ...allTags.slice(0, 14)] as string[]).map(t => {
                    const isAll    = t === ''
                    const isActive = isAll ? !activeTag : activeTag === t
                    return (
                      <button key={t || '__all'} onClick={() => { setActiveTag(isAll ? '' : (activeTag === t ? '' : t)); setPage(1) }}
                        style={{ padding: '.28rem .82rem', borderRadius: 99, border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`, background: isActive ? 'var(--primary)' : 'transparent', color: isActive ? '#fff' : 'var(--text-secondary)', fontWeight: isActive ? 600 : 400, fontSize: '.78rem', cursor: 'pointer', transition: 'all .18s', fontFamily: 'inherit' }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' } }}>
                        {isAll ? 'All' : `#${t}`}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* Count */}
            {!loading && (
              <p style={{ margin: '.85rem 0 0', fontSize: '.82rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> {total === 1 ? 'article' : 'articles'}
                {search    && <> matching <strong style={{ color: 'var(--navy-700)' }}>"{search}"</strong></>}
                {activeTag && <> tagged <strong style={{ color: 'var(--primary)' }}>#{activeTag}</strong></>}
              </p>
            )}
          </div>

          {/* ── Grid ─────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            ) : filtered.length > 0 ? (
              <>
                {featuredP && <PostCard post={featuredP} wide />}
                {(hasFilter && featuredP ? filtered.filter(p => p !== featuredP) : filtered).map(p => <PostCard key={p.id} post={p} />)}
              </>
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>🔍</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 .5rem' }}>No articles found</p>
                <p style={{ fontSize: '.9rem', margin: '0 0 1.5rem' }}>Try a different search or clear the filters</p>
                <button onClick={doClear} style={{ padding: '.6rem 1.5rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '.88rem', fontFamily: 'inherit' }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* ── Pagination ───────────────────── */}
          {pages > 1 && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '.45rem 1rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--white)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page === 1 ? 'default' : 'pointer', fontSize: '.84rem', fontFamily: 'inherit', opacity: page === 1 ? .5 : 1 }}>
                ← Prev
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 38, height: 38, borderRadius: 'var(--radius)', border: `1.5px solid ${page === n ? 'var(--primary)' : 'var(--border)'}`, background: page === n ? 'var(--primary)' : 'var(--white)', color: page === n ? '#fff' : 'var(--text-secondary)', fontWeight: page === n ? 700 : 400, cursor: 'pointer', fontSize: '.84rem', fontFamily: 'inherit', transition: 'all .15s' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                style={{ padding: '.45rem 1rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--white)', color: page === pages ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page === pages ? 'default' : 'pointer', fontSize: '.84rem', fontFamily: 'inherit', opacity: page === pages ? .5 : 1 }}>
                Next →
              </button>
            </div>
          )}

        </div>
      </section>

      <AppointmentBanner />
    </>
  )
}