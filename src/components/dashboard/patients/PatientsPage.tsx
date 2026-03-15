'use client'
// components/dashboard/patients/PatientsPage.tsx

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Search, Plus, Edit2, Trash2, Eye,
  Phone, Mail, Calendar, ChevronLeft, ChevronRight,
  User, AlertCircle, X, CheckCircle,
} from 'lucide-react'
import { createPortal } from 'react-dom'

/* ── Types ────────────────────────────────────────────────── */
type Patient = {
  id            : number
  fullName      : string
  phone         : string
  phone2        : string | null
  email         : string | null
  gender        : string | null
  dateOfBirth   : string | null
  nationalId    : string | null
  address       : string | null
  bloodType     : string | null
  allergies     : string | null
  medicalNotes  : string | null
  status        : string
  referralSource: string | null
  createdAt     : string
  _count        : { appointments: number }
}

type FormData = Omit<Patient, 'id' | 'createdAt' | '_count'>

const EMPTY_FORM: FormData = {
  fullName: '', phone: '', phone2: '', email: '',
  gender: '', dateOfBirth: '', nationalId: '', address: '',
  bloodType: '', allergies: '', medicalNotes: '',
  status: 'ACTIVE', referralSource: '',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE    : 'badge-success',
  INACTIVE  : 'badge-neutral',
  BLACKLISTED: 'badge-danger',
}

const GENDERS    = ['MALE', 'FEMALE', 'OTHER']
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const STATUSES   = ['ACTIVE', 'INACTIVE', 'BLACKLISTED']

