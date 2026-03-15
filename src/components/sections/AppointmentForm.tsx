'use client'
// components/appointment/AppointmentForm.tsx
// 4-step appointment booking form
// Step 1 — Select services & offers
// Step 2 — Pick date & time slot
// Step 3 — Personal info
// Step 4 — Review & confirm

import { useEffect, useState } from 'react'
import {
  CalendarDays, Clock, CheckCircle, AlertCircle,
  Sparkles, Tag, User, Phone, Mail, ChevronDown, ChevronUp,
  MessageCircle, Loader2, ArrowRight, ArrowLeft, BadgePercent,
  ExternalLink,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type ServiceItem = {
  id              : number
  name            : string
  shortDescription: string | null
  price           : number
  discountedPrice : number | null
  duration        : number | null
  imageUrl        : string | null
}
type Category = {
  id      : number
  name    : string
  icon    : string | null
  color   : string | null
  services: ServiceItem[]
}
type OfferItem = {
  id           : number
  title        : string
  description  : string | null
  type         : string
  imageUrl     : string | null
  originalPrice: number
  finalPrice   : number
  discountPct  : number | null
  validUntil   : string | null
  isFeatured   : boolean
  services     : { service: { id: number; name: string } }[]
}
type Slot = {
  time     : string
  available: boolean
  isPast   : boolean
  isBooked : boolean
}
type DuplicateInfo = {
  date  : string
  status: string
}

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const C = {
  navy   : '#082b56',
  gold   : '#c49a6c',
  success: '#16a34a',
  danger : '#dc2626',
  warning: '#d97706',
  border : 'var(--border, #e5e7eb)',
  surf   : 'var(--surface, #ffffff)',
  surf2  : 'var(--surface-2, #f9fafb)',
  text   : 'var(--text, #111827)',
  muted  : 'var(--text-muted, #6b7280)',
  subtle : 'var(--text-subtle, #9ca3af)',
}

const STEPS = ['Services', 'Date & Time', 'Contact Info', 'Confirm']

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const money  = (n: number) => `EGP ${Number(n).toLocaleString('en-EG')}`
const toISO  = (d: Date)   => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

function longDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ─────────────────────────────────────────────
// StepBar
// ─────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2.25rem' }}>
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? '1 1 0' : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width          : 36, height: 36, borderRadius: '50%',
                display        : 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight     : 700, fontSize: '0.82rem', flexShrink: 0,
                transition     : 'all 0.22s',
                background     : done ? C.navy : active ? C.gold : C.surf2,
                color          : (done || active) ? '#fff' : C.subtle,
                border         : active ? `2.5px solid ${C.gold}` : `1.5px solid ${done ? C.navy : C.border}`,
                boxShadow      : active ? `0 0 0 4px ${C.gold}28` : 'none',
              }}>
                {done ? <CheckCircle size={15} /> : i + 1}
              </div>
              <span style={{
                fontSize  : '0.67rem', whiteSpace: 'nowrap', transition: 'color 0.2s',
                fontWeight: active ? 700 : 500,
                color     : active ? C.gold : done ? C.navy : C.subtle,
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '17px 5px 0', background: done ? C.navy : C.border, transition: 'background 0.3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// ServiceCard
// ─────────────────────────────────────────────
function ServiceCard({ service, selected, onToggle }: { service: ServiceItem; selected: boolean; onToggle: () => void }) {
  const price    = Number(service.discountedPrice ?? service.price)
  const orig     = Number(service.price)
  const hasDisc  = service.discountedPrice !== null && price < orig
  return (
    <div onClick={onToggle} style={{
      border     : `2px solid ${selected ? C.navy : C.border}`,
      borderRadius: 14, padding: '0.9rem 1rem', cursor: 'pointer',
      background : selected ? `${C.navy}07` : C.surf,
      transition : 'all 0.15s', position: 'relative', userSelect: 'none',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = `${C.navy}55` }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = C.border }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={13} color="#fff" />
        </div>
      )}
      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: C.text, marginBottom: 4, paddingRight: selected ? 28 : 0 }}>
        {service.name}
      </div>
      {service.shortDescription && (
        <div style={{ fontSize: '0.76rem', color: C.muted, marginBottom: 8, lineHeight: 1.55 }}>
          {service.shortDescription}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: C.navy }}>{money(price)}</span>
        {hasDisc && <span style={{ fontSize: '0.74rem', color: C.subtle, textDecoration: 'line-through' }}>{money(orig)}</span>}
        {service.duration && (
          <span style={{ fontSize: '0.7rem', color: C.muted, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} />{service.duration} min
          </span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// OfferCard
// ─────────────────────────────────────────────
function OfferCard({ offer, selected, onToggle }: { offer: OfferItem; selected: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      border     : `2px solid ${selected ? C.gold : C.border}`,
      borderRadius: 14, padding: '1rem 1.1rem', cursor: 'pointer',
      background : selected ? `${C.gold}09` : C.surf,
      transition : 'all 0.15s', position: 'relative', userSelect: 'none',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = `${C.gold}88` }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = C.border }}
    >
      {offer.isFeatured && (
        <span style={{ position: 'absolute', top: -1, left: 14, background: C.gold, color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 9px', borderRadius: '0 0 7px 7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Featured
        </span>
      )}
      {selected && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={13} color="#fff" />
        </div>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.gold}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BadgePercent size={19} color={C.gold} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, marginBottom: 4 }}>{offer.title}</div>
          {offer.description && (
            <div style={{ fontSize: '0.76rem', color: C.muted, marginBottom: 7, lineHeight: 1.55 }}>{offer.description}</div>
          )}
          {offer.services.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {offer.services.map(s => (
                <span key={s.service.id} style={{ fontSize: '0.67rem', fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: `${C.navy}0d`, color: C.navy }}>
                  {s.service.name}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '0.96rem', color: C.gold }}>{money(Number(offer.finalPrice))}</span>
            <span style={{ fontSize: '0.74rem', color: C.subtle, textDecoration: 'line-through' }}>{money(Number(offer.originalPrice))}</span>
            {offer.discountPct && (
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '2px 7px', borderRadius: 20 }}>
                -{offer.discountPct}%
              </span>
            )}
          </div>
          {offer.validUntil && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: C.warning, marginTop: 5 }}>
              <Clock size={10} /> Offer ends {new Date(offer.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// StickyBar (step 1 bottom)
// ─────────────────────────────────────────────
function StickyBar({ count, total, onNext }: { count: number; total: number; onNext: () => void }) {
  return (
    <div style={{ position: 'sticky', bottom: 16, background: C.navy, borderRadius: 16, padding: '0.95rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: `0 8px 32px ${C.navy}44`, marginTop: '1rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 2 }}>
          {count} item{count !== 1 ? 's' : ''} selected
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{money(total)}</div>
      </div>
      <button onClick={onNext} style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: 12, padding: '0.72rem 1.35rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', flexShrink: 0 }}>
        Next <ArrowRight size={15} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// NavRow
// ─────────────────────────────────────────────
function NavRow({ onBack, onNext, nextLabel, nextDisabled }: { onBack: () => void; onNext: () => void; nextLabel: string; nextDisabled: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
      <button onClick={onBack} style={{ padding: '0.82rem 1.25rem', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surf, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, color: C.text, flexShrink: 0 }}>
        <ArrowLeft size={14} /> Back
      </button>
      <button onClick={onNext} disabled={nextDisabled} style={{ flex: 1, padding: '0.85rem', borderRadius: 12, border: 'none', background: nextDisabled ? C.border : C.navy, color: nextDisabled ? C.subtle : '#fff', cursor: nextDisabled ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s' }}>
        {nextLabel} <ArrowRight size={14} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// SummaryRow
// ─────────────────────────────────────────────
function SRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ color: C.subtle, marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '0.79rem', color: C.muted, minWidth: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: highlight ? '0.96rem' : '0.84rem', fontWeight: highlight ? 800 : 600, color: highlight ? C.navy : C.text, flex: 1 }}>{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// FormField
// ─────────────────────────────────────────────
function FF({ label, hint, icon, children }: { label: string; hint?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon && <span style={{ color: C.subtle }}>{icon}</span>}{label}
      </label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: '0.72rem', color: C.subtle, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Duplicate Warning Banner
// ─────────────────────────────────────────────
function DuplicateBanner({ message, appointment }: { message: string; appointment?: DuplicateInfo }) {
  return (
    <div style={{ background: '#fffbeb', border: `1.5px solid #fcd34d`, borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertCircle size={18} style={{ color: C.warning, flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.86rem', color: '#92400e' }}>
            Active Appointment Found
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', lineHeight: 1.6 }}>{message}</p>
        </div>
      </div>
      {appointment && (
        <div style={{ display: 'flex', gap: 8, paddingLeft: 28, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${C.warning}18`, color: C.warning, border: `1px solid ${C.warning}30` }}>
            <CalendarDays size={11} />
            {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fef2f2', color: '#9f1239', border: '1px solid #fecaca' }}>
            {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
          </span>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════
export default function AppointmentForm() {
  const [step,        setStep       ] = useState(0)
  const [categories,  setCategories ] = useState<Category[]>([])
  const [offers,      setOffers     ] = useState<OfferItem[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [dataError,   setDataError  ] = useState(false)

  // Step 1 — selection
  const [selServices, setSelServices] = useState<number[]>([])
  const [selOffers,   setSelOffers  ] = useState<number[]>([])
  const [expandedCats,setExpandedCats] = useState<number[]>([])

  // Step 2 — date/time
  const [date,         setDate        ] = useState('')
  const [time,         setTime        ] = useState('')
  const [slots,        setSlots       ] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isClosed,     setIsClosed    ] = useState(false)

  // Step 3 — personal info
  const [info, setInfo] = useState({ fullName: '', phone: '', email: '', gender: '', notes: '' })

  // Submit
  const [submitting,   setSubmitting  ] = useState(false)
  const [submitError,  setSubmitError ] = useState('')
  const [duplicateInfo,setDuplicateInfo] = useState<{ message: string; appointment?: DuplicateInfo } | null>(null)
  const [successData,  setSuccessData ] = useState<any>(null)

  // 21-day date strip
  const dateStrip = Array.from({ length: 21 }, (_, i) => addDays(new Date(), i))

  // ── Load services + offers ──────────────────────────────
  useEffect(() => {
    fetch('/api/book/services')
      .then(r => r.json())
      .then(d => {
        const cats = (d.categories ?? []) as Category[]
        setCategories(cats)
        setOffers(d.offers ?? [])
        if (cats.length) setExpandedCats([cats[0].id])
      })
      .catch(() => setDataError(true))
      .finally(() => setLoadingData(false))
  }, [])

  // ── Load slots on date change ───────────────────────────
  useEffect(() => {
    if (!date) return
    setLoadingSlots(true); setTime(''); setSlots([])
    fetch(`/api/book/availability?date=${date}`)
      .then(r => r.json())
      .then(d => { setSlots(d.slots ?? []); setIsClosed(d.isClosed ?? false) })
      .catch(() => {})
      .finally(() => setLoadingSlots(false))
  }, [date])

  // ── Computed ────────────────────────────────────────────
  const allSvcs      = categories.flatMap(c => c.services)
  const pickedSvcs   = allSvcs.filter(s => selServices.includes(s.id))
  const pickedOfrs   = offers.filter(o => selOffers.includes(o.id))
  const total        = pickedSvcs.reduce((sum, s) => sum + Number(s.discountedPrice ?? s.price), 0) + pickedOfrs.reduce((sum, o) => sum + Number(o.finalPrice), 0)
  const selCount     = selServices.length + selOffers.length
  const hasSelection = selCount > 0

  const toggleService = (id: number) => setSelServices(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleOffer   = (id: number) => setSelOffers(p   => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleCat     = (id: number) => setExpandedCats(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  // ── Submit ──────────────────────────────────────────────
  const submit = async () => {
    setSubmitting(true); setSubmitError(''); setDuplicateInfo(null)
    try {
      const res  = await fetch('/api/book', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          fullName  : info.fullName,
          phone     : info.phone,
          email     : info.email   || undefined,
          gender    : info.gender  || undefined,
          date, time,
          serviceIds: selServices,
          offerIds  : selOffers,
          notes     : info.notes   || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'slot_taken') {
          setSubmitError(data.message)
          setStep(1); setTime('')
        } else if (data.error?.startsWith('duplicate')) {
          setDuplicateInfo({ message: data.message, appointment: data.appointment })
        } else {
          setSubmitError(data.message ?? data.error ?? 'Booking failed. Please try again.')
        }
        return
      }
      setSuccessData(data)
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false) }
  }

  const reset = () => {
    setSuccessData(null); setStep(0)
    setSelServices([]); setSelOffers([]); setDate(''); setTime('')
    setInfo({ fullName: '', phone: '', email: '', gender: '', notes: '' })
    setSubmitError(''); setDuplicateInfo(null)
  }

  // ─────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────
  if (successData) {
    const { appointment, whatsapp } = successData
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircle size={44} style={{ color: C.success }} />
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, color: C.navy }}>
          Appointment Booked! 🎉
        </h2>
        <p style={{ margin: '0 0 1.75rem', color: C.muted, fontSize: '0.9rem', lineHeight: 1.65 }}>
          Your appointment has been successfully registered at Glow Medical.
          We'll contact you shortly to confirm your slot.
        </p>

        <div style={{ background: C.surf2, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: '1.25rem 1.5rem', marginBottom: '1.25rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <SRow icon={<CalendarDays size={14} />} label="Date"     value={appointment.dateFormatted} />
            <SRow icon={<Clock size={14} />}        label="Time"     value={appointment.timeFormatted} />
            <SRow icon={<Sparkles size={14} />}     label="Services" value={[...appointment.services, ...appointment.offers].join(' · ') || '—'} />
            <SRow icon={<Tag size={14} />}          label="Total"    value={money(appointment.totalAmount)} highlight />
          </div>
        </div>

        {whatsapp?.status === 'SENT' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.7rem 1rem', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '1.5rem' }}>
            <MessageCircle size={15} style={{ color: '#25d366' }} />
            WhatsApp confirmation sent ✓
          </div>
        )}

        <button onClick={reset} style={{ background: C.navy, color: '#fff', border: 'none', borderRadius: 12, padding: '0.82rem 2rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          Book Another Appointment
        </button>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // FORM
  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <StepBar current={step} />

      {/* ══════════════════════════════════════════════
          STEP 1 — SERVICES & OFFERS
      ══════════════════════════════════════════════ */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.22s ease' }}>
          {loadingData ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={30} style={{ animation: 'spin 0.8s linear infinite', color: C.navy }} />
            </div>
          ) : dataError ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: C.danger }}>
              <AlertCircle size={28} style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Failed to load services. Please refresh and try again.</p>
            </div>
          ) : (
            <>
              {/* Offers section */}
              {offers.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: `1.5px solid ${C.border}` }}>
                    <BadgePercent size={17} style={{ color: C.gold }} />
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: C.text }}>Special Offers</h3>
                    <span style={{ fontSize: '0.7rem', background: `${C.gold}20`, color: C.gold, padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>Save more</span>
                  </div>
                  <div style={{ display: 'grid', gap: '0.7rem' }}>
                    {offers.map(o => <OfferCard key={o.id} offer={o} selected={selOffers.includes(o.id)} onToggle={() => toggleOffer(o.id)} />)}
                  </div>
                </div>
              )}

              {/* Services by category */}
              {categories.length === 0 ? (
                <p style={{ textAlign: 'center', color: C.muted, padding: '2rem' }}>No services available at the moment.</p>
              ) : (
                <div>
                  {offers.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem', paddingTop: '0.25rem' }}>
                      <Sparkles size={17} style={{ color: C.navy }} />
                      <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: C.text }}>Individual Services</h3>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {categories.map(cat => (
                      <div key={cat.id}>
                        <button onClick={() => toggleCat(cat.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '0.8rem 1rem', background: C.surf2, border: `1.5px solid ${C.border}`, borderRadius: expandedCats.includes(cat.id) ? '12px 12px 0 0' : 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {cat.icon && <span style={{ fontSize: '1.05rem' }}>{cat.icon}</span>}
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: C.text, flex: 1, textAlign: 'left' }}>{cat.name}</span>
                          <span style={{ fontSize: '0.72rem', color: C.subtle, marginRight: 4 }}>{cat.services.length} service{cat.services.length !== 1 ? 's' : ''}</span>
                          {expandedCats.includes(cat.id) ? <ChevronUp size={15} style={{ color: C.subtle }} /> : <ChevronDown size={15} style={{ color: C.subtle }} />}
                        </button>
                        {expandedCats.includes(cat.id) && (
                          <div style={{ border: `1.5px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '0.75rem', display: 'grid', gap: '0.6rem' }}>
                            {cat.services.map(s => <ServiceCard key={s.id} service={s} selected={selServices.includes(s.id)} onToggle={() => toggleService(s.id)} />)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {hasSelection && <StickyBar count={selCount} total={total} onNext={() => setStep(1)} />}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          STEP 2 — DATE & TIME
      ══════════════════════════════════════════════ */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'fadeIn 0.22s ease' }}>

          {/* Date strip */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <CalendarDays size={16} style={{ color: C.navy }} />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: C.text }}>Choose a Date</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {dateStrip.map(d => {
                const iso        = toISO(d)
                const isSelected = iso === date
                return (
                  <button key={iso} onClick={() => setDate(iso)} style={{ flexShrink: 0, minWidth: 66, padding: '0.65rem 0.5rem', borderRadius: 12, border: `2px solid ${isSelected ? C.navy : C.border}`, background: isSelected ? C.navy : C.surf, color: isSelected ? '#fff' : C.text, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3, opacity: 0.75 }}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: '0.62rem', marginTop: 2, opacity: 0.7 }}>
                      {d.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          {date && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
                <Clock size={16} style={{ color: C.navy }} />
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: C.text }}>Available Times</h3>
                {!loadingSlots && !isClosed && slots.length > 0 && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#dcfce7', color: '#16a34a', padding: '2px 9px', borderRadius: 20 }}>
                    {slots.filter(s => s.available).length} available
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem' }}>
                  <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: C.navy }} />
                </div>
              ) : isClosed ? (
                <div style={{ padding: '1.75rem', textAlign: 'center', background: C.surf2, borderRadius: 14, border: `1.5px solid ${C.border}` }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔒</div>
                  <p style={{ margin: 0, color: C.muted, fontWeight: 600 }}>Clinic is closed on this day</p>
                  <p style={{ margin: '4px 0 0', color: C.subtle, fontSize: '0.8rem' }}>Please select another date</p>
                </div>
              ) : slots.length === 0 ? (
                <p style={{ textAlign: 'center', color: C.muted, padding: '1.5rem' }}>No slots available for this date.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: '0.5rem' }}>
                  {slots.map(slot => {
                    const isSel = slot.time === time
                    return (
                      <button key={slot.time} disabled={!slot.available} onClick={() => setTime(slot.time)}
                        title={slot.isBooked ? 'Already booked' : slot.isPast ? 'Past time' : slot.time}
                        style={{ padding: '0.62rem 0.4rem', borderRadius: 10, border: `2px solid ${isSel ? C.navy : slot.available ? C.border : 'transparent'}`, background: isSel ? C.navy : slot.available ? C.surf : C.surf2, color: isSel ? '#fff' : slot.available ? C.text : C.subtle, cursor: slot.available ? 'pointer' : 'not-allowed', fontSize: '0.82rem', fontWeight: isSel ? 800 : 600, fontFamily: 'inherit', transition: 'all 0.13s', opacity: slot.available ? 1 : 0.4, position: 'relative' }}>
                        {slot.time}
                        {slot.isBooked && !slot.isPast && (
                          <span style={{ position: 'absolute', bottom: 1, left: 0, right: 0, fontSize: '0.48rem', color: C.danger, fontWeight: 700, textAlign: 'center' }}>Booked</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <NavRow onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Continue" nextDisabled={!date || !time} />
        </div>
      )}

      {/* ══════════════════════════════════════════════
          STEP 3 — CONTACT INFO
      ══════════════════════════════════════════════ */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.22s ease' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <FF label="Full Name *" icon={<User size={14} />}>
              <input className="form-input" value={info.fullName} onChange={e => setInfo(f => ({ ...f, fullName: e.target.value }))} placeholder="Sara Ahmed" />
            </FF>
            <FF label="Phone Number *" icon={<Phone size={14} />} hint="Used for WhatsApp confirmation">
              <input className="form-input" type="tel" value={info.phone} onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))} placeholder="01001234567" />
            </FF>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <FF label="Email Address" icon={<Mail size={14} />}>
              <input className="form-input" type="email" value={info.email} onChange={e => setInfo(f => ({ ...f, email: e.target.value }))} placeholder="sara@email.com" />
            </FF>
            <FF label="Gender">
              <select className="form-select" value={info.gender} onChange={e => setInfo(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Prefer not to say</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
              </select>
            </FF>
          </div>

          <FF label="Additional Notes (optional)">
            <textarea className="form-textarea" rows={3} value={info.notes} onChange={e => setInfo(f => ({ ...f, notes: e.target.value }))} placeholder="Any special requirements or medical notes…" style={{ resize: 'vertical' }} />
          </FF>

          {/* Duplicate warning shown live in step 3 */}
          {duplicateInfo && <DuplicateBanner message={duplicateInfo.message} appointment={duplicateInfo.appointment} />}

          {/* WhatsApp notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0.8rem 1rem', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
            <MessageCircle size={15} style={{ color: '#25d366', flexShrink: 0 }} />
            A WhatsApp confirmation will be sent after booking.
          </div>

          <NavRow onBack={() => setStep(1)} onNext={() => { setDuplicateInfo(null); setStep(3) }} nextLabel="Review Booking" nextDisabled={!info.fullName.trim() || !info.phone.trim()} />
        </div>
      )}

      {/* ══════════════════════════════════════════════
          STEP 4 — CONFIRM
      ══════════════════════════════════════════════ */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.22s ease' }}>

          {/* Summary card */}
          <div style={{ background: C.surf2, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: `1px solid ${C.border}`, background: C.surf, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} style={{ color: C.navy }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text }}>Booking Summary</span>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.72rem' }}>
              <SRow icon={<User size={14} />}         label="Patient" value={info.fullName} />
              <SRow icon={<Phone size={14} />}        label="Phone"   value={info.phone} />
              {info.email && <SRow icon={<Mail size={14} />} label="Email" value={info.email} />}
              <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '2px 0' }} />
              <SRow icon={<CalendarDays size={14} />} label="Date"    value={longDate(date)} />
              <SRow icon={<Clock size={14} />}        label="Time"    value={time} />
              <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, margin: '2px 0' }} />
              {pickedSvcs.map(s => <SRow key={s.id} icon={<Sparkles size={13} />}    label={s.name}   value={money(Number(s.discountedPrice ?? s.price))} />)}
              {pickedOfrs.map(o => <SRow key={o.id} icon={<BadgePercent size={13} />} label={o.title}  value={money(Number(o.finalPrice))} />)}
              <hr style={{ border: 'none', borderTop: `1.5px solid ${C.border}`, margin: '2px 0' }} />
              <SRow icon={<Tag size={14} />} label="Total" value={money(total)} highlight />
            </div>
          </div>

          {/* Duplicate warning */}
          {duplicateInfo && <DuplicateBanner message={duplicateInfo.message} appointment={duplicateInfo.appointment} />}

          {/* Generic error */}
          {submitError && (
            <div style={{ display: 'flex', gap: 9, padding: '0.9rem 1rem', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, color: C.danger, fontSize: '0.84rem', alignItems: 'flex-start' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{submitError}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => { setSubmitError(''); setDuplicateInfo(null); setStep(2) }} style={{ padding: '0.85rem 1.25rem', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.surf, cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, color: C.text, flexShrink: 0 }}>
              <ArrowLeft size={14} /> Edit
            </button>
            <button onClick={submit} disabled={submitting || !!duplicateInfo} style={{ flex: 1, padding: '0.9rem', borderRadius: 12, border: 'none', background: (submitting || duplicateInfo) ? `${C.navy}90` : C.navy, color: '#fff', cursor: (submitting || duplicateInfo) ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
              {submitting
                ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Confirming…</>
                : <><CalendarDays size={16} /> Confirm Appointment</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
