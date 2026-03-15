'use client'
// components/dashboard/categories/CategoriesPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Tag, Search, ToggleLeft, ToggleRight, GripVertical,
} from 'lucide-react'

type Category = {
  id: number; name: string; slug: string
  description: string | null; icon: string | null
  imageUrl: string | null; color: string | null
  isActive: boolean; order: number; createdAt: string
  _count: { services: number }
}

const EMPTY = {
  name: '', slug: '', description: '', icon: '',
  imageUrl: '', color: '#082b56', isActive: true, order: 0,
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

/* ── Form Modal ─────────────────────────────────────────── */
function CategoryFormModal({ cat, onClose, onSave }: { cat: Category | null; onClose: () => void; onSave: () => void }) {
  const [form,   setForm]   = useState(cat ? { ...cat, icon: cat.icon ?? '', imageUrl: cat.imageUrl ?? '', description: cat.description ?? '', color: cat.color ?? '#082b56' } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.slug.trim()) { setError('Slug is required'); return }
    setSaving(true); setError('')
    try {
      const url    = cat ? `/api/dashboard/categories/${cat.id}` : '/api/dashboard/categories'
      const method = cat ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data   = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave()
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-md">
        <div className="modal-header">
          <h2 className="modal-title">{cat ? 'Edit Category' : 'New Category'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem' }}><AlertCircle size={14} />{error}</div>}

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={e => { set('name', e.target.value); if (!cat) set('slug', slugify(e.target.value)) }} placeholder="e.g. Laser Treatments" />
            </div>
            <div className="form-group">
              <label className="form-label">Slug *</label>
              <input className="form-input" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="laser-treatments" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description…" />
          </div>

          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">Icon (emoji / text)</label>
              <input className="form-input" value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="✨" />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={e => set('color', e.target.value)} style={{ width: 40, height: 38, border: '1.5px solid var(--border)', borderRadius: 7, cursor: 'pointer', padding: 2 }} />
                <input className="form-input" value={form.color} onChange={e => set('color', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Order</label>
              <input className="form-input" type="number" min={0} value={form.order} onChange={e => set('order', Number(e.target.value))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input className="form-input" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" />
          </div>

          <label className="toggle">
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
            <span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Active</span>
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}
            {cat ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Delete Confirm ─────────────────────────────────────── */
function DeleteConfirm({ cat, onClose, onDeleted }: { cat: Category; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')
  const doDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/dashboard/categories/${cat.id}`, { method: 'DELETE' })
    if (res.ok) { onDeleted() } else { setError('Cannot delete — it may have services.'); setDeleting(false) }
  }
  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div className="modal-header"><h2 className="modal-title">Delete Category</h2><button className="btn-icon" onClick={onClose}><X size={16} /></button></div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}><Trash2 size={22} /></div>
          <p style={{ fontWeight: 600 }}>Delete "{cat.name}"?</p>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>This cannot be undone. Categories with services cannot be deleted.</p>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.83rem', marginTop: 8 }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={doDelete} disabled={deleting}>{deleting ? <span className="spinner spinner-sm" /> : <Trash2 size={14} />} Delete</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function CategoriesPage() {
  const [cats,    setCats]    = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(false)
  const [delModal,setDelModal]= useState(false)
  const [selected,setSelected]= useState<Category | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/dashboard/categories?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setCats(data.categories ?? [])
    } catch {} finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  const toggleActive = async (cat: Category) => {
    await fetch(`/api/dashboard/categories/${cat.id}`, {
      method : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ isActive: !cat.isActive }),
    })
    load()
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <div><h1 className="page-title">Categories</h1><p className="page-subtitle">{cats.length} categories</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}><Plus size={15} /> New Category</button>
      </div>

      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ position: 'relative', maxWidth: 340 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="dash-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner spinner-lg" /></div>
        ) : cats.length === 0 ? (
          <div className="empty-state">
            <Tag size={32} className="empty-state-icon" />
            <p className="empty-state-title">No categories yet</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}><Plus size={13} /> Add Category</button>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead><tr><th>Order</th><th>Category</th><th>Slug</th><th>Services</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {cats.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', width: 60 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GripVertical size={14} style={{ opacity: 0.3 }} />{c.order}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {c.color && <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />}
                        <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{c.name}</div>
                          {c.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td><code style={{ fontSize: '0.78rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 5 }}>{c.slug}</code></td>
                    <td><span className="badge badge-neutral">{c._count.services} services</span></td>
                    <td>
                      <button onClick={() => toggleActive(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: c.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                        {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => { setSelected(c); setModal(true) }}><Edit2 size={13} /></button>
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => { setSelected(c); setDelModal(true) }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal    && <CategoryFormModal cat={selected} onClose={() => setModal(false)}    onSave={() => { setModal(false);    load() }} />}
      {delModal && selected && <DeleteConfirm cat={selected} onClose={() => setDelModal(false)} onDeleted={() => { setDelModal(false); load() }} />}
    </div>
  )
}
