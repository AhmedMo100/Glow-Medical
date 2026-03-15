'use client'
// components/dashboard/blog/BlogAiPage.tsx

import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles, Wand2, RefreshCw, CheckCircle, AlertCircle,
  Eye, Edit3, Save, Send, X, Plus, Trash2, Tag, Clock,
  ChevronDown, ChevronUp, Image as ImgIcon, MoveUp, MoveDown,
  Copy, Check,
} from 'lucide-react'
import PhotoUpload from '@/components/shared/PhotoUpload'

/* ── Types ────────────────────────────────── */
type Sec = { heading: string; body: string; imageUrl: string; imageAlt: string; order: number }
type GeneratedPost = {
  title: string; slug: string; excerpt: string; content: string
  seoTitle: string; seoDescription: string
  tags: string[]; readTime: number; author: string
  sections: Sec[]
}

const TONES         = ['professional', 'friendly', 'educational', 'inspirational']
const TOPIC_IDEAS   = [
  'Benefits of Laser Hair Removal',
  'How to Prepare for a Plasma Session',
  'Post-Filler Aftercare Tips',
  'Best Skin Whitening Treatments',
  'Mesotherapy for Hair Loss',
  'Acne Treatment with IPL',
  'PDO Thread Lift Results',
  'Botox: Frequently Asked Questions',
  'Skin Hydration Treatments',
  'Chemical Peel Guide',
]

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `post-${Date.now()}`
}

/* ── Improve Modal ────────────────────────── */
function ImproveModal({ text, onClose, onDone }: { text: string; onClose: () => void; onDone: (t: string) => void }) {
  const [inst, setInst]       = useState('')
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')
  const PRESETS = ['Make it shorter', 'Add more detail', 'Friendlier tone', 'More medical detail', 'Improve SEO flow', 'Simplify language']

  const run = async () => {
    if (!inst.trim()) return
    setBusy(true); setError('')
    try {
      const res  = await fetch('/api/dashboard/blog/ai/improve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text, instruction: inst }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onDone(data.improved)
    } catch { setError('Network error') } finally { setBusy(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-md">
        <div className="modal-header"><h2 className="modal-title"><Wand2 size={15} /> Improve with AI</h2><button className="btn-icon" onClick={onClose}><X size={15} /></button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
          {error && <div style={{ padding: '.55rem .85rem', background: 'var(--danger-bg)', borderRadius: 8, color: 'var(--danger)', fontSize: '.82rem' }}>{error}</div>}
          <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: 0 }}>How should the AI improve this content?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {PRESETS.map(p => <button key={p} className="btn btn-secondary btn-sm" onClick={() => setInst(p)} style={{ borderRadius: 20, fontSize: '.73rem' }}>{p}</button>)}
          </div>
          <textarea className="form-textarea" rows={2} value={inst} onChange={e => setInst(e.target.value)} placeholder="Or describe what you want changed…" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={run} disabled={busy || !inst.trim()}>
            {busy ? <span className="spinner spinner-sm" /> : <Sparkles size={13} />} Improve
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Section Editor (with AI Improve per section) ── */
function SectionEditor({ sections, onChange, onImprove }: { sections: Sec[]; onChange: (s: Sec[]) => void; onImprove: (i: number) => void }) {
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
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => onImprove(i)} style={{ fontSize: '.73rem' }}><Wand2 size={10} /> Improve</button>
                </div>
                <textarea className="form-textarea" rows={4} placeholder="Section body…" value={s.body} onChange={e => upd(i, 'body', e.target.value)} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: 4 }}><ImgIcon size={11} /> Image (optional)</label>
                <PhotoUpload value={s.imageUrl} onChange={url => upd(i, 'imageUrl', url)} folder="glow-medical/blog/sections" size={70} shape="rect" />
                {s.imageUrl && <input className="form-input" placeholder="Image alt text / caption" value={s.imageAlt} onChange={e => upd(i, 'imageAlt', e.target.value)} style={{ marginTop: '.45rem' }} />}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Preview ──────────────────────────────── */
function Preview({ post, coverImage, sections }: { post: GeneratedPost; coverImage: string; sections: Sec[] }) {
  return (
    <div style={{ padding: '1.5rem', maxHeight: 560, overflowY: 'auto' }}>
      {coverImage && <img src={coverImage} alt="cover" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: '1.1rem' }} />}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: '.65rem' }}>
        {post.tags.map(t => <span key={t} style={{ padding: '2px 8px', background: 'var(--primary-light)', border: '1px solid var(--primary)40', borderRadius: 20, fontSize: '.7rem', color: 'var(--primary)', fontWeight: 600 }}>#{t}</span>)}
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '.45rem', lineHeight: 1.35 }}>{post.title}</h2>
      <div style={{ display: 'flex', gap: '.85rem', fontSize: '.76rem', color: 'var(--text-muted)', marginBottom: '.9rem' }}>
        <span>{post.author}</span>
        <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {post.readTime} min read</span>
      </div>
      {post.excerpt && <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', borderLeft: '3px solid var(--accent)', paddingLeft: '.8rem', marginBottom: '1.1rem', fontSize: '.86rem', lineHeight: 1.65 }}>{post.excerpt}</p>}
      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: '1.1rem' }}>
          {s.heading && <h3 style={{ fontSize: '.96rem', fontWeight: 700, marginBottom: '.4rem', color: 'var(--primary)' }}>{s.heading}</h3>}
          <p style={{ fontSize: '.85rem', lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap', margin: 0 }}>{s.body}</p>
          {s.imageUrl && <img src={s.imageUrl} alt={s.imageAlt || ''} style={{ width: '100%', borderRadius: 8, marginTop: '.75rem' }} />}
        </div>
      ))}
    </div>
  )
}

