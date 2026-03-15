'use client'
// components/dashboard/reviews/ReviewsPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight, Star, Shield,
  MessageSquare, Image as ImageIcon, TrendingUp,
} from 'lucide-react'
import PhotoUpload from '@/components/shared/PhotoUpload'

type ReviewImage = { url: string; publicId?: string; type: string; label?: string; order: number }
type Review = {
  id: number; name: string; review: string; rating: number
  avatar: string | null; avatarPublicId: string | null
  isApproved: boolean; isFeatured: boolean
  source: string | null; serviceId: number | null; patientId: number | null
  treatmentDate: string | null; createdAt: string
  images: (ReviewImage & { id: number })[]
}

const SOURCES = ['Google', 'Instagram', 'Facebook', 'Direct', 'WhatsApp']

/* ── Star Display ────────────────────────────────────────── */
function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size}
          fill={value >= n ? '#f59e0b' : 'none'}
          color={value >= n ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

/* ── Star Rating Input ───────────────────────────────────── */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1 }}>
          <Star size={24}
            fill={(hovered || value) >= n ? '#f59e0b' : 'none'}
            color={(hovered || value) >= n ? '#f59e0b' : '#d1d5db'}
          />
        </button>
      ))}
    </div>
  )
}

/* ── Before/After Uploader ───────────────────────────────── */
function BeforeAfterUploader({ images, onChange }: { images: ReviewImage[]; onChange: (imgs: ReviewImage[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

  const upload = async (file: File, type: string, label: string) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file',          file)
      fd.append('upload_preset', uploadPreset)
      fd.append('folder',        'glow-medical/reviews')
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.secure_url) {
        onChange([...images, { url: data.secure_url, publicId: data.public_id, type, label, order: images.length }])
      }
    } catch {} finally { setUploading(false) }
  }

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx))

  return (
    <div>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <ImageIcon size={13} /> Before / After Images ({images.length})
      </label>
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative', width: 88, height: 88 }}>
              <img src={img.url} alt={img.label || img.type} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--border)' }} />
              {img.label && (
                <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                  {img.label}
                </div>
              )}
              <button onClick={() => remove(i)} style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { type: 'before_after', label: 'before', btnLabel: '+ Before' },
          { type: 'before_after', label: 'after',  btnLabel: '+ After'  },
          { type: 'result',       label: '',        btnLabel: '+ Result' },
        ].map(opt => (
          <label key={opt.btnLabel} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            {uploading ? <span className="spinner spinner-sm" /> : opt.btnLabel}
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
              onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, opt.type, opt.label); e.target.value = '' }} />
          </label>
        ))}
      </div>
    </div>
  )
}

