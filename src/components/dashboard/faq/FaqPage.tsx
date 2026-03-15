'use client'
// components/dashboard/faq/FaqPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Search, ChevronDown, ChevronUp, Star, HelpCircle,
  ToggleLeft, ToggleRight, GripVertical,
} from 'lucide-react'

type FAQ = {
  id: number; question: string; answer: string
  category: string | null; order: number
  isActive: boolean; isFeatured: boolean; createdAt: string
}

const EMPTY = { question: '', answer: '', category: '', order: 0, isActive: true, isFeatured: false }

/* ── Form Modal ─────────────────────────────────────────── */
function FaqFormModal({ faq, categories, onClose, onSave }: {
  faq: FAQ | null; categories: string[]; onClose: () => void; onSave: () => void
}) {
  const [form,      setForm]      = useState(faq ? { ...faq, category: faq.category ?? '' } : EMPTY)
  const [newCat,    setNewCat]    = useState('')
  const [showNewCat,setShowNewCat]= useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.question.trim() || !form.answer.trim()) { setError('Question and answer are required.'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, category: form.category || newCat || null }
      const url    = faq ? `/api/dashboard/faq/${faq.id}` : '/api/dashboard/faq'
      const method = faq ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data   = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave()
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{faq ? 'Edit FAQ' : 'New FAQ'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {error && <div style={{ display: 'flex', gap: 8, padding: '0.6rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}

          <div className="form-group">
            <label className="form-label">Question *</label>
            <input className="form-input" value={form.question} onChange={e => set('question', e.target.value)} placeholder="What services do you offer?" />
          </div>

          <div className="form-group">
            <label className="form-label">Answer *</label>
            <textarea className="form-textarea" rows={5} value={form.answer} onChange={e => set('answer', e.target.value)} placeholder="We offer a wide range of medical aesthetic treatments including…" />
          </div>

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              {showNewCat ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="form-input" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" />
                  <button className="btn btn-secondary btn-sm" onClick={() => { setShowNewCat(false); setNewCat('') }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)} style={{ flex: 1 }}>
                    <option value="">No category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowNewCat(true)} style={{ whiteSpace: 'nowrap' }}>+ New</button>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input className="form-input" type="number" min="0" value={form.order} onChange={e => set('order', Number(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label className="toggle">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
              <span className="toggle-track"><span className="toggle-thumb" /></span>
              <span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Active</span>
            </label>
            <label className="toggle">
              <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
              <span className="toggle-track"><span className="toggle-thumb" /></span>
              <span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Featured</span>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}
            {faq ? 'Save Changes' : 'Add FAQ'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Accordion Item ─────────────────────────────────────── */
function FaqAccordion({ faq, onEdit, onDelete, onToggle }: {
  faq: FAQ
  onEdit   : () => void
  onDelete : () => void
  onToggle : () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: '0.5rem', opacity: faq.isActive ? 1 : 0.6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.85rem 1rem', cursor: 'pointer', background: open ? 'var(--primary-light)' : 'var(--surface)' }}
        onClick={() => setOpen(o => !o)}>
        <GripVertical size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {faq.isFeatured && <Star size={13} fill="#c49a6c" color="#c49a6c" style={{ flexShrink: 0 }} />}
          <span style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.4 }}>{faq.question}</span>
          {faq.category && <span style={{ padding: '2px 8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{faq.category}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
          <button className="btn-icon" title={faq.isActive ? 'Deactivate' : 'Activate'} onClick={onToggle} style={{ color: faq.isActive ? 'var(--success)' : 'var(--text-subtle)' }}>
            {faq.isActive ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
          </button>
          <button className="btn-icon" onClick={onEdit}><Edit2 size={13} /></button>
          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={onDelete}><Trash2 size={13} /></button>
        </div>
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </div>
      {open && (
        <div style={{ padding: '0.9rem 1rem 1rem 2.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
          {faq.answer}
        </div>
      )}
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function FaqPage() {
  const [faqs,       setFaqs]       = useState<FAQ[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('')
  const [modal,      setModal]      = useState(false)
  const [selected,   setSelected]   = useState<FAQ | null>(null)
  const [delId,      setDelId]      = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (search)    p.set('search',   search)
      if (catFilter) p.set('category', catFilter)
      const res  = await fetch(`/api/dashboard/faq?${p}`)
      const data = await res.json()
      setFaqs(data.faqs        ?? [])
      setCategories(data.categories ?? [])
    } catch {} finally { setLoading(false) }
  }, [search, catFilter])

  useEffect(() => { load() }, [load])

  const toggleActive = async (faq: FAQ) => {
    await fetch(`/api/dashboard/faq/${faq.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !faq.isActive }) })
    load()
  }

  const doDelete = async () => {
    if (!delId) return
    await fetch(`/api/dashboard/faq/${delId}`, { method: 'DELETE' })
    setDelId(null); load()
  }

  // Group by category
  const grouped = faqs.reduce((acc, f) => {
    const key = f.category ?? '__none__'
    if (!acc[key]) acc[key] = []
    acc[key].push(f)
    return acc
  }, {} as Record<string, FAQ[]>)

  const totalActive   = faqs.filter(f => f.isActive).length
  const totalFeatured = faqs.filter(f => f.isFeatured).length

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">FAQ</h1>
          <p className="page-subtitle">{faqs.length} questions · {totalActive} active · {totalFeatured} featured</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}><Plus size={15} /> New FAQ</button>
      </div>

      {/* Filters */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search questions…" value={search} onChange={e => { setSearch(e.target.value) }} />
          </div>
          <select className="form-select" style={{ width: 200 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
      ) : faqs.length === 0 ? (
        <div className="dash-card">
          <div className="empty-state">
            <HelpCircle size={32} className="empty-state-icon" />
            <p className="empty-state-title">No FAQs yet</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}><Plus size={13} /> Add First FAQ</button>
          </div>
        </div>
      ) : (
        <div>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {cat === '__none__' ? 'Uncategorized' : cat}
                </h3>
                <span style={{ padding: '1px 8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{items.length}</span>
              </div>
              {items.map(f => (
                <FaqAccordion
                  key={f.id}
                  faq={f}
                  onToggle={() => toggleActive(f)}
                  onEdit={() => { setSelected(f); setModal(true) }}
                  onDelete={() => setDelId(f.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {modal && <FaqFormModal faq={selected} categories={categories} onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}

      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header"><h2 className="modal-title">Delete FAQ</h2><button className="btn-icon" onClick={() => setDelId(null)}><X size={16} /></button></div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <p style={{ fontWeight: 600 }}>Delete this FAQ?</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={doDelete}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