/* ══ MAIN PAGE ════════════════════════════════════════════ */
export default function BlogAiPage() {
  /* Generation form */
  const [topic,       setTopic]       = useState('')
  const [keywords,    setKeywords]    = useState('')
  const [tone,        setTone]        = useState('professional')
  const [numSections, setNumSections] = useState(4)
  const [length,      setLength]      = useState('medium')
  const [generating,  setGenerating]  = useState(false)
  const [genError,    setGenError]    = useState('')

  /* Editor state */
  const [post,       setPost]       = useState<GeneratedPost | null>(null)
  const [sections,   setSections]   = useState<Sec[]>([])
  const [cover,      setCover]      = useState('')
  const [activeTab,  setActiveTab]  = useState<'edit' | 'preview'>('edit')
  const [improving,  setImproving]  = useState<null | 'excerpt' | number>(null)
  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState('')
  const [saved,      setSaved]      = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [newTag,     setNewTag]     = useState('')

  const setP = (k: keyof GeneratedPost, v: any) => setPost(p => p ? { ...p, [k]: v } : p)

  /* Generate */
  const generate = useCallback(async () => {
    if (!topic.trim()) { setGenError('Please enter a topic.'); return }
    setGenerating(true); setGenError(''); setPost(null); setSections([]); setSaved(false)
    try {
      const res  = await fetch('/api/dashboard/blog/ai', {
        method : 'POST', headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ topic, keywords, tone, sections: numSections, targetLength: length }),
      })
      const data = await res.json()
      if (!res.ok) { setGenError(data.error ?? 'Generation failed'); return }
      setPost(data.generated)
      setSections((data.generated.sections ?? []).map((s: any, i: number) => ({
        heading: s.heading ?? '', body: s.body ?? '',
        imageUrl: s.imageUrl ?? '', imageAlt: s.imageAlt ?? '', order: i,
      })))
    } catch { setGenError('Network error — please try again.') } finally { setGenerating(false) }
  }, [topic, keywords, tone, numSections, length])

  /* Save */
  const save = async (publish = false) => {
    if (!post) return
    setSaving(true); setSaveError(''); setSaved(false)
    try {
      const payload = { ...post, coverImage: cover || null, isPublished: publish, sections: sections.map((s, i) => ({ ...s, order: i })) }
      const res  = await fetch('/api/dashboard/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error ?? 'Save failed'); return }
      setSaved(true)
    } catch { setSaveError('Network error') } finally { setSaving(false) }
  }

  const copySlug = () => { navigator.clipboard.writeText(post?.slug ?? ''); setCopied(true); setTimeout(() => setCopied(false), 1800) }
  const addTag   = () => { const t = newTag.trim().toLowerCase().replace(/\s+/g, '-'); if (t && !post?.tags.includes(t)) setP('tags', [...(post?.tags ?? []), t]); setNewTag('') }

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} style={{ color: '#c49a6c' }} /> Blog AI Generator
          </h1>
          <p className="page-subtitle">Generate professional medical articles powered by Groq AI</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: post ? '310px 1fr' : '560px', gap: '1.25rem', alignItems: 'start', margin: '0 auto' }}>

        {/* ── Generation Panel ── */}
        <div className="dash-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
          <h3 style={{ margin: 0, fontSize: '.9rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 5 }}><Wand2 size={14} /> Article Settings</h3>

          {genError && <div style={{ display: 'flex', gap: 7, padding: '.6rem .85rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '.82rem' }}><AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />{genError}</div>}

          {/* Topic */}
          <div className="form-group">
            <label className="form-label">Article Topic *</label>
            <textarea className="form-textarea" rows={2} value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Benefits of Laser Hair Removal for sensitive skin" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
              {TOPIC_IDEAS.slice(0, 4).map(s => (
                <button key={s} className="btn btn-secondary btn-sm" style={{ fontSize: '.7rem', borderRadius: 20, padding: '2px 7px' }} onClick={() => setTopic(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="form-group">
            <label className="form-label">Keywords <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
            <input className="form-input" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. laser, hair removal, session, cost" />
          </div>

          {/* Tone + Length + Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
            <div className="form-group">
              <label className="form-label">Tone</label>
              <select className="form-select" value={tone} onChange={e => setTone(e.target.value)}>
                {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Length</label>
              <select className="form-select" value={length} onChange={e => setLength(e.target.value)}>
                <option value="short">Short (~500w)</option>
                <option value="medium">Medium (~800w)</option>
                <option value="long">Long (~1200w)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Number of Sections</label>
            <select className="form-select" value={numSections} onChange={e => setNumSections(Number(e.target.value))}>
              {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} sections</option>)}
            </select>
          </div>

          <button className="btn btn-primary" onClick={generate} disabled={generating || !topic.trim()} style={{ width: '100%', justifyContent: 'center', padding: '.72rem', gap: 7 }}>
            {generating ? <><span className="spinner spinner-sm" /> Generating…</> : <><Sparkles size={14} /> Generate Article</>}
          </button>

          {post && (
            <button className="btn btn-secondary" onClick={() => { setPost(null); setSections([]); setSaved(false) }} style={{ width: '100%', justifyContent: 'center', fontSize: '.82rem' }}>
              <RefreshCw size={12} /> Generate New Article
            </button>
          )}

          {/* More ideas */}
          {!post && (
            <div>
              <p style={{ fontSize: '.73rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>More topic ideas</p>
              {TOPIC_IDEAS.slice(4).map(s => (
                <button key={s} onClick={() => setTopic(s)} style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '.81rem', color: 'var(--primary)', padding: '3px 0', fontFamily: 'inherit', width: '100%' }}>
                  <span style={{ color: 'var(--accent)', marginRight: 5 }}>→</span>{s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Editor Panel ── */}
        {post && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {saved     && <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '.7rem 1rem', background: 'var(--success-bg)', borderRadius: 9, color: 'var(--success)', fontSize: '.85rem' }}><CheckCircle size={15} /> Article saved successfully!</div>}
            {saveError && <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '.7rem 1rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '.85rem' }}><AlertCircle size={15} /> {saveError}</div>}

            {/* Tabs + Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 9, padding: 3, border: '1px solid var(--border)' }}>
                {(['edit','preview'] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '.4rem .9rem', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600, fontFamily: 'inherit', background: activeTab === t ? 'var(--surface)' : 'transparent', color: activeTab === t ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === t ? 'var(--shadow-sm)' : 'none' }}>
                    {t === 'edit' ? <><Edit3 size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Edit</> : <><Eye size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Preview</>}
                  </button>
                ))}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => save(false)} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : <Save size={12} />} Save Draft</button>
                <button className="btn btn-primary  btn-sm" onClick={() => save(true)}  disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : <Send size={12} />} Publish</button>
              </div>
            </div>

            {/* Edit */}
            {activeTab === 'edit' && (
              <div className="dash-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '.9rem' }}>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ImgIcon size={12} /> Cover Image</label>
                  <PhotoUpload value={cover} onChange={url => setCover(url)} folder="glow-medical/blog" size={90} shape="rect" />
                </div>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={post.title} onChange={e => setP('title', e.target.value)} style={{ fontWeight: 700 }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <input className="form-input" value={post.slug} onChange={e => setP('slug', e.target.value)} style={{ flex: 1, fontFamily: 'monospace', fontSize: '.84rem' }} />
                    <button className="btn btn-secondary btn-sm" onClick={copySlug}>{copied ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy</>}</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setP('slug', slugify(post.title))}><RefreshCw size={11} /></button>
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label className="form-label" style={{ margin: 0 }}>Excerpt</label>
                    <button className="btn btn-secondary btn-sm" onClick={() => setImproving('excerpt')} style={{ fontSize: '.73rem' }}><Wand2 size={10} /> Improve</button>
                  </div>
                  <textarea className="form-textarea" rows={2} value={post.excerpt} onChange={e => setP('excerpt', e.target.value)} />
                </div>

                <SectionEditor sections={sections} onChange={setSections} onImprove={i => setImproving(i)} />

                {/* Tags */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Tag size={12} /> Tags</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                    {post.tags.map(t => (
                      <span key={t} style={{ padding: '2px 9px', background: 'var(--primary-light)', border: '1px solid var(--primary)40', borderRadius: 20, fontSize: '.74rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        #{t}<button onClick={() => setP('tags', post.tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--primary)' }}><X size={9} /></button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <input className="form-input" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} style={{ flex: 1 }} />
                    <button className="btn btn-secondary btn-sm" onClick={addTag}><Plus size={11} /></button>
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
                  <div className="form-group">
                    <label className="form-label">Author</label>
                    <input className="form-input" value={post.author} onChange={e => setP('author', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Clock size={11} style={{ verticalAlign: 'middle' }} /> Read Time (min)</label>
                    <input className="form-input" type="number" min="1" value={post.readTime} onChange={e => setP('readTime', Number(e.target.value))} />
                  </div>
                </div>

                {/* SEO */}
                <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '.9rem', background: 'var(--surface-2)' }}>
                  <p style={{ margin: '0 0 .65rem', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>SEO</p>
                  <div className="form-group">
                    <label className="form-label">SEO Title</label>
                    <input className="form-input" value={post.seoTitle} onChange={e => setP('seoTitle', e.target.value)} placeholder="Max 60 chars" />
                    <span style={{ fontSize: '.7rem', color: post.seoTitle.length > 60 ? 'var(--danger)' : 'var(--text-subtle)' }}>{post.seoTitle.length}/60</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meta Description</label>
                    <textarea className="form-textarea" rows={2} value={post.seoDescription} onChange={e => setP('seoDescription', e.target.value)} placeholder="Max 160 chars" />
                    <span style={{ fontSize: '.7rem', color: post.seoDescription.length > 160 ? 'var(--danger)' : 'var(--text-subtle)' }}>{post.seoDescription.length}/160</span>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {activeTab === 'preview' && (
              <div className="dash-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '.7rem 1.1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Eye size={13} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Article Preview</span>
                </div>
                <Preview post={post} coverImage={cover} sections={sections} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Improve modal */}
      {improving !== null && post && (
        <ImproveModal
          text={improving === 'excerpt' ? post.excerpt : sections[improving as number]?.body ?? ''}
          onClose={() => setImproving(null)}
          onDone={improved => {
            if (improving === 'excerpt') setP('excerpt', improved)
            else { const s = [...sections]; s[improving as number] = { ...s[improving as number], body: improved }; setSections(s) }
            setImproving(null)
          }}
        />
      )}
    </div>
  )
}
