'use client'
// components/dashboard/staff/StaffPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight, User, Star,
  ToggleLeft, ToggleRight, Instagram, Linkedin,
  Phone, Mail, Briefcase, Award,
} from 'lucide-react'
import PhotoUpload from '@/components/shared/PhotoUpload'

// ── Types ────────────────────────────────────────────────────────────────────
type StaffMember = {
  id           : number
  staffType    : string
  name         : string
  nameEn       : string | null
  phone        : string | null
  email        : string | null
  gender       : string | null
  dateOfBirth  : string | null
  nationalId   : string | null
  photo        : string | null
  bio          : string | null
  specialization: string | null
  qualifications: string | null
  experience   : number | null
  licenseNumber: string | null
  status       : string
  hireDate     : string | null
  endDate      : string | null
  baseSalary   : number | null
  salaryType   : string | null
  commission   : number | null
  isPublic     : boolean
  isFeatured   : boolean
  instagramUrl : string | null
  linkedinUrl  : string | null
  _count       : { appointments: number }
}

const STAFF_TYPES = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'TECHNICIAN', 'MANAGER', 'OTHER']
const STATUSES    = ['ACTIVE', 'INACTIVE', 'ON_LEAVE']
const GENDERS     = ['MALE', 'FEMALE']
const SALARY_TYPES = ['FIXED', 'HOURLY', 'COMMISSION']

const EMPTY_FORM = {
  staffType    : 'DOCTOR',
  name         : '',
  nameEn       : '',
  phone        : '',
  email        : '',
  gender       : '',
  dateOfBirth  : '',
  nationalId   : '',
  photo        : '',
  bio          : '',
  specialization: '',
  qualifications: '',
  experience   : '',
  licenseNumber: '',
  status       : 'ACTIVE',
  hireDate     : '',
  endDate      : '',
  baseSalary   : '',
  salaryType   : '',
  commission   : '',
  isPublic     : true,
  isFeatured   : false,
  instagramUrl : '',
  linkedinUrl  : '',
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE  : 'var(--success)',
  INACTIVE: 'var(--danger)',
  ON_LEAVE: '#f59e0b',
}

