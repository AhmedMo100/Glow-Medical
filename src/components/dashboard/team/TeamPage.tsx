'use client'
import { useEffect, useState, useRef, useCallback } from 'react'

/* ─── Types ─────────────────────────────────────────────── */
interface StaffMember {
  id         : number
  staffType  : string
  name       : string
  nameEn?    : string
  phone?     : string
  email?     : string
  gender?    : string
  dateOfBirth?: string
  nationalId?: string
  photo?     : string
  bio?       : string
  specialization?: string
  qualifications?: string
  experience?: number
  licenseNumber?: string
  status     : string
  hireDate?  : string
  endDate?   : string
  baseSalary?: number
  salaryType?: string
  commission?: number
  isPublic   : boolean
  isFeatured : boolean
  instagramUrl?: string
  linkedinUrl? : string
  _count?    : { appointments: number }
}

const STAFF_TYPES = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'MANAGER', 'TECHNICIAN', 'OTHER']
const STATUSES    = ['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED']
const GENDERS     = ['MALE', 'FEMALE']
const SALARY_TYPES = ['MONTHLY', 'HOURLY', 'COMMISSION']

const EMPTY_FORM = {
  staffType: 'DOCTOR', name: '', nameEn: '', phone: '', email: '',
  gender: '', dateOfBirth: '', nationalId: '', photo: '', photoPublicId: '',
  bio: '', specialization: '', qualifications: '', experience: '',
  licenseNumber: '', status: 'ACTIVE', hireDate: '', endDate: '',
  baseSalary: '', salaryType: '', commission: '',
  isPublic: true, isFeatured: false, instagramUrl: '', linkedinUrl: '',
}