/* ── Patient Form Modal ──────────────────────────────────── */
function PatientFormModal({
  patient, onClose, onSave,
}: {
  patient: Patient | null
  onClose: () => void
  onSave : (p: Patient) => void
}) {
  const [form,    setForm]    = useState<FormData>(patient ? { ...patient, dateOfBirth: patient.dateOfBirth?.slice(0, 10) ?? '' } : EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError('Full name and phone are required.'); return
    }
    setSaving(true); setError('')
    try {
      const url    = patient ? `/api/dashboard/patients/${patient.id}` : '/api/dashboard/patients'
      const method = patient ? 'PATCH' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave(data.patient)
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{patient ? 'Edit Patient' : 'New Patient'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.84rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Patient full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01xxxxxxxxx" />
            </div>
          </div>

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Phone 2</label>
              <input className="form-input" value={form.phone2 ?? ''} onChange={e => set('phone2', e.target.value)} placeholder="Secondary phone" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="patient@email.com" />
            </div>
          </div>

          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender ?? ''} onChange={e => set('gender', e.target.value)}>
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={form.dateOfBirth ?? ''} onChange={e => set('dateOfBirth', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Type</label>
              <select className="form-select" value={form.bloodType ?? ''} onChange={e => set('bloodType', e.target.value)}>
                <option value="">Select</option>
                {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">National ID</label>
              <input className="form-input" value={form.nationalId ?? ''} onChange={e => set('nationalId', e.target.value)} placeholder="14-digit ID" />
            </div>
            <div className="form-group">
              <label className="form-label">Referral Source</label>
              <input className="form-input" value={form.referralSource ?? ''} onChange={e => set('referralSource', e.target.value)} placeholder="How did they hear about us?" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" value={form.address ?? ''} onChange={e => set('address', e.target.value)} placeholder="Full address" />
          </div>

          <div className="form-group">
            <label className="form-label">Allergies</label>
            <textarea className="form-textarea" rows={2} value={form.allergies ?? ''} onChange={e => set('allergies', e.target.value)} placeholder="Known allergies..." />
          </div>

          <div className="form-group">
            <label className="form-label">Medical Notes</label>
            <textarea className="form-textarea" rows={3} value={form.medicalNotes ?? ''} onChange={e => set('medicalNotes', e.target.value)} placeholder="Important medical notes..." />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}
            {patient ? 'Save Changes' : 'Create Patient'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Patient Detail Modal ────────────────────────────────── */
function PatientDetailModal({ patient, onClose, onEdit }: { patient: Patient; onClose: () => void; onEdit: () => void }) {
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/dashboard/patients/${patient.id}`)
      .then(r => r.json())
      .then(d => setDetail(d.patient))
      .catch(() => {})
  }, [patient.id])

  const Field = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{value}</div>
      </div>
    ) : null

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
              {patient.fullName[0]}
            </div>
            <div>
              <h2 className="modal-title">{patient.fullName}</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Patient #{patient.id}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}><Edit2 size={13} /> Edit</button>
            <button className="btn-icon" onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div className="form-row form-row-3" style={{ marginBottom: '1.25rem' }}>
            <Field label="Phone"       value={patient.phone} />
            <Field label="Phone 2"     value={patient.phone2} />
            <Field label="Email"       value={patient.email} />
            <Field label="Gender"      value={patient.gender} />
            <Field label="Blood Type"  value={patient.bloodType} />
            <Field label="Date of Birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-EG') : null} />
            <Field label="National ID" value={patient.nationalId} />
            <Field label="Referral"    value={patient.referralSource} />
            <Field label="Status"      value={patient.status} />
          </div>
          <Field label="Address"      value={patient.address} />
          {patient.allergies    && <div style={{ marginTop: 12 }}><Field label="Allergies"     value={patient.allergies}    /></div>}
          {patient.medicalNotes && <div style={{ marginTop: 12 }}><Field label="Medical Notes" value={patient.medicalNotes} /></div>}

          {/* Appointment history */}
          {detail?.appointments?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text)' }}>
                Appointment History ({detail.appointments.length})
              </h4>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead><tr><th>Date</th><th>Services</th><th>Doctor</th><th>Status</th><th>Payment</th></tr></thead>
                  <tbody>
                    {detail.appointments.slice(0, 10).map((a: any) => (
                      <tr key={a.id}>
                        <td style={{ fontSize: '0.82rem' }}>{new Date(a.appointmentDate).toLocaleDateString('en-EG', { dateStyle: 'medium' })}</td>
                        <td style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{a.services?.map((s: any) => s.service.name).join(', ') || '—'}</td>
                        <td style={{ fontSize: '0.80rem' }}>{a.staff?.name ?? '—'}</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status.replace('_', ' ')}</span></td>
                        <td><span className={`badge badge-${a.paymentStatus}`}>{a.paymentStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Delete Confirm ──────────────────────────────────────── */
function DeleteConfirm({ patient, onClose, onDeleted }: { patient: Patient; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')

  const doDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/patients/${patient.id}`, { method: 'DELETE' })
      if (!res.ok) { setError('Failed to delete'); return }
      onDeleted()
    } catch { setError('Network error') }
    finally { setDeleting(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div className="modal-header">
          <h2 className="modal-title">Delete Patient</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}>
            <Trash2 size={22} />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Delete "{patient.fullName}"?</p>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
            This will permanently delete the patient and all {patient._count.appointments} appointment(s). This action cannot be undone.
          </p>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.83rem', marginTop: 8 }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" onClick={doDelete} disabled={deleting}>
            {deleting ? <span className="spinner spinner-sm" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [loading,  setLoading]  = useState(true)

  const [modalForm,   setModalForm]   = useState(false)
  const [modalView,   setModalView]   = useState(false)
  const [modalDelete, setModalDelete] = useState(false)
  const [selected,    setSelected]    = useState<Patient | null>(null)

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const res  = await fetch(`/api/dashboard/patients?${params}`)
      const data = await res.json()
      setPatients(data.patients ?? [])
      setTotal(data.total   ?? 0)
      setPages(data.pages   ?? 1)
    } catch {} finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  const handleSearch = (v: string) => {
    setSearch(v); setPage(1)
  }

  return (
    <div className="dash-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{total.toLocaleString()} total patients</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModalForm(true) }}>
          <Plus size={15} /> New Patient
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search name, phone, email, ID…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ width: 160 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="dash-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <User size={32} className="empty-state-icon" />
            <p className="empty-state-title">No patients found</p>
            <p className="empty-state-body">Try adjusting your search or add a new patient.</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModalForm(true) }}>
              <Plus size={13} /> Add First Patient
            </button>
          </div>
        ) : (
          <>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Blood</th>
                    <th>Appointments</th>
                    <th>Status</th>
                    <th>Since</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>#{p.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                            {p.fullName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{p.fullName}</div>
                            {p.email && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.84rem', fontFamily: 'monospace' }}>{p.phone}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.gender ?? '—'}</td>
                      <td>
                        {p.bloodType
                          ? <span className="badge badge-info">{p.bloodType}</span>
                          : <span style={{ color: 'var(--text-subtle)' }}>—</span>
                        }
                      </td>
                      <td>
                        <span className="badge badge-neutral">{p._count.appointments}</span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[p.status] ?? 'badge-neutral'}`}>{p.status}</span>
                      </td>
                      <td style={{ fontSize: '0.79rem', color: 'var(--text-muted)' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-EG', { dateStyle: 'medium' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" title="View" onClick={() => { setSelected(p); setModalView(true) }}><Eye size={13} /></button>
                          <button className="btn-icon" title="Edit" onClick={() => { setSelected(p); setModalForm(true) }}><Edit2 size={13} /></button>
                          <button className="btn-icon" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => { setSelected(p); setModalDelete(true) }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '1rem' }}>
                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {modalForm && (
        <PatientFormModal
          patient={selected}
          onClose={() => setModalForm(false)}
          onSave={p => { setModalForm(false); load() }}
        />
      )}
      {modalView && selected && (
        <PatientDetailModal
          patient={selected}
          onClose={() => setModalView(false)}
          onEdit={() => { setModalView(false); setModalForm(true) }}
        />
      )}
      {modalDelete && selected && (
        <DeleteConfirm
          patient={selected}
          onClose={() => setModalDelete(false)}
          onDeleted={() => { setModalDelete(false); load() }}
        />
      )}
    </div>
  )
}