// ── Form Modal ────────────────────────────────────────────────────────────────
function StaffFormModal({ member, onClose, onSave }: {
  member: StaffMember | null
  onClose: () => void
  onSave : () => void
}) {
  const [form,    setForm]    = useState(member ? {
    staffType    : member.staffType,
    name         : member.name,
    nameEn       : member.nameEn       ?? '',
    phone        : member.phone        ?? '',
    email        : member.email        ?? '',
    gender       : member.gender       ?? '',
    dateOfBirth  : member.dateOfBirth  ? member.dateOfBirth.slice(0, 10) : '',
    nationalId   : member.nationalId   ?? '',
    photo        : member.photo        ?? '',
    bio          : member.bio          ?? '',
    specialization: member.specialization ?? '',
    qualifications: member.qualifications ?? '',
    experience   : member.experience   ? String(member.experience) : '',
    licenseNumber: member.licenseNumber ?? '',
    status       : member.status,
    hireDate     : member.hireDate     ? member.hireDate.slice(0, 10) : '',
    endDate      : member.endDate      ? member.endDate.slice(0, 10)  : '',
    baseSalary   : member.baseSalary   ? String(member.baseSalary)    : '',
    salaryType   : member.salaryType   ?? '',
    commission   : member.commission   ? String(member.commission)    : '',
    isPublic     : member.isPublic,
    isFeatured   : member.isFeatured,
    instagramUrl : member.instagramUrl ?? '',
    linkedinUrl  : member.linkedinUrl  ?? '',
  } : EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState<'basic' | 'professional' | 'hr' | 'social'>('basic')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.staffType || !form.name.trim()) {
      setError('Staff type and name are required.'); return
    }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        experience : form.experience  ? Number(form.experience)  : null,
        baseSalary : form.baseSalary  ? Number(form.baseSalary)  : null,
        commission : form.commission  ? Number(form.commission)  : null,
        dateOfBirth: form.dateOfBirth || null,
        hireDate   : form.hireDate    || null,
        endDate    : form.endDate     || null,
      }
      const url    = member ? `/api/dashboard/staff/${member.id}` : '/api/dashboard/staff'
      const method = member ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data   = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave()
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  const TABS = [
    { key: 'basic',        label: 'Basic Info' },
    { key: 'professional', label: 'Professional' },
    { key: 'hr',           label: 'HR & Salary' },
    { key: 'social',       label: 'Social' },
  ] as const

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-xl">
        <div className="modal-header">
          <h2 className="modal-title">{member ? 'Edit Staff Member' : 'New Staff Member'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', padding: '0 1.25rem' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.65rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.83rem', fontWeight: 600, fontFamily: 'inherit',
              color   : tab === t.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {error && (
            <div style={{ display: 'flex', gap: 8, padding: '0.6rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          {/* ── TAB: Basic Info ── */}
          {tab === 'basic' && (
            <>
              {/* Photo + core identity */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {/* Photo upload — circle shape like staff photos */}
                <PhotoUpload
                  value={form.photo}
                  onChange={url => set('photo', url)}
                  folder="glow-medical/staff"
                  size={110}
                  shape="circle"
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label className="form-label">Staff Type *</label>
                      <select className="form-select" value={form.staffType} onChange={e => set('staffType', e.target.value)}>
                        {STAFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label className="form-label">Name (Arabic) *</label>
                      <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="د. محمد أحمد" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Name (English)</label>
                      <input className="form-input" value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Dr. Mohamed Ahmed" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">National ID</label>
                  <input className="form-input" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} placeholder="12345678901234" />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01xxxxxxxxx" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="doctor@glow.com" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief biography visible to patients…" />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label className="toggle">
                  <input type="checkbox" checked={form.isPublic} onChange={e => set('isPublic', e.target.checked)} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                  <span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Visible on website</span>
                </label>
                <label className="toggle">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                  <span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Featured</span>
                </label>
              </div>
            </>
          )}

          {/* ── TAB: Professional ── */}
          {tab === 'professional' && (
            <>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-input" value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="e.g. Laser & Aesthetic Medicine" />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-input" type="number" min="0" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="e.g. 10" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input className="form-input" value={form.qualifications} onChange={e => set('qualifications', e.target.value)} placeholder="e.g. MD, MRCP, Fellowship in Dermatology" />
              </div>

              <div className="form-group">
                <label className="form-label">License Number</label>
                <input className="form-input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} placeholder="Medical syndicate number…" />
              </div>
            </>
          )}

          {/* ── TAB: HR & Salary ── */}
          {tab === 'hr' && (
            <>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Hire Date</label>
                  <input className="form-input" type="date" value={form.hireDate} onChange={e => set('hireDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                </div>
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Salary Type</label>
                  <select className="form-select" value={form.salaryType} onChange={e => set('salaryType', e.target.value)}>
                    <option value="">Select</option>
                    {SALARY_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Base Salary (EGP)</label>
                  <input className="form-input" type="number" min="0" value={form.baseSalary} onChange={e => set('baseSalary', e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission (%)</label>
                  <input className="form-input" type="number" min="0" max="100" value={form.commission} onChange={e => set('commission', e.target.value)} placeholder="0" />
                </div>
              </div>
            </>
          )}

          {/* ── TAB: Social ── */}
          {tab === 'social' && (
            <>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Instagram size={14} style={{ color: '#e1306c' }} /> Instagram URL
                </label>
                <input className="form-input" value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/username" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Linkedin size={14} style={{ color: '#0077b5' }} /> LinkedIn URL
                </label>
                <input className="form-input" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/username" />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}
            {member ? 'Save Changes' : 'Create Member'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ member, onClose, onDeleted }: {
  member  : StaffMember
  onClose : () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const doDelete = async () => {
    setDeleting(true)
    await fetch(`/api/dashboard/staff/${member.id}`, { method: 'DELETE' })
    onDeleted()
  }
  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div className="modal-header">
          <h2 className="modal-title">Delete Staff Member</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}>
            <Trash2 size={22} />
          </div>
          <p style={{ fontWeight: 600 }}>Delete "{member.name}"?</p>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>This cannot be undone. Photo will be deleted from Cloudinary.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={doDelete} disabled={deleting}>
            {deleting ? <span className="spinner spinner-sm" /> : <Trash2 size={14} />} Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const [staff,    setStaff]    = useState<StaffMember[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal,    setModal]    = useState(false)
  const [selected, setSelected] = useState<StaffMember | null>(null)
  const [delModal, setDelModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '16' })
      if (search)       p.set('search', search)
      if (typeFilter)   p.set('type',   typeFilter)
      if (statusFilter) p.set('status', statusFilter)
      const res  = await fetch(`/api/dashboard/staff?${p}`)
      const data = await res.json()
      setStaff(data.staff  ?? [])
      setTotal(data.total  ?? 0)
      setPages(data.pages  ?? 1)
    } catch {} finally { setLoading(false) }
  }, [page, search, typeFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (m: StaffMember) => {
    const next = m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch(`/api/dashboard/staff/${m.id}`, {
      method : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ status: next }),
    })
    load()
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Members</h1>
          <p className="page-subtitle">{total} total members</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}>
          <Plus size={15} /> New Staff Member
        </button>
      </div>

      {/* Filters */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search name, email, specialization…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select" style={{ width: 160 }} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
            <option value="">All Types</option>
            {STAFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : staff.length === 0 ? (
        <div className="dash-card">
          <div className="empty-state">
            <User size={32} className="empty-state-icon" />
            <p className="empty-state-title">No staff members found</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}>
              <Plus size={13} /> Add Staff Member
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {staff.map(m => (
            <div key={m.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Card header with photo */}
              <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                  background: 'var(--surface-2)', border: '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.photo
                    ? <img src={m.photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={24} style={{ opacity: 0.3 }} />
                  }
                </div>
                {/* Identity */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</h4>
                    {m.isFeatured && <Star size={12} style={{ color: '#c49a6c', flexShrink: 0 }} fill="#c49a6c" />}
                  </div>
                  {m.nameEn && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.nameEn}</div>}
                  {m.specialization && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{m.specialization}</div>
                  )}
                  <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {m.staffType}
                    </span>
                    <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, color: STATUS_COLOR[m.status] ?? 'var(--text-muted)', background: `${STATUS_COLOR[m.status]}15`, border: `1px solid ${STATUS_COLOR[m.status]}30` }}>
                      {m.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details strip */}
              <div style={{ padding: '0 1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {m.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Phone size={11} />{m.phone}
                  </div>
                )}
                {m.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Mail size={11} />{m.email}
                  </div>
                )}
                {m.experience && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Briefcase size={11} />{m.experience} yrs experience
                  </div>
                )}
                {m.qualifications && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Award size={11} />{m.qualifications}
                  </div>
                )}
              </div>

              {/* Appointments count */}
              <div style={{ padding: '0.5rem 1.25rem', background: 'var(--surface-2)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{m._count.appointments} appointments</span>
                <button onClick={() => toggleStatus(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: m.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-subtle)', fontFamily: 'inherit' }}>
                  {m.status === 'ACTIVE' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {m.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelected(m); setModal(true) }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => { setSelected(m); setDelModal(true) }}>
                  <Trash2 size={14} />
                </button>
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

      {modal    && <StaffFormModal member={selected} onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}
      {delModal && selected && <DeleteConfirm member={selected} onClose={() => setDelModal(false)} onDeleted={() => { setDelModal(false); load() }} />}
    </div>
  )
}
