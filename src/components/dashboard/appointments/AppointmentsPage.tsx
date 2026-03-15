'use client'
// components/dashboard/appointments/AppointmentsPage.tsx

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Plus, Search, Eye, Edit2, Trash2, X, CheckCircle,
  AlertCircle, ChevronLeft, ChevronRight, Clock,
  User, Stethoscope, Tag, DollarSign, Filter,
} from 'lucide-react'
import { createPortal } from 'react-dom'

/* ── Types ────────────────────────────────────────────────── */
type Patient   = { id: number; fullName: string; phone: string; gender?: string | null }
type Service   = { id: number; name: string; price: number; discountedPrice?: number | null; category?: { name: string; color?: string | null } }
type Offer     = { id: number; title: string; finalPrice: number; services?: { service: { name: string } }[] }
type Staff     = { id: number; name: string; staffType: string }
type Appointment = {
  id              : number
  appointmentDate : string
  durationMinutes : number | null
  notes           : string | null
  internalNotes   : string | null
  source          : string
  status          : string
  paymentStatus   : string
  totalAmount     : number
  paidAmount      : number
  tempPatientName : string | null
  tempPatientPhone: string | null
  patient         : Patient | null
  staff           : Staff   | null
  services        : { priceAtTime: number; service: Service }[]
  offers          : { priceAtTime: number; offer: Offer }[]
}

/* ── constants ─────────────────────────────────────────────── */
const STATUSES   = ['PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW']
const SOURCES    = ['WEBSITE','WHATSAPP','WALK_IN','PHONE']
const PAY_STATUS = ['UNPAID','PARTIAL','PAID','REFUNDED']

