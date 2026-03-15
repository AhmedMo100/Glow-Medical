'use client'
// components/dashboard/services/ServicesPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight, Star, Tag,
  ToggleLeft, ToggleRight, DollarSign, Clock,
} from 'lucide-react'
import PhotoUpload from '@/components/shared/PhotoUpload'

type Category = { id: number; name: string; color: string | null }
type Service = {
  id: number; name: string; slug: string
  description: string | null; shortDescription: string | null
  price: number; discountedPrice: number | null; duration: number | null
  imageUrl: string | null; isActive: boolean; isFeatured: boolean; order: number
  categoryId: number; createdAt: string
  category: Category
  _count: { appointmentServices: number }
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

const EMPTY = {
  name: '', slug: '', description: '', shortDescription: '',
  price: '', discountedPrice: '', duration: '', imageUrl: '',
  isActive: true, isFeatured: false, order: 0, categoryId: '',
}

/* ── Form Modal ─────────────────────────────────────────── */
function ServiceFormModal({ service, categories, onClose, onSave }: {
  service: Service | null; categories: Category[]; onClose: () => void; onSave: () => void
}) {
  const [form,   setForm]   = useState(service ? {
    name            : service.name,
    slug            : service.slug,
    description     : service.description     ?? '',
    shortDescription: service.shortDescription ?? '',
    price           : String(service.price),
    discountedPrice : service.discountedPrice ? String(service.discountedPrice) : '',
    duration        : service.duration        ? String(service.duration)        : '',
    imageUrl        : service.imageUrl        ?? '',
    isActive        : service.isActive,
    isFeatured      : service.isFeatured,
    order           : service.order,
    categoryId      : String(service.categoryId),
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.slug || !form.price || !form.categoryId) {
      setError('Name, slug, price, and category are required.'); return
    }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        price          : Number(form.price),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : null,
        duration       : form.duration        ? Number(form.duration)        : null,
        categoryId     : Number(form.categoryId),
      }
      const url    = service ? `/api/dashboard/services/${service.id}` : '/api/dashboard/services'
      const method = service ? 'PATCH' : 'POST'
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
          <h2 className="modal-title">{service ? 'Edit Service' : 'New Service'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {error && <div style={{ display: 'flex', gap: 8, padding: '0.6rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <PhotoUpload
              value={form.imageUrl}
              onChange={url => set('imageUrl', url)}
              folder="glow-medical/services"
              size={110}
              shape="rect"
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={e => { set('name', e.target.value); if (!service) set('slug', slugify(e.target.value)) }} placeholder="Laser Hair Removal" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input className="form-input" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="laser-hair-removal" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <input className="form-input" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="One-line summary shown on cards…" />
          </div>
          <div className="form-group">
            <label className="form-label">Full Description</label>
            <textarea className="form-textarea" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed service description…" />
          </div>

          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">Price (EGP) *</label>
              <input className="form-input" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Discounted Price</label>
              <input className="form-input" type="number" min="0" value={form.discountedPrice} onChange={e => set('discountedPrice', e.target.value)} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input className="form-input" type="number" min="0" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="60" />
            </div>
          </div>

          <div className="form-row form-row-2">
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
            {service ? 'Save Changes' : 'Create Service'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function ServicesPage() {
  const [services,   setServices]   = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [pages,      setPages]      = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('')
  const [modal,      setModal]      = useState(false)
  const [delId,      setDelId]      = useState<number | null>(null)
  const [selected,   setSelected]   = useState<Service | null>(null)
  const [deleting,   setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '16' })
      if (search)    p.set('search',     search)
      if (catFilter) p.set('categoryId', catFilter)
      const res  = await fetch(`/api/dashboard/services?${p}`)
      const data = await res.json()
      setServices(data.services ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } catch {} finally { setLoading(false) }
  }, [page, search, catFilter])

  useEffect(() => {
    fetch('/api/dashboard/categories').then(r => r.json()).then(d => setCategories(d.categories ?? [])).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const toggleActive = async (s: Service) => {
    await fetch(`/api/dashboard/services/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.isActive }) })
    load()
  }

  const doDelete = async () => {
    if (!delId) return
    setDeleting(true)
    await fetch(`/api/dashboard/services/${delId}`, { method: 'DELETE' })
    setDeleting(false); setDelId(null); load()
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <div><h1 className="page-title">Services</h1><p className="page-subtitle">{total} total services</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}><Plus size={15} /> New Service</button>
      </div>

      {/* Filters */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search services…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select" style={{ width: 180 }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
      ) : services.length === 0 ? (
        <div className="dash-card">
          <div className="empty-state">
            <Tag size={32} className="empty-state-icon" />
            <p className="empty-state-title">No services found</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}><Plus size={13} /> Add Service</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
          {services.map(s => (
            <div key={s.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Image */}
              <div style={{ height: 140, background: 'var(--surface-2)', overflow: 'hidden', position: 'relative' }}>
                {s.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.imageUrl} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)' }}>
                    <Tag size={32} style={{ opacity: 0.3 }} />
                  </div>
                )}
                {s.isFeatured && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#c49a6c', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={10} fill="#fff" /> Featured
                  </div>
                )}
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: s.category.color ? `${s.category.color}22` : 'var(--surface)', color: s.category.color ?? 'var(--text-muted)', border: `1px solid ${s.category.color ?? 'var(--border)'}40` }}>
                    {s.category.name}
                  </span>
                </div>
              </div>

              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>{s.name}</h4>
                {s.shortDescription && <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{s.shortDescription}</p>}

                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {s.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={12} />{s.duration} min</span>}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><DollarSign size={12} />{s._count.appointmentServices} bookings</span>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    {s.discountedPrice ? (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textDecoration: 'line-through', marginRight: 4 }}>EGP {Number(s.price).toLocaleString()}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>EGP {Number(s.discountedPrice).toLocaleString()}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>EGP {Number(s.price).toLocaleString()}</span>
                    )}
                  </div>
                  <button onClick={() => toggleActive(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.isActive ? 'var(--success)' : 'var(--text-subtle)' }}>
                    {s.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelected(s); setModal(true) }}><Edit2 size={13} /> Edit</button>
                  <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDelId(s.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1}     onClick={() => setPage(p => p - 1)}><ChevronLeft  size={14} /></button>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
        </div>
      )}

      {modal && <ServiceFormModal service={selected} categories={categories} onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}

      {/* Delete confirm */}
      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header"><h2 className="modal-title">Delete Service</h2><button className="btn-icon" onClick={() => setDelId(null)}><X size={16} /></button></div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <p style={{ fontWeight: 600 }}>Delete this service?</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={doDelete} disabled={deleting}>{deleting ? <span className="spinner spinner-sm" /> : <Trash2 size={14} />} Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
