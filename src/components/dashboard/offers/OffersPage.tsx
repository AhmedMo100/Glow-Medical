'use client'
// components/dashboard/offers/OffersPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight, Tag, Percent,
  Calendar, ToggleLeft, ToggleRight, Star,
} from 'lucide-react'
import PhotoUpload from '@/components/shared/PhotoUpload'

type Service  = { id: number; name: string; price: number }
type Offer = {
  id: number; title: string; slug: string
  description: string | null; type: string
  imageUrl: string | null; originalPrice: number; finalPrice: number
  discountPct: number | null; validFrom: string | null; validUntil: string | null
  isActive: boolean; isFeatured: boolean; usageLimit: number | null; usageCount: number
  termsText: string | null; createdAt: string
  services: { service: Service }[]
  _count: { appointmentOffers: number }
}

const OFFER_TYPES = ['BUNDLE', 'SEASONAL', 'FIRST_VISIT', 'LOYALTY', 'FLASH']
const TYPE_COLOR: Record<string, string> = {
  BUNDLE: '#082b56', SEASONAL: '#059669', FIRST_VISIT: '#2563eb',
  LOYALTY: '#c49a6c', FLASH: '#dc2626',
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

/* ── Offer Form Modal ────────────────────────────────────── */
function OfferFormModal({ offer, services, onClose, onSave }: {
  offer: Offer | null; services: Service[]; onClose: () => void; onSave: () => void
}) {
  const [form,        setForm]        = useState({
    title        : offer?.title         ?? '',
    slug         : offer?.slug          ?? '',
    description  : offer?.description   ?? '',
    type         : offer?.type          ?? 'BUNDLE',
    imageUrl     : offer?.imageUrl      ?? '',
    originalPrice: offer ? String(offer.originalPrice) : '',
    finalPrice   : offer ? String(offer.finalPrice)    : '',
    discountPct  : offer?.discountPct   ? String(offer.discountPct) : '',
    validFrom    : offer?.validFrom     ? offer.validFrom.slice(0, 10)    : '',
    validUntil   : offer?.validUntil    ? offer.validUntil.slice(0, 10)   : '',
    isActive     : offer?.isActive      ?? true,
    isFeatured   : offer?.isFeatured    ?? false,
    usageLimit   : offer?.usageLimit    ? String(offer.usageLimit) : '',
    termsText    : offer?.termsText     ?? '',
  })
  const [selectedSvcIds, setSelectedSvcIds] = useState<number[]>(offer?.services?.map(s => s.service.id) ?? [])
  const [svcSearch,      setSvcSearch]      = useState('')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  // Auto-calc discount %
  const calcDiscount = (orig: string, final: string) => {
    const o = Number(orig); const f = Number(final)
    if (o > 0 && f > 0 && f < o) set('discountPct', String(Math.round(((o - f) / o) * 100)))
  }

  const toggleService = (id: number) =>
    setSelectedSvcIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const filteredSvcs = services.filter(s => s.name.toLowerCase().includes(svcSearch.toLowerCase()))

  const submit = async () => {
    if (!form.title || !form.slug || !form.originalPrice || !form.finalPrice) {
      setError('Title, slug, and prices are required.'); return
    }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        originalPrice: Number(form.originalPrice),
        finalPrice   : Number(form.finalPrice),
        discountPct  : form.discountPct  ? Number(form.discountPct)  : null,
        usageLimit   : form.usageLimit   ? Number(form.usageLimit)   : null,
        validFrom    : form.validFrom    || null,
        validUntil   : form.validUntil   || null,
        serviceIds   : selectedSvcIds,
      }
      const url    = offer ? `/api/dashboard/offers/${offer.id}` : '/api/dashboard/offers'
      const method = offer ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data   = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave()
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-xl">
        <div className="modal-header">
          <h2 className="modal-title">{offer ? 'Edit Offer' : 'New Offer'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ display: 'flex', gap: 8, padding: '0.6rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <PhotoUpload value={form.imageUrl} onChange={url => set('imageUrl', url)} folder="glow-medical/offers" size={110} shape="rect" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => { set('title', e.target.value); if (!offer) set('slug', slugify(e.target.value)) }} placeholder="Summer Glow Bundle" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                    {OFFER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input className="form-input" value={form.slug} onChange={e => set('slug', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Prices */}
          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">Original Price (EGP) *</label>
              <input className="form-input" type="number" min="0" value={form.originalPrice}
                onChange={e => { set('originalPrice', e.target.value); calcDiscount(e.target.value, form.finalPrice) }} />
            </div>
            <div className="form-group">
              <label className="form-label">Final Price (EGP) *</label>
              <input className="form-input" type="number" min="0" value={form.finalPrice}
                onChange={e => { set('finalPrice', e.target.value); calcDiscount(form.originalPrice, e.target.value) }} />
            </div>
            <div className="form-group">
              <label className="form-label">Discount %</label>
              <input className="form-input" type="number" min="0" max="100" value={form.discountPct} onChange={e => set('discountPct', e.target.value)} placeholder="Auto-calculated" />
            </div>
          </div>

          {/* Dates + limit */}
          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">Valid From</label>
              <input className="form-input" type="date" value={form.validFrom} onChange={e => set('validFrom', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input className="form-input" type="date" value={form.validUntil} onChange={e => set('validUntil', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Usage Limit</label>
              <input className="form-input" type="number" min="0" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} placeholder="Unlimited" />
            </div>
          </div>

          {/* Services picker */}
          <div className="form-group">
            <label className="form-label">Included Services ({selectedSvcIds.length} selected)</label>
            <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input className="form-input" style={{ paddingLeft: 28, fontSize: '0.82rem' }} placeholder="Filter services…" value={svcSearch} onChange={e => setSvcSearch(e.target.value)} />
                </div>
              </div>
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                {filteredSvcs.map(s => {
                  const sel = selectedSvcIds.includes(s.id)
                  return (
                    <div key={s.id} onClick={() => toggleService(s.id)} style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', background: sel ? 'var(--primary-light)' : 'transparent' }}
                      onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                      onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, background: sel ? 'var(--primary)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sel && <CheckCircle size={10} color="#fff" />}
                      </div>
                      <span style={{ flex: 1, fontSize: '0.84rem', fontWeight: sel ? 600 : 400 }}>{s.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EGP {Number(s.price).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Terms & Conditions</label>
            <textarea className="form-textarea" rows={2} value={form.termsText} onChange={e => set('termsText', e.target.value)} placeholder="Terms…" />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label className="toggle"><input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} /><span className="toggle-track"><span className="toggle-thumb" /></span><span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Active</span></label>
            <label className="toggle"><input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} /><span className="toggle-track"><span className="toggle-thumb" /></span><span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Featured</span></label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}
            {offer ? 'Save Changes' : 'Create Offer'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function OffersPage() {
  const [offers,   setOffers]   = useState<Offer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(false)
  const [selected, setSelected] = useState<Offer | null>(null)
  const [delId,    setDelId]    = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '12' })
      if (search) p.set('search', search)
      const res  = await fetch(`/api/dashboard/offers?${p}`)
      const data = await res.json()
      setOffers(data.offers ?? [])
      setTotal(data.total  ?? 0)
      setPages(data.pages  ?? 1)
    } catch {} finally { setLoading(false) }
  }, [page, search])

  useEffect(() => {
    fetch('/api/dashboard/services?limit=100').then(r => r.json()).then(d => setServices(d.services ?? [])).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const toggleActive = async (o: Offer) => {
    await fetch(`/api/dashboard/offers/${o.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !o.isActive }) })
    load()
  }

  const doDelete = async () => {
    if (!delId) return
    await fetch(`/api/dashboard/offers/${delId}`, { method: 'DELETE' })
    setDelId(null); load()
  }

  const isExpired = (o: Offer) => o.validUntil && new Date(o.validUntil) < new Date()

  return (
    <div className="dash-page">
      <div className="page-header">
        <div><h1 className="page-title">Offers & Bundles</h1><p className="page-subtitle">{total} total offers</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}><Plus size={15} /> New Offer</button>
      </div>

      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ position: 'relative', maxWidth: 340 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search offers…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
      ) : offers.length === 0 ? (
        <div className="dash-card"><div className="empty-state"><Tag size={32} className="empty-state-icon" /><p className="empty-state-title">No offers yet</p><button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}><Plus size={13} /> Create Offer</button></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {offers.map(o => {
            const expired = isExpired(o)
            const tc = TYPE_COLOR[o.type] ?? '#082b56'
            return (
              <div key={o.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: expired ? 0.7 : 1 }}>
                {/* Image */}
                <div style={{ height: 120, background: 'var(--surface-2)', position: 'relative', overflow: 'hidden' }}>
                  {o.imageUrl
                    ? <img src={o.imageUrl} alt={o.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Percent size={32} style={{ opacity: 0.2 }} /></div>
                  }
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 5 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: `${tc}22`, color: tc, border: `1px solid ${tc}40` }}>{o.type}</span>
                    {expired && <span className="badge badge-danger">EXPIRED</span>}
                    {o.isFeatured && <span style={{ padding: '2px 6px', background: '#c49a6c', color: '#fff', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><Star size={9} fill="#fff" />Featured</span>}
                  </div>
                  {o.discountPct && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--danger)', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 800 }}>-{o.discountPct}%</div>
                  )}
                </div>

                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>{o.title}</h4>
                  {o.description && <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.description}</p>}

                  {/* Services list */}
                  {o.services.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {o.services.slice(0, 3).map(s => (
                        <span key={s.service.id} style={{ padding: '2px 7px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.service.name}</span>
                      ))}
                      {o.services.length > 3 && <span style={{ padding: '2px 7px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{o.services.length - 3}</span>}
                    </div>
                  )}

                  {/* Dates */}
                  {(o.validFrom || o.validUntil) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: expired ? 'var(--danger)' : 'var(--text-muted)' }}>
                      <Calendar size={12} />
                      {o.validFrom && new Date(o.validFrom).toLocaleDateString('en-EG', { dateStyle: 'short' })} → {o.validUntil && new Date(o.validUntil).toLocaleDateString('en-EG', { dateStyle: 'short' })}
                    </div>
                  )}

                  {/* Price + usage */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textDecoration: 'line-through', marginRight: 4 }}>EGP {Number(o.originalPrice).toLocaleString()}</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--success)' }}>EGP {Number(o.finalPrice).toLocaleString()}</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {o.usageLimit ? `${o.usageCount}/${o.usageLimit} used` : `${o.usageCount} used`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <button onClick={() => toggleActive(o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: o.isActive ? 'var(--success)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                      {o.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {o.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelected(o); setModal(true) }}><Edit2 size={13} /> Edit</button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDelId(o.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1}     onClick={() => setPage(p => p - 1)}><ChevronLeft  size={14} /></button>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
        </div>
      )}

      {modal && <OfferFormModal offer={selected} services={services} onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}

      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header"><h2 className="modal-title">Delete Offer</h2><button className="btn-icon" onClick={() => setDelId(null)}><X size={16} /></button></div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <p style={{ fontWeight: 600 }}>Delete this offer?</p>
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