/* ── Patient Search Combobox ─────────────────────────────── */
function PatientCombobox({
  value, onChange, onNewPatient,
}: {
  value     : Patient | null
  onChange  : (p: Patient | null) => void
  onNewPatient: (name: string, phone: string) => void
}) {
  const [q,         setQ]         = useState(value?.fullName ?? '')
  const [results,   setResults]   = useState<Patient[]>([])
  const [open,      setOpen]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [newPhone,  setNewPhone]  = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!q.trim() || q === value?.fullName) { setResults([]); setOpen(false); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/dashboard/patients?search=${encodeURIComponent(q)}&limit=8`)
        const d   = await res.json()
        setResults(d.patients ?? [])
        setOpen(true)
      } finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [q, value])

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const select = (p: Patient) => { onChange(p); setQ(p.fullName); setOpen(false) }
  const clear  = () => { onChange(null); setQ(''); setResults([]) }

  const isNew = open && results.length === 0 && q.trim().length > 1

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <User size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
        <input
          className="form-input"
          style={{ paddingLeft: 32, paddingRight: value ? 32 : 12 }}
          placeholder="Search patient by name or phone…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true) }}
        />
        {value && (
          <button onClick={clear} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 200, maxHeight: 260, overflowY: 'auto' }}>
          {loading && <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Searching…</div>}

          {results.map(p => (
            <div
              key={p.id}
              onClick={() => select(p)}
              style={{ padding: '0.65rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem' }}>
                {p.fullName[0]}
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{p.fullName}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.phone}</div>
              </div>
            </div>
          ))}

          {isNew && (
            <div style={{ padding: '0.75rem 1rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No patient found. Add as new?</p>
              <input
                className="form-input"
                placeholder="Phone number for new patient"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <button
                className="btn btn-primary btn-sm"
                disabled={!newPhone.trim()}
                onClick={() => { onNewPatient(q, newPhone); setOpen(false) }}
              >
                <Plus size={13} /> Add "{q}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Services/Offers Picker ──────────────────────────────── */
function ServicesPicker({
  selectedServices, selectedOffers,
  onServicesChange, onOffersChange,
}: {
  selectedServices: Service[]
  selectedOffers  : Offer[]
  onServicesChange: (s: Service[]) => void
  onOffersChange  : (o: Offer[]) => void
}) {
  const [tab,      setTab]      = useState<'services' | 'offers'>('services')
  const [q,        setQ]        = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [offers,   setOffers]   = useState<Offer[]>([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        if (tab === 'services') {
          const res  = await fetch(`/api/dashboard/services?active=true&search=${encodeURIComponent(q)}`)
          const data = await res.json()
          setServices(data.services ?? [])
        } else {
          const res  = await fetch(`/api/dashboard/offers?search=${encodeURIComponent(q)}`)
          const data = await res.json()
          setOffers(data.offers ?? [])
        }
      } finally { setLoading(false) }
    }, 250)
    return () => clearTimeout(t)
  }, [q, tab])

  const toggleService = (s: Service) => {
    const exists = selectedServices.find(x => x.id === s.id)
    onServicesChange(exists ? selectedServices.filter(x => x.id !== s.id) : [...selectedServices, s])
  }

  const toggleOffer = (o: Offer) => {
    const exists = selectedOffers.find(x => x.id === o.id)
    onOffersChange(exists ? selectedOffers.filter(x => x.id !== o.id) : [...selectedOffers, o])
  }

  const price = (s: Service) => Number(s.discountedPrice ?? s.price)

  return (
    <div style={{ border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        {(['services', 'offers'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ flex: 1, padding: '0.55rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: tab === t ? 700 : 400, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent' }}
          >
            {t === 'services' ? `Services (${selectedServices.length})` : `Offers (${selectedOffers.length})`}
          </button>
        ))}
      </div>

      {/* Selected items */}
      {(tab === 'services' ? selectedServices : selectedOffers).length > 0 && (
        <div style={{ padding: '0.5rem 0.75rem', background: 'var(--primary-light)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tab === 'services' && selectedServices.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.78rem' }}>
              {s.name} · EGP {price(s)}
              <button onClick={() => toggleService(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}><X size={11} /></button>
            </div>
          ))}
          {tab === 'offers' && selectedOffers.map(o => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.78rem' }}>
              {o.title} · EGP {Number(o.finalPrice)}
              <button onClick={() => toggleOffer(o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}><X size={11} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input className="form-input" style={{ paddingLeft: 28, fontSize: '0.82rem' }} placeholder={`Search ${tab}…`} value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}><span className="spinner" /></div>
        ) : tab === 'services' ? (
          services.length === 0 ? <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>No services found</div> :
          services.map(s => {
            const sel = !!selectedServices.find(x => x.id === s.id)
            return (
              <div
                key={s.id}
                onClick={() => toggleService(s)}
                style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: sel ? 'var(--primary-light)' : 'transparent', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, background: sel ? 'var(--primary)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <CheckCircle size={11} color="#fff" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: sel ? 600 : 400 }}>{s.name}</div>
                  {s.category && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.category.name}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {s.discountedPrice && <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textDecoration: 'line-through' }}>EGP {Number(s.price)}</div>}
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--success)' }}>EGP {price(s)}</div>
                </div>
              </div>
            )
          })
        ) : (
          offers.length === 0 ? <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>No offers found</div> :
          offers.map(o => {
            const sel = !!selectedOffers.find(x => x.id === o.id)
            return (
              <div
                key={o.id}
                onClick={() => toggleOffer(o)}
                style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: sel ? 'var(--primary-light)' : 'transparent', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sel ? 'var(--primary)' : 'var(--border)'}`, background: sel ? 'var(--primary)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <CheckCircle size={11} color="#fff" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: sel ? 600 : 400 }}>{o.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.services?.map(s => s.service.name).join(', ')}</div>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--success)' }}>EGP {Number(o.finalPrice)}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ── Appointment Form Modal ──────────────────────────────── */