/* ─── PhotoUpload sub-component ─────────────────────────── */
function PhotoUpload({ value, onChange }: { value: string; onChange: (url: string, publicId: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag]           = useState(false)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file',           file)
      fd.append('upload_preset',  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'glow_unsigned')
      fd.append('folder',         'glow-medical/staff')
      const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd }
      )
      const data = await res.json()
      if (data.secure_url) onChange(data.secure_url, data.public_id)
    } finally {
      setUploading(false)
    }
  }, [onChange])

  return (
    <div>
      <label className="form-label">Photo</label>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border      : `2px dashed ${drag ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding     : '1.5rem',
          textAlign   : 'center',
          cursor      : 'pointer',
          background  : drag ? 'var(--primary-5)' : 'var(--bg-secondary)',
          transition  : 'all .2s',
          position    : 'relative',
          minHeight   : '100px',
          display     : 'flex',
          alignItems  : 'center',
          justifyContent: 'center',
          flexDirection : 'column',
          gap         : '0.5rem',
        }}
      >
        {uploading ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>Uploading…</span>
        ) : value ? (
          <>
            <img src={value} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>Click to change</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '2rem' }}>📷</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>Drag & drop or click to upload</span>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </div>
    </div>
  )
}

/* ─── Modal ──────────────────────────────────────────────── */
function MemberModal({
  member, onClose, onSave
}: {
  member: StaffMember | null
  onClose: () => void
  onSave : (data: any) => void
}) {
  const [form,    setForm]    = useState<any>(member ? {
    ...EMPTY_FORM,
    ...member,
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : '',
    hireDate   : member.hireDate    ? member.hireDate.slice(0, 10)    : '',
    endDate    : member.endDate     ? member.endDate.slice(0, 10)     : '',
    experience : member.experience  ?? '',
    baseSalary : member.baseSalary  ?? '',
    commission : member.commission  ?? '',
    photoPublicId: '',
  } : { ...EMPTY_FORM })
  const [tab,     setTab]     = useState<'basic'|'professional'|'hr'|'public'>('basic')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.staffType) { setError('Name and Type are required'); return }
    setSaving(true); setError('')
    try { await onSave(form) } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const tabs = [
    { key: 'basic',        label: '👤 Basic' },
    { key: 'professional', label: '🏥 Professional' },
    { key: 'hr',           label: '💼 HR & Finance' },
    { key: 'public',       label: '🌐 Public Profile' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>&times;</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', gap: '0.25rem', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding: '.6rem 1rem', border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: tab === t.key ? 600 : 400, fontSize: '.9rem', whiteSpace: 'nowrap',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', padding: '.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '.9rem' }}>{error}</div>}

          {/* ── BASIC ── */}
          {tab === 'basic' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <PhotoUpload value={form.photo} onChange={(url, pid) => { set('photo', url); set('photoPublicId', pid) }} />
              </div>

              <div>
                <label className="form-label">Type *</label>
                <select className="form-input" value={form.staffType} onChange={e => set('staffType', e.target.value)}>
                  {STAFF_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Full Name (Arabic) *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="الاسم الكامل" />
              </div>

              <div>
                <label className="form-label">Full Name (English)</label>
                <input className="form-input" value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Full Name" />
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+20..." />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select className="form-input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">— Select —</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
              </div>

              <div>
                <label className="form-label">National ID</label>
                <input className="form-input" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* ── PROFESSIONAL ── */}
          {tab === 'professional' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Specialization</label>
                <input className="form-input" value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="e.g. Dermatology" />
              </div>

              <div>
                <label className="form-label">Experience (years)</label>
                <input className="form-input" type="number" min={0} value={form.experience} onChange={e => set('experience', e.target.value)} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Qualifications</label>
                <input className="form-input" value={form.qualifications} onChange={e => set('qualifications', e.target.value)} placeholder="e.g. MD, FRCS, Board Certified" />
              </div>

              <div>
                <label className="form-label">License Number</label>
                <input className="form-input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
              </div>
            </div>
          )}

          {/* ── HR & FINANCE ── */}
          {tab === 'hr' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Hire Date</label>
                <input className="form-input" type="date" value={form.hireDate} onChange={e => set('hireDate', e.target.value)} />
              </div>

              <div>
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </div>

              <div>
                <label className="form-label">Base Salary (EGP)</label>
                <input className="form-input" type="number" min={0} value={form.baseSalary} onChange={e => set('baseSalary', e.target.value)} />
              </div>

              <div>
                <label className="form-label">Salary Type</label>
                <select className="form-input" value={form.salaryType} onChange={e => set('salaryType', e.target.value)}>
                  <option value="">— Select —</option>
                  {SALARY_TYPES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">Commission (%)</label>
                <input className="form-input" type="number" min={0} max={100} value={form.commission} onChange={e => set('commission', e.target.value)} />
              </div>
            </div>
          )}

          {/* ── PUBLIC PROFILE ── */}
          {tab === 'public' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublic} onChange={e => set('isPublic', e.target.checked)} />
                <span>Visible on public website</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
                <span>Featured on homepage</span>
              </label>

              <div>
                <label className="form-label">Instagram URL</label>
                <input className="form-input" value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
              </div>

              <div>
                <label className="form-label">LinkedIn URL</label>
                <input className="form-input" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/..." />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '.75rem' }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : member ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function TeamPage() {
  const [staff,     setStaff]     = useState<StaffMember[]>([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [search,    setSearch]    = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading,   setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState<StaffMember | null>(null)
  const [delId,     setDelId]     = useState<number | null>(null)
  const [view,      setView]      = useState<'grid'|'table'>('grid')

  const LIMIT = 20

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), limit: String(LIMIT), search, status: statusFilter, type: typeFilter })
    const res  = await fetch(`/api/dashboard/team?${p}`)
    const data = await res.json()
    setStaff(data.staff ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search, statusFilter, typeFilter])

  useEffect(() => { fetch_() }, [fetch_])

  const openAdd  = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (m: StaffMember) => { setEditing(m); setModalOpen(true) }

  const handleSave = async (form: any) => {
    const isEdit = !!editing
    const url    = isEdit ? `/api/dashboard/team/${editing.id}` : '/api/dashboard/team'
    const method = isEdit ? 'PATCH' : 'POST'

    const payload: any = { ...form }
    if (isEdit && form.photoPublicId && form.photo !== editing.photo) {
      // extract old public id from old photo URL
      if (editing.photo) {
        const parts = editing.photo.split('/')
        const fname = parts[parts.length - 1].split('.')[0]
        const folder = parts[parts.length - 2]
        payload.oldPhotoPublicId = `${folder}/${fname}`
      }
    }

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error ?? 'Failed to save')
    }
    setModalOpen(false)
    fetch_()
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/dashboard/team/${id}`, { method: 'DELETE' })
    setDelId(null)
    fetch_()
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { ACTIVE: '#22c55e', ON_LEAVE: '#f59e0b', INACTIVE: '#94a3b8', TERMINATED: '#ef4444' }
    return <span style={{ background: map[s] ?? '#94a3b8', color: '#fff', padding: '.15rem .55rem', borderRadius: 99, fontSize: '.72rem', fontWeight: 600 }}>{s}</span>
  }

  const pages = Math.ceil(total / LIMIT)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Team Members</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '.9rem' }}>{total} members</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">+ Add Member</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input" placeholder="Search name, email, phone…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ flex: '1 1 220px', maxWidth: 300 }}
        />
        <select className="form-input" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} style={{ flex: '0 0 auto' }}>
          <option value="">All Types</option>
          {STAFF_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="form-input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} style={{ flex: '0 0 auto' }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
          {(['grid', 'table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '.4rem .75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: view === v ? 'var(--primary)' : 'var(--bg-secondary)',
              color: view === v ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '.85rem',
            }}>{v === 'grid' ? '⊞' : '☰'}</button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading…</div>}

      {/* Grid View */}
      {!loading && view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {staff.map(m => (
            <div key={m.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'box-shadow .2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Photo */}
              <div style={{ height: 180, background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                {m.photo
                  ? <img src={m.photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>👤</div>
                }
                <div style={{ position: 'absolute', top: 8, right: 8 }}>{statusBadge(m.status)}</div>
                {m.isFeatured && <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--accent)', color: '#fff', padding: '.15rem .45rem', borderRadius: 99, fontSize: '.7rem', fontWeight: 600 }}>★ Featured</div>}
              </div>

              {/* Info */}
              <div style={{ padding: '1rem' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.95rem' }}>{m.name}</p>
                {m.nameEn && <p style={{ margin: '.1rem 0 0', fontSize: '.8rem', color: 'var(--text-muted)' }}>{m.nameEn}</p>}
                <p style={{ margin: '.4rem 0 0', fontSize: '.8rem', color: 'var(--primary)', fontWeight: 500 }}>{m.staffType}{m.specialization ? ` — ${m.specialization}` : ''}</p>
                {m.phone && <p style={{ margin: '.3rem 0 0', fontSize: '.8rem', color: 'var(--text-muted)' }}>📞 {m.phone}</p>}
                {m._count && <p style={{ margin: '.3rem 0 0', fontSize: '.8rem', color: 'var(--text-muted)' }}>📅 {m._count.appointments} appointments</p>}
              </div>

              {/* Actions */}
              <div style={{ padding: '.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.5rem' }}>
                <button onClick={() => openEdit(m)} className="btn btn-secondary" style={{ flex: 1, fontSize: '.8rem', padding: '.35rem' }}>Edit</button>
                <button onClick={() => setDelId(m.id)} style={{ padding: '.35rem .75rem', borderRadius: 'var(--radius)', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '.8rem' }}>Delete</button>
              </div>
            </div>
          ))}
          {staff.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No team members found.</p>}
        </div>
      )}

      {/* Table View */}
      {!loading && view === 'table' && (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Photo','Name','Type','Specialization','Phone','Status','Featured','Actions'].map(h => (
                  <th key={h} style={{ padding: '.75rem 1rem', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '.75rem 1rem' }}>
                    {m.photo
                      ? <img src={m.photo} alt={m.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    }
                  </td>
                  <td style={{ padding: '.75rem 1rem' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{m.name}</p>
                    {m.nameEn && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '.8rem' }}>{m.nameEn}</p>}
                  </td>
                  <td style={{ padding: '.75rem 1rem', color: 'var(--text-secondary)' }}>{m.staffType}</td>
                  <td style={{ padding: '.75rem 1rem', color: 'var(--text-secondary)' }}>{m.specialization ?? '—'}</td>
                  <td style={{ padding: '.75rem 1rem', color: 'var(--text-secondary)' }}>{m.phone ?? '—'}</td>
                  <td style={{ padding: '.75rem 1rem' }}>{statusBadge(m.status)}</td>
                  <td style={{ padding: '.75rem 1rem', textAlign: 'center' }}>{m.isFeatured ? '⭐' : '—'}</td>
                  <td style={{ padding: '.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <button onClick={() => openEdit(m)} className="btn btn-secondary" style={{ fontSize: '.8rem', padding: '.3rem .6rem' }}>Edit</button>
                      <button onClick={() => setDelId(m.id)} style={{ padding: '.3rem .6rem', borderRadius: 'var(--radius)', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '.8rem' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No team members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary" style={{ fontSize: '.85rem' }}>← Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 36, height: 36, borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: page === p ? 'var(--primary)' : 'var(--bg-secondary)',
              color: page === p ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: page === p ? 600 : 400,
            }}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn btn-secondary" style={{ fontSize: '.85rem' }}>Next →</button>
        </div>
      )}

      {/* Edit/Add Modal */}
      {modalOpen && <MemberModal member={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />}

      {/* Delete confirm */}
      {delId !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: 380, width: '90%' }}>
            <h4 style={{ margin: '0 0 .75rem' }}>Delete Team Member?</h4>
            <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)' }}>This action cannot be undone. The member's appointments history will be preserved.</p>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDelId(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(delId)} style={{ padding: '.5rem 1.25rem', borderRadius: 'var(--radius)', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