/* ── Review Form Modal ───────────────────────────────────── */
function ReviewFormModal({ review, onClose, onSave }: { review: Review | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name         : review?.name          ?? '',
    review       : review?.review        ?? '',
    rating       : review?.rating        ?? 5,
    avatar       : review?.avatar        ?? '',
    avatarPublicId: review?.avatarPublicId ?? '',
    isApproved   : review?.isApproved    ?? false,
    isFeatured   : review?.isFeatured    ?? false,
    source       : review?.source        ?? '',
    treatmentDate: review?.treatmentDate  ? review.treatmentDate.slice(0, 10) : '',
  })
  const [images, setImages] = useState<ReviewImage[]>(
    review?.images?.map(i => ({ url: i.url, publicId: (i as any).publicId, type: i.type, label: i.label, order: i.order })) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.review) { setError('Name and review are required.'); return }
    setSaving(true); setError('')
    try {
      const url    = review ? `/api/dashboard/reviews/${review.id}` : '/api/dashboard/reviews'
      const method = review ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, images }) })
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
          <h2 className="modal-title">{review ? 'Edit Review' : 'New Review'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ display: 'flex', gap: 8, padding: '0.65rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 10, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          {/* Photo + Name + Rating */}
          <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'flex-start' }}>
            <div>
              <label className="form-label">Photo</label>
              <PhotoUpload
                value={form.avatar}
                onChange={(url, pid) => { set('avatar', url); set('avatarPublicId', pid ?? '') }}
                folder="glow-medical/reviews"
                size={90}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Sara M." />
              </div>
              <div className="form-group">
                <label className="form-label">Rating *</label>
                <StarRating value={form.rating} onChange={v => set('rating', v)} />
              </div>
            </div>
          </div>

          {/* Review text */}
          <div className="form-group">
            <label className="form-label">Review *</label>
            <textarea className="form-textarea" rows={4} value={form.review} onChange={e => set('review', e.target.value)} placeholder="Patient's review…" />
          </div>

          {/* Source + Date */}
          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="form-select" value={form.source} onChange={e => set('source', e.target.value)}>
                <option value="">Select source</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Treatment Date</label>
              <input className="form-input" type="date" value={form.treatmentDate} onChange={e => set('treatmentDate', e.target.value)} />
            </div>
          </div>

          {/* Before/After images */}
          <BeforeAfterUploader images={images} onChange={setImages} />

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
            <label className="toggle">
              <input type="checkbox" checked={form.isApproved} onChange={e => set('isApproved', e.target.checked)} />
              <span className="toggle-track"><span className="toggle-thumb" /></span>
              <span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Approved</span>
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
            {review ? 'Save Changes' : 'Create Review'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function ReviewsPage() {
  const [reviews,  setReviews]  = useState<Review[]>([])
  const [counts,   setCounts]   = useState({ pending: 0, approved: 0, featured: 0 })
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [apFilter, setApFilter] = useState('')
  const [modal,    setModal]    = useState(false)
  const [selected, setSelected] = useState<Review | null>(null)
  const [delId,    setDelId]    = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '16' })
      if (search)   p.set('search',   search)
      if (apFilter) p.set('approved', apFilter)
      const res  = await fetch(`/api/dashboard/reviews?${p}`)
      const data = await res.json()
      setReviews(data.reviews ?? [])
      setTotal(data.total   ?? 0)
      setPages(data.pages   ?? 1)
      setCounts(data.counts ?? { pending: 0, approved: 0, featured: 0 })
    } catch {} finally { setLoading(false) }
  }, [page, search, apFilter])

  useEffect(() => { load() }, [load])

  const toggleApprove  = async (r: Review) => {
    await fetch(`/api/dashboard/reviews/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved: !r.isApproved }) })
    load()
  }
  const toggleFeatured = async (r: Review) => {
    await fetch(`/api/dashboard/reviews/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFeatured: !r.isFeatured }) })
    load()
  }
  const doDelete = async () => {
    if (!delId) return
    await fetch(`/api/dashboard/reviews/${delId}`, { method: 'DELETE' })
    setDelId(null); load()
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="dash-page">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={17} fill="#f59e0b" color="#f59e0b" />
            </div>
            Reviews
          </h1>
          <p className="page-subtitle">{total} reviews · ⭐ {avgRating} avg · {counts.pending} pending approval</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}>
          <Plus size={15} /> Add Review
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Reviews', value: total,            icon: MessageSquare, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Pending',       value: counts.pending,   icon: AlertCircle,   color: '#d97706', bg: '#fffbeb' },
          { label: 'Approved',      value: counts.approved,  icon: Shield,        color: '#059669', bg: '#ecfdf5' },
          { label: 'Featured',      value: counts.featured,  icon: TrendingUp,    color: '#c49a6c', bg: '#fdf8f0' },
        ].map(s => (
          <div key={s.label} className="dash-card" style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="dash-card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { value: '',      label: 'All',      count: total          },
              { value: 'false', label: 'Pending',  count: counts.pending },
              { value: 'true',  label: 'Approved', count: counts.approved },
            ].map(tab => (
              <button key={tab.value}
                onClick={() => { setApFilter(tab.value); setPage(1) }}
                className={apFilter === tab.value ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
                {tab.label}
                <span style={{ background: apFilter === tab.value ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)', borderRadius: 20, padding: '0 5px', fontSize: '0.72rem', marginLeft: 3 }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search reviews…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="dash-card">
          <div className="empty-state">
            <Star size={32} className="empty-state-icon" />
            <p className="empty-state-title">No reviews yet</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}>
              <Plus size={13} /> Add Review
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1rem' }}>
          {reviews.map(r => (
            <div key={r.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden', opacity: r.isApproved ? 1 : 0.82 }}>

              {/* Card header */}
              <div style={{ padding: '1rem 1.1rem 0.85rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--surface-2)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', border: '2px solid var(--border)' }}>
                  {r.avatar
                    ? <img src={r.avatar} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <MessageSquare size={18} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</div>
                  <div style={{ marginTop: 3 }}><Stars value={r.rating} /></div>
                  {r.source && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>via {r.source}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  {!r.isApproved && (
                    <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>Pending</span>
                  )}
                  {r.isFeatured && (
                    <span style={{ padding: '2px 7px', background: 'linear-gradient(135deg,#c49a6c,#e2b47e)', color: '#fff', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Star size={9} fill="#fff" color="#fff" /> Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Review text */}
              <div style={{ padding: '0 1.1rem 0.85rem' }}>
                <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.7, color: 'var(--text)', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {r.review}
                </p>
              </div>

              {/* Before/after images */}
              {r.images.length > 0 && (
                <div style={{ padding: '0 1.1rem 0.85rem', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {r.images.slice(0, 4).map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 62, height: 62, borderRadius: 9, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={img.url} alt={img.label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.label && (
                        <div style={{ position: 'absolute', bottom: 3, left: 3, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.55rem', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>
                          {img.label}
                        </div>
                      )}
                    </div>
                  ))}
                  {r.images.length > 4 && (
                    <div style={{ width: 62, height: 62, borderRadius: 9, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      +{r.images.length - 4}
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: '0.7rem 1.1rem', display: 'flex', gap: 5, borderTop: '1px solid var(--border)', alignItems: 'center', background: 'var(--surface-2)' }}>
                <button
                  title={r.isApproved ? 'Unapprove' : 'Approve'}
                  onClick={() => toggleApprove(r)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: r.isApproved ? 'var(--success)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center' }}>
                  <Shield size={15} />
                </button>
                <button
                  title={r.isFeatured ? 'Unfeature' : 'Feature'}
                  onClick={() => toggleFeatured(r)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: r.isFeatured ? '#f59e0b' : 'var(--text-subtle)', display: 'flex', alignItems: 'center' }}>
                  <Star size={15} fill={r.isFeatured ? '#f59e0b' : 'none'} />
                </button>
                <span style={{ flex: 1, fontSize: '0.73rem', color: 'var(--text-subtle)' }}>
                  {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                </span>
                <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(r); setModal(true) }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDelId(r.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '1.25rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1}     onClick={() => setPage(p => p - 1)}><ChevronLeft  size={14} /></button>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
        </div>
      )}

      {/* ── Modals ── */}
      {modal && (
        <ReviewFormModal
          review={selected}
          onClose={() => setModal(false)}
          onSave={() => { setModal(false); load() }}
        />
      )}

      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">Delete Review</h2>
              <button className="btn-icon" onClick={() => setDelId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}>
                <Trash2 size={22} />
              </div>
              <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Delete this review?</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>All images will also be removed.</p>
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