function AppointmentFormModal({
  appointment, onClose, onSave,
}: { appointment: Appointment | null; onClose: () => void; onSave: () => void }) {
  const [date,     setDate]     = useState(appointment?.appointmentDate?.slice(0, 16) ?? '')
  const [duration, setDuration] = useState(String(appointment?.durationMinutes ?? ''))
  const [source,   setSource]   = useState(appointment?.source   ?? 'WEBSITE')
  const [status,   setStatus]   = useState(appointment?.status   ?? 'PENDING')
  const [payStat,  setPayStat]  = useState(appointment?.paymentStatus ?? 'UNPAID')
  const [paid,     setPaid]     = useState(String(appointment?.paidAmount ?? '0'))
  const [notes,    setNotes]    = useState(appointment?.notes ?? '')
  const [intNotes, setIntNotes] = useState(appointment?.internalNotes ?? '')

  const [patient,  setPatient]  = useState<Patient | null>(appointment?.patient ?? null)
  const [staffId,  setStaffId]  = useState<string>(String(appointment?.staff?.id ?? ''))
  const [staffList,setStaffList]= useState<Staff[]>([])

  const [selServices, setSelServices] = useState<Service[]>(appointment?.services?.map(s => s.service) ?? [])
  const [selOffers,   setSelOffers]   = useState<Offer[]>(appointment?.offers?.map(o => o.offer) ?? [])

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // Load staff
  useEffect(() => {
    fetch('/api/dashboard/staff?status=ACTIVE')
      .then(r => r.json())
      .then(d => setStaffList(d.staff ?? []))
      .catch(() => {})
  }, [])

  const total = [
    ...selServices.map(s => Number(s.discountedPrice ?? s.price)),
    ...selOffers.map(o => Number(o.finalPrice)),
  ].reduce((a, b) => a + b, 0)

  const handleNewPatient = (name: string, phone: string) => {
    setPatient({ id: -1, fullName: name, phone })
  }

  const submit = async () => {
    if (!date) { setError('Appointment date is required'); return }
    if (!patient && !appointment) { setError('Please select or add a patient'); return }
    setSaving(true); setError('')
    try {
      const payload: any = {
        appointmentDate: new Date(date).toISOString(),
        durationMinutes: duration ? Number(duration) : null,
        source, status,
        paymentStatus: payStat,
        paidAmount   : Number(paid),
        notes        : notes || null,
        internalNotes: intNotes || null,
        staffId      : staffId ? Number(staffId) : null,
        serviceIds   : selServices.map(s => s.id),
        offerIds     : selOffers.map(o => o.id),
      }

      if (patient && patient.id > 0) {
        payload.patientId = patient.id
      } else if (patient && patient.id === -1) {
        payload.tempPatientName  = patient.fullName
        payload.tempPatientPhone = patient.phone
      }

      const url    = appointment ? `/api/dashboard/appointments/${appointment.id}` : '/api/dashboard/appointments'
      const method = appointment ? 'PATCH' : 'POST'
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
          <h2 className="modal-title">{appointment ? 'Edit Appointment' : 'New Appointment'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.84rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Patient */}
          <div className="form-group">
            <label className="form-label">Patient *</label>
            <PatientCombobox value={patient} onChange={setPatient} onNewPatient={handleNewPatient} />
            {patient && patient.id === -1 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--warning)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> New patient will be auto-registered after creating this appointment.
              </p>
            )}
          </div>

          {/* Date + Duration + Source */}
          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input className="form-input" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min)</label>
              <input className="form-input" type="number" placeholder="e.g. 60" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Doctor */}
          <div className="form-group">
            <label className="form-label">Assign Staff</label>
            <select className="form-select" value={staffId} onChange={e => setStaffId(e.target.value)}>
              <option value="">No staff assigned</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.staffType})</option>)}
            </select>
          </div>

          {/* Services / Offers */}
          <div className="form-group">
            <label className="form-label">Services & Offers</label>
            <ServicesPicker
              selectedServices={selServices}
              selectedOffers={selOffers}
              onServicesChange={setSelServices}
              onOffersChange={setSelOffers}
            />
          </div>

          {/* Total */}
          {total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Total Amount</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>EGP {total.toLocaleString()}</span>
            </div>
          )}

          {/* Status + Payment */}
          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select className="form-select" value={payStat} onChange={e => setPayStat(e.target.value)}>
                {PAY_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Paid Amount (EGP)</label>
              <input className="form-input" type="number" min="0" value={paid} onChange={e => setPaid(e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Patient Notes</label>
              <textarea className="form-textarea" rows={3} placeholder="Notes visible to patient…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Internal Notes</label>
              <textarea className="form-textarea" rows={3} placeholder="Staff-only notes…" value={intNotes} onChange={e => setIntNotes(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}
            {appointment ? 'Save Changes' : 'Create Appointment'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Appointment Detail Modal ────────────────────────────── */
function AppointmentDetailModal({ appointment, onClose, onEdit }: { appointment: Appointment; onClose: () => void; onEdit: () => void }) {
  const patName = appointment.patient?.fullName ?? appointment.tempPatientName ?? 'Unknown'
  const patPhone = appointment.patient?.phone ?? appointment.tempPatientPhone ?? '—'

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-md">
        <div className="modal-header">
          <h2 className="modal-title">Appointment #{appointment.id}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}><Edit2 size={13} /> Edit</button>
            <button className="btn-icon" onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Patient */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem', background: 'var(--surface-2)', borderRadius: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
              {patName[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{patName}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{patPhone}</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span className={`badge badge-${appointment.status}`}>{appointment.status.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Date & time */}
          <div className="form-row form-row-2">
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date & Time</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{new Date(appointment.appointmentDate).toLocaleString('en-EG', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Duration</p>
              <p style={{ margin: 0 }}>{appointment.durationMinutes ? `${appointment.durationMinutes} min` : '—'}</p>
            </div>
          </div>

          {/* Services */}
          {appointment.services.length > 0 && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Services</p>
              {appointment.services.map(s => (
                <div key={s.service.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
                  <span>{s.service.name}</span>
                  <span style={{ fontWeight: 600 }}>EGP {Number(s.priceAtTime).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Offers */}
          {appointment.offers.length > 0 && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Offers</p>
              {appointment.offers.map(o => (
                <div key={o.offer.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
                  <span><Tag size={12} style={{ marginRight: 4 }} />{o.offer.title}</span>
                  <span style={{ fontWeight: 600 }}>EGP {Number(o.priceAtTime).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Payment summary */}
          <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total</span>
              <span style={{ fontWeight: 700 }}>EGP {Number(appointment.totalAmount).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Paid</span>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>EGP {Number(appointment.paidAmount).toLocaleString()}</span>
            </div>
            {Number(appointment.totalAmount) > Number(appointment.paidAmount) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Balance</span>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>EGP {(Number(appointment.totalAmount) - Number(appointment.paidAmount)).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Status</span>
              <span className={`badge badge-${appointment.paymentStatus}`}>{appointment.paymentStatus}</span>
            </div>
          </div>

          {appointment.notes && (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Notes</p>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text)' }}>{appointment.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Delete Confirm ──────────────────────────────────────── */
function DeleteApptConfirm({ id, onClose, onDeleted }: { id: number; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const doDelete = async () => {
    setDeleting(true)
    await fetch(`/api/dashboard/appointments/${id}`, { method: 'DELETE' })
    setDeleting(false)
    onDeleted()
  }
  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div className="modal-header">
          <h2 className="modal-title">Delete Appointment</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}>
            <Trash2 size={22} />
          </div>
          <p style={{ fontWeight: 600 }}>Delete appointment #{id}?</p>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>This action cannot be undone.</p>
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

/* ── Main Page ───────────────────────────────────────────── */
export default function AppointmentsPage() {
  const [appts,   setAppts]   = useState<Appointment[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [pages,   setPages]   = useState(1)
  const [loading, setLoading] = useState(true)

  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const [modalForm,   setModalForm]   = useState(false)
  const [modalView,   setModalView]   = useState(false)
  const [modalDelete, setModalDelete] = useState(false)
  const [selected,    setSelected]    = useState<Appointment | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '20' })
      if (search)   p.set('search',   search)
      if (status)   p.set('status',   status)
      if (dateFrom) p.set('dateFrom', dateFrom)
      if (dateTo)   p.set('dateTo',   dateTo)
      const res  = await fetch(`/api/dashboard/appointments?${p}`)
      const data = await res.json()
      setAppts(data.appointments ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } catch {} finally { setLoading(false) }
  }, [page, search, status, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  return (
    <div className="dash-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{total.toLocaleString()} total appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModalForm(true) }}>
          <Plus size={15} /> New Appointment
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search patient name or phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select" style={{ width: 160 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <input className="form-input" type="date" style={{ width: 160 }} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} placeholder="From" />
          <input className="form-input" type="date" style={{ width: 160 }} value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} placeholder="To" />
          {(search || status || dateFrom || dateTo) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1) }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="dash-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : appts.length === 0 ? (
          <div className="empty-state">
            <Clock size={32} className="empty-state-icon" />
            <p className="empty-state-title">No appointments found</p>
            <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModalForm(true) }}>
              <Plus size={13} /> New Appointment
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
                    <th>Date & Time</th>
                    <th>Services</th>
                    <th>Staff</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Source</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {appts.map(a => {
                    const patName  = a.patient?.fullName ?? a.tempPatientName ?? 'Unknown'
                    const patPhone = a.patient?.phone    ?? a.tempPatientPhone ?? ''
                    const svcNames = a.services.map(s => s.service.name).concat(a.offers.map(o => o.offer.title)).join(', ')
                    return (
                      <tr key={a.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>#{a.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{patName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{patPhone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.84rem' }}>
                            {new Date(a.appointmentDate).toLocaleDateString('en-EG', { dateStyle: 'medium' })}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={11} />
                            {new Date(a.appointmentDate).toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.80rem', color: 'var(--text-muted)', maxWidth: 180 }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {svcNames || '—'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{a.staff?.name ?? '—'}</td>
                        <td style={{ fontWeight: 600, fontSize: '0.84rem' }}>EGP {Number(a.totalAmount).toLocaleString()}</td>
                        <td><span className={`badge badge-${a.status}`}>{a.status.replace('_', ' ')}</span></td>
                        <td><span className={`badge badge-${a.paymentStatus}`}>{a.paymentStatus}</span></td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.source.replace('_', ' ')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn-icon" title="View"   onClick={() => { setSelected(a); setModalView(true)   }}><Eye    size={13} /></button>
                            <button className="btn-icon" title="Edit"   onClick={() => { setSelected(a); setModalForm(true)   }}><Edit2  size={13} /></button>
                            <button className="btn-icon" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => { setSelected(a); setModalDelete(true) }}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '1rem' }}>
                <button className="btn btn-secondary btn-sm" disabled={page <= 1}     onClick={() => setPage(p => p - 1)}><ChevronLeft  size={14} /></button>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            )}
          </>
        )}
      </div>

      {modalForm && (
        <AppointmentFormModal
          appointment={selected}
          onClose={() => setModalForm(false)}
          onSave={() => { setModalForm(false); load() }}
        />
      )}
      {modalView && selected && (
        <AppointmentDetailModal
          appointment={selected}
          onClose={() => setModalView(false)}
          onEdit={() => { setModalView(false); setModalForm(true) }}
        />
      )}
      {modalDelete && selected && (
        <DeleteApptConfirm
          id={selected.id}
          onClose={() => setModalDelete(false)}
          onDeleted={() => { setModalDelete(false); load() }}
        />
      )}
    </div>
  )
}
