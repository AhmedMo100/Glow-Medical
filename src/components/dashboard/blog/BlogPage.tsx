'use client'
// components/dashboard/blog/BlogPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight, Eye, EyeOff,
  Star, Clock, User, Tag, Sparkles,
  ChevronDown, ChevronUp, Image as ImgIcon, MoveUp, MoveDown,
} from 'lucide-react'
import PhotoUpload from '@/components/shared/PhotoUpload'

/* ── Types ────────────────────────────────── */
type Sec = { heading: string; body: string; imageUrl: string; imageAlt: string; order: number }
type Post = {
  id: number; title: string; slug: string
  excerpt: string | null; coverImage: string | null
  isPublished: boolean; isFeatured: boolean
  author: string; tags: string[]; readTime: number | null
  publishedAt: string | null; createdAt: string
  _count: { sections: number }
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `post-${Date.now()}`
}

/* ── Section Editor ───────────────────────── */
function SectionEditor({ sections, onChange }: { sections: Sec[]; onChange: (s: Sec[]) => void }) {
  const [open, setOpen] = useState<number[]>([0])
  const toggle = (i: number) => setOpen(o => o.includes(i) ? o.filter(x => x !== i) : [...o, i])
  const upd = (i: number, k: keyof Sec, v: any) => { const s = [...sections]; (s[i] as any)[k] = v; onChange(s) }
  const add = () => { const n = [...sections, { heading: '', body: '', imageUrl: '', imageAlt: '', order: sections.length }]; onChange(n); setOpen(o => [...o, n.length - 1]) }
  const del = (i: number) => onChange(sections.filter((_, x) => x !== i).map((s, x) => ({ ...s, order: x })))
  const move = (i: number, dir: -1 | 1) => {
    const s = [...sections]; const j = i + dir
    if (j < 0 || j >= s.length) return
    ;[s[i], s[j]] = [s[j], s[i]]; onChange(s.map((x, idx) => ({ ...x, order: idx })))
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
        <label className="form-label" style={{ margin: 0 }}>Sections ({sections.length})</label>
        <button className="btn btn-secondary btn-sm" onClick={add}><Plus size={12} /> Add Section</button>
      </div>
      {sections.map((s, i) => (
        <div key={i} style={{ border: '1.5px solid var(--border)', borderRadius: 10, marginBottom: '.4rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '.55rem .8rem', background: 'var(--surface-2)', cursor: 'pointer' }} onClick={() => toggle(i)}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: '.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.heading || `Section ${i + 1}`}</span>
            {s.imageUrl && <span style={{ fontSize: '.7rem' }}>📷</span>}
            <button className="btn-icon" onClick={e => { e.stopPropagation(); move(i, -1) }} disabled={i === 0} style={{ color: 'var(--text-muted)' }}><MoveUp size={10} /></button>
            <button className="btn-icon" onClick={e => { e.stopPropagation(); move(i, 1) }} disabled={i === sections.length - 1} style={{ color: 'var(--text-muted)' }}><MoveDown size={10} /></button>
            <button className="btn-icon" onClick={e => { e.stopPropagation(); del(i) }} style={{ color: 'var(--danger)' }}><Trash2 size={11} /></button>
            {open.includes(i) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
          {open.includes(i) && (
            <div style={{ padding: '.8rem', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
              <input className="form-input" placeholder="Section heading (optional)" value={s.heading} onChange={e => upd(i, 'heading', e.target.value)} />
              <textarea className="form-textarea" rows={4} placeholder="Section body…" value={s.body} onChange={e => upd(i, 'body', e.target.value)} />
              <div>
                <label className="form-label" style={{ fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: 4 }}><ImgIcon size={11} /> Section Image (optional)</label>
                <PhotoUpload value={s.imageUrl} onChange={url => upd(i, 'imageUrl', url)} folder="glow-medical/blog/sections" size={70} shape="rect" />
                {s.imageUrl && <input className="form-input" placeholder="Image alt / caption" value={s.imageAlt} onChange={e => upd(i, 'imageAlt', e.target.value)} style={{ marginTop: '.45rem' }} />}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Post Modal (Add + Edit) ──────────────── */
function PostModal({ post, onClose, onSave }: { post: Post | null; onClose: () => void; onSave: () => void }) {
  const isEdit = !!post
  const [tab, setTab] = useState<'basic' | 'sections' | 'seo'>('basic')
  const [form, setForm] = useState({
    title: post?.title ?? '', slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '', content: '',
    author: post?.author ?? 'Glow Medical Team',
    coverImage: post?.coverImage ?? '',
    tags: post?.tags.join(', ') ?? '',
    readTime: post?.readTime ? String(post.readTime) : '',
    isPublished: post?.isPublished ?? false,
    isFeatured: post?.isFeatured ?? false,
    seoTitle: '', seoDescription: '',
  })
  const [sections, setSections] = useState<Sec[]>([])
  const [loadingPost, setLoadingPost] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!post) return
    fetch(`/api/dashboard/blog/${post.id}`)
      .then(r => r.json()).then(d => {
        const p = d.post
        set('content',        p.content        ?? '')
        set('seoTitle',       p.seoTitle       ?? '')
        set('seoDescription', p.seoDescription ?? '')
        setSections((p.sections ?? []).map((s: any) => ({ heading: s.heading ?? '', body: s.body, imageUrl: s.imageUrl ?? '', imageAlt: s.imageAlt ?? '', order: s.order })))
      }).catch(() => {}).finally(() => setLoadingPost(false))
  }, [post])

  const submit = async () => {
    if (!form.title.trim() || !form.slug.trim()) { setError('Title and slug are required'); return }
    if (!form.content.trim() && sections.length === 0) { setError('Add content or at least one section'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        tags    : form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        readTime: form.readTime ? Number(form.readTime) : null,
        sections: sections.map((s, i) => ({ ...s, order: i })),
      }
      const url    = isEdit ? `/api/dashboard/blog/${post!.id}` : '/api/dashboard/blog'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data   = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave()
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg" style={{ maxWidth: 740 }}>
        <div className="modal-header">
          <h2 className="modal-title"><Edit2 size={14} /> {isEdit ? 'Edit Post' : 'New Post'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Tab strip */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
          {([['basic','📝 Basic'],['sections',`📄 Sections (${sections.length})`],['seo','🔍 SEO']] as [string,string][]).map(([k,l]) => (
            <button key={k} onClick={() => setTab(k as any)} style={{ padding: '.5rem .85rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '.83rem', fontFamily: 'inherit', fontWeight: tab === k ? 700 : 400, color: tab === k ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === k ? '2px solid var(--primary)' : '2px solid transparent' }}>
              {l}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '.85rem', maxHeight: '58vh', overflowY: 'auto' }}>
          {error && <div style={{ display: 'flex', gap: 8, padding: '.6rem .9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '.82rem' }}><AlertCircle size={13} />{error}</div>}
          {loadingPost && <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" /></div>}

          {!loadingPost && tab === 'basic' && (<>
            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <PhotoUpload value={form.coverImage} onChange={url => set('coverImage', url)} folder="glow-medical/blog" size={85} shape="rect" />
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => { set('title', e.target.value); if (!isEdit) set('slug', slugify(e.target.value)) }} />
            </div>
            <div className="form-group">
              <label className="form-label">Slug *</label>
              <input className="form-input" value={form.slug} onChange={e => set('slug', e.target.value)} style={{ fontFamily: 'monospace', fontSize: '.85rem' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Excerpt</label>
              <textarea className="form-textarea" rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Brief summary shown in listings…" />
            </div>
            <div className="form-group">
              <label className="form-label">Content <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>(optional if sections added)</span></label>
              <textarea className="form-textarea" rows={4} value={form.content} onChange={e => set('content', e.target.value)} />
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label"><User size={11} style={{ verticalAlign: 'middle' }} /> Author</label>
                <input className="form-input" value={form.author} onChange={e => set('author', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><Clock size={11} style={{ verticalAlign: 'middle' }} /> Read Time (min)</label>
                <input className="form-input" type="number" min="1" value={form.readTime} onChange={e => set('readTime', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><Tag size={11} style={{ verticalAlign: 'middle' }} /> Tags (comma-separated)</label>
              <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="laser, skin, botox" />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[['isPublished','Published'],['isFeatured','Featured']].map(([k,l]) => (
                <label key={k} className="toggle">
                  <input type="checkbox" checked={(form as any)[k]} onChange={e => set(k, e.target.checked)} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                  <span style={{ marginLeft: 7, fontSize: '.83rem' }}>{l}</span>
                </label>
              ))}
            </div>
          </>)}

          {!loadingPost && tab === 'sections' && <SectionEditor sections={sections} onChange={setSections} />}

          {!loadingPost && tab === 'seo' && (<>
            <div className="form-group">
              <label className="form-label">SEO Title</label>
              <input className="form-input" value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="Max 60 characters" />
              <span style={{ fontSize: '.72rem', color: form.seoTitle.length > 60 ? 'var(--danger)' : 'var(--text-subtle)' }}>{form.seoTitle.length}/60</span>
            </div>
            <div className="form-group">
              <label className="form-label">Meta Description</label>
              <textarea className="form-textarea" rows={3} value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} placeholder="Max 160 characters" />
              <span style={{ fontSize: '.72rem', color: form.seoDescription.length > 160 ? 'var(--danger)' : 'var(--text-subtle)' }}>{form.seoDescription.length}/160</span>
            </div>
          </>)}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={13} />}
            {isEdit ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ────────────────────────────── */
export default function BlogPage() {
  const [posts,     setPosts]     = useState<Post[]>([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [pages,     setPages]     = useState(1)
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [pubFilter, setPubFilter] = useState('')
  const [modal,     setModal]     = useState(false)
  const [selected,  setSelected]  = useState<Post | null>(null)
  const [delId,     setDelId]     = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '12' })
      if (search)    p.set('search',    search)
      if (pubFilter) p.set('published', pubFilter)
      const res  = await fetch(`/api/dashboard/blog?${p}`)
      const data = await res.json()
      setPosts(data.posts ?? []); setTotal(data.total ?? 0); setPages(data.pages ?? 1)
    } catch {} finally { setLoading(false) }
  }, [page, search, pubFilter])

  useEffect(() => { load() }, [load])

  const togglePublish = async (p: Post) => {
    await fetch(`/api/dashboard/blog/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: !p.isPublished }) })
    load()
  }
  const doDelete = async () => {
    if (!delId) return
    await fetch(`/api/dashboard/blog/${delId}`, { method: 'DELETE' })
    setDelId(null); load()
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blog Posts</h1>
          <p className="page-subtitle">{total} total · {posts.filter(p => p.isPublished).length} published · {posts.filter(p => !p.isPublished).length} drafts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => { setSelected(null); setModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New Post
          </button>
          <a href="/dashboard/blog/ai" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <Sparkles size={14} /> AI Generator
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '.8rem 1rem' }}>
        <div style={{ display: 'flex', gap: '.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 30 }} placeholder="Search posts…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select" style={{ width: 150 }} value={pubFilter} onChange={e => { setPubFilter(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
      ) : posts.length === 0 ? (
        <div className="dash-card">
          <div className="empty-state">
            <Edit2 size={30} className="empty-state-icon" />
            <p className="empty-state-title">No posts yet</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(null); setModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Plus size={13} /> New Post</button>
              <a href="/dashboard/blog/ai" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}><Sparkles size={13} /> AI Generator</a>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
          {posts.map(p => (
            <div key={p.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
              {/* Cover */}
              <div style={{ height: 125, background: 'var(--surface-2)', position: 'relative', overflow: 'hidden' }}>
                {p.coverImage
                  ? <img src={p.coverImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={26} style={{ opacity: .12 }} /></div>
                }
                <div style={{ position: 'absolute', top: 7, left: 7, display: 'flex', gap: 3 }}>
                  <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: '.67rem', fontWeight: 700, background: p.isPublished ? 'var(--success-bg)' : 'var(--surface)', color: p.isPublished ? 'var(--success)' : 'var(--text-muted)', border: `1px solid ${p.isPublished ? 'var(--success)' : 'var(--border)'}40` }}>
                    {p.isPublished ? '● Published' : '○ Draft'}
                  </span>
                  {p.isFeatured && <span style={{ padding: '2px 6px', background: '#c49a6c', color: '#fff', borderRadius: 20, fontSize: '.67rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><Star size={8} fill="#fff" />Featured</span>}
                </div>
              </div>
              {/* Body */}
              <div style={{ padding: '.9rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                <h4 style={{ margin: 0, fontSize: '.86rem', fontWeight: 700, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h4>
                {p.excerpt && <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</p>}
                <div style={{ display: 'flex', gap: '.65rem', fontSize: '.73rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><User size={10} />{p.author}</span>
                  {p.readTime && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Clock size={10} />{p.readTime}m</span>}
                  <span>{p._count.sections} sections</span>
                </div>
                {p.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {p.tags.slice(0, 3).map(t => <span key={t} style={{ padding: '1px 6px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '.66rem', color: 'var(--text-muted)' }}>#{t}</span>)}
                    {p.tags.length > 3 && <span style={{ fontSize: '.66rem', color: 'var(--text-subtle)' }}>+{p.tags.length - 3}</span>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 5, borderTop: '1px solid var(--border)', paddingTop: '.7rem', marginTop: 'auto' }}>
                  <button className="btn-icon" title={p.isPublished ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(p)} style={{ color: p.isPublished ? 'var(--success)' : 'var(--text-subtle)' }}>
                    {p.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelected(p); setModal(true) }}><Edit2 size={12} /> Edit</button>
                  <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDelId(p.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1}     onClick={() => setPage(q => q - 1)}><ChevronLeft  size={13} /></button>
          <span style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(q => q + 1)}><ChevronRight size={13} /></button>
        </div>
      )}

      {modal && <PostModal post={selected} onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}

      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header"><h2 className="modal-title">Delete Post</h2><button className="btn-icon" onClick={() => setDelId(null)}><X size={15} /></button></div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}><Trash2 size={20} /></div>
              <p style={{ fontWeight: 600 }}>Delete this post?</p>
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>All sections and images will be permanently removed.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={doDelete}><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
