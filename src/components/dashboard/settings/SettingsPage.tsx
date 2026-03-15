'use client'
// components/dashboard/settings/SettingsPage.tsx

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Save, CheckCircle, AlertCircle, Settings2,
  Phone, Globe, Instagram, Facebook, Twitter, Music2,
  Image as ImageIcon, MapPin, Mail, Link2,
  Upload, X, Search,
} from 'lucide-react'
import PhotoUpload from '@/components/shared/PhotoUpload'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type GalleryImage = {
  id    : number
  url   : string
  alt   : string | null
  order : number
}

type ClinicSettings = {
  id              : number
  clinicName      : string
  tagline         : string | null
  phone           : string | null
  phone2          : string | null
  email           : string | null
  address         : string | null
  mapUrl          : string | null
  workingHours    : string | null
  whatsapp        : string | null
  facebook        : string | null
  instagram       : string | null
  twitter         : string | null
  tiktok          : string | null
  logoUrl         : string | null
  faviconUrl      : string | null
  aboutText       : string | null
  metaTitle       : string | null
  metaDescription : string | null
  galleryImages   : GalleryImage[]
}

// ─────────────────────────────────────────────
// Tab config  (no admin tab)
// ─────────────────────────────────────────────
const TABS = [
  { id: 'general',  label: 'General',     icon: Settings2 },
  { id: 'contact',  label: 'Contact',     icon: Phone     },
  { id: 'social',   label: 'Social',      icon: Globe     },
  { id: 'branding', label: 'Branding',    icon: ImageIcon },
  { id: 'seo',      label: 'SEO',         icon: Search    },
]

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div style={{
      position    : 'fixed',
      bottom      : 28,
      right       : 28,
      zIndex      : 9999,
      display     : 'flex',
      alignItems  : 'center',
      gap         : 10,
      padding     : '0.9rem 1.25rem',
      background  : type === 'success' ? 'var(--success)' : 'var(--danger)',
      color       : '#fff',
      borderRadius: 14,
      boxShadow   : '0 8px 32px rgba(0,0,0,0.18)',
      fontSize    : '0.86rem',
      fontWeight  : 600,
      minWidth    : 260,
      animation   : 'toastIn 0.28s ease',
    }}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, display: 'flex', opacity: 0.75 }}>
        <X size={14} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Section card with header + body
// ─────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{
        padding     : '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background  : 'var(--surface-2)',
      }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
        {subtitle && <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Field: label + hint + children
// ─────────────────────────────────────────────
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {required && <span style={{ color: 'var(--danger)', lineHeight: 1 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-subtle)', lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Grid helpers
// ─────────────────────────────────────────────
const Row2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>{children}</div>
)

// ─────────────────────────────────────────────
// Character counter progress bar
// ─────────────────────────────────────────────
function CharBar({ value, max, warn }: { value: number; max: number; warn: number }) {
  const pct  = Math.min(100, (value / max) * 100)
  const over = value > warn
  const color = over ? 'var(--danger)' : value > warn * 0.8 ? '#f59e0b' : 'var(--success)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
      <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.2s, background 0.2s' }} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color, minWidth: 38, textAlign: 'right' }}>{value}/{max}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// Gallery Manager
// ─────────────────────────────────────────────
function GalleryManager({ images, onAdd, onRemove, onAltChange }: {
  images     : GalleryImage[]
  onAdd      : (imgs: { url: string; alt: string }[]) => void
  onRemove   : (img: GalleryImage) => void
  onAltChange: (id: number, alt: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const fileRef                   = useRef<HTMLInputElement>(null)
  const cloudName                 = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const preset                    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

  const uploadFiles = async (files: FileList) => {
    setUploading(true); setProgress(0)
    const list    = Array.from(files)
    const results : { url: string; alt: string }[] = []
    for (let i = 0; i < list.length; i++) {
      try {
        const fd = new FormData()
        fd.append('file', list[i]); fd.append('upload_preset', preset); fd.append('folder', 'glow-medical/gallery')
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd })
        const data = await res.json()
        if (data.secure_url) results.push({ url: data.secure_url, alt: list[i].name.replace(/\.[^.]+$/, '') })
      } catch {}
      setProgress(Math.round(((i + 1) / list.length) * 100))
    }
    if (results.length) onAdd(results)
    setUploading(false); setProgress(0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.85rem' }}>
        {images.map(img => (
          <div key={img.id} style={{ border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface-2)', transition: 'box-shadow 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ position: 'relative', paddingTop: '66%' }}>
              <img src={img.url} alt={img.alt || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => onRemove(img)} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <X size={11} />
              </button>
            </div>
            <div style={{ padding: '0.45rem 0.6rem', borderTop: '1px solid var(--border)' }}>
              <input
                style={{ width: '100%', background: 'none', border: 'none', fontSize: '0.72rem', color: 'var(--text-muted)', outline: 'none', padding: 0, fontFamily: 'inherit' }}
                placeholder="Alt text…"
                value={img.alt ?? ''}
                onChange={e => onAltChange(img.id, e.target.value)}
              />
            </div>
          </div>
        ))}

        {/* Upload tile */}
        <label style={{
          border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: uploading ? 'wait' : 'pointer', minHeight: 120, gap: 8, color: 'var(--text-subtle)', transition: 'all 0.18s', background: 'var(--surface-2)',
        }}
          onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-subtle)' }}
        >
          {uploading ? (
            <><div className="spinner spinner-md" /><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{progress}%</span></>
          ) : (
            <><Upload size={22} strokeWidth={1.5} /><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Add Photos</span><span style={{ fontSize: '0.68rem' }}>JPG · PNG · WebP</span></>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} disabled={uploading}
            onChange={e => e.target.files && uploadFiles(e.target.files)} />
        </label>
      </div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
        {images.length} image{images.length !== 1 ? 's' : ''} · Stored on Cloudinary · Click alt text to edit accessibility label
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Social Link Field — full-width row card
// ─────────────────────────────────────────────
function SocialField({ icon: Icon, label, color, value, onChange, placeholder }: {
  icon       : React.FC<any>
  label      : string
  color      : string
  value      : string
  onChange   : (v: string) => void
  placeholder: string
}) {
  return (
    <div style={{
      display             : 'grid',
      gridTemplateColumns : '190px 1fr',
      alignItems          : 'center',
      gap                 : '1rem',
      padding             : '0.9rem 1.15rem',
      border              : '1.5px solid var(--border)',
      borderRadius        : 12,
      background          : 'var(--surface-2)',
      transition          : 'border-color 0.15s, background 0.15s',
    }}
      onFocusCapture={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08` }}
      onBlurCapture ={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} color={color} />
        </div>
        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input className="form-input" style={{ flex: 1 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        {value && (
          <a href={value} target="_blank" rel="noopener noreferrer"
            style={{ padding: '0 12px', height: 38, display: 'flex', alignItems: 'center', borderRadius: 9, background: `${color}15`, color, fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, border: `1px solid ${color}25` }}>
            Open ↗
          </a>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ICON-PREFIXED INPUT helper
// ─────────────────────────────────────────────
function IconInput({ icon: Icon, ...props }: { icon: React.FC<any> } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
      <input className="form-input" style={{ paddingLeft: 34 }} {...props} />
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ═════════════════════════════════════════════════════════
export default function SettingsPage() {
  const [tab,            setTab]           = useState('general')
  const [settings,       setSettings]      = useState<ClinicSettings | null>(null)
  const [loading,        setLoading]       = useState(true)
  const [saving,         setSaving]        = useState(false)
  const [toast,          setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [form,           setForm]          = useState<Partial<ClinicSettings>>({})
  const [localGallery,   setLocalGallery]  = useState<GalleryImage[]>([])
  const [galleryToRemove,setGalleryToRemove] = useState<GalleryImage[]>([])
  const [galleryToAdd,   setGalleryToAdd]  = useState<{ url: string; alt: string }[]>([])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type })

  // ── Load ───────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/dashboard/settings')
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
        setForm(data.settings)
        setLocalGallery(data.settings.galleryImages ?? [])
      }
    } catch { showToast('Failed to load settings', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const setF = (k: keyof ClinicSettings, v: any) => setForm(f => ({ ...f, [k]: v }))

  // ── Save ───────────────────────────────────────────────
  const save = async () => {
    setSaving(true)
    try {
      const payload: any = { ...form }
      delete payload.galleryImages; delete payload.id
      if (galleryToRemove.length) payload.galleryRemove = galleryToRemove.map(i => ({ id: i.id }))
      if (galleryToAdd.length)    payload.galleryAdd    = galleryToAdd

      const res  = await fetch('/api/dashboard/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Save failed', 'error'); return }

      setSettings(data.settings)
      setLocalGallery(data.settings.galleryImages ?? [])
      setGalleryToRemove([]); setGalleryToAdd([])
      showToast('Settings saved successfully')
    } catch { showToast('Network error', 'error') }
    finally { setSaving(false) }
  }

  // ── Gallery handlers ───────────────────────────────────
  const handleGalleryAdd = (imgs: { url: string; alt: string }[]) => {
    setGalleryToAdd(prev => [...prev, ...imgs])
    setLocalGallery(prev => [...prev, ...imgs.map((img, i) => ({ id: -(Date.now() + i), url: img.url, alt: img.alt, order: prev.length + i }))])
  }
  const handleGalleryRemove = (img: GalleryImage) => {
    if (img.id > 0) setGalleryToRemove(prev => [...prev, img])
    else setGalleryToAdd(prev => prev.filter(a => a.url !== img.url))
    setLocalGallery(prev => prev.filter(i => i.id !== img.id))
  }
  const handleGalleryAltChange = (id: number, alt: string) =>
    setLocalGallery(prev => prev.map(i => i.id === id ? { ...i, alt } : i))

  const hasChanges =
    galleryToRemove.length > 0 || galleryToAdd.length > 0 ||
    JSON.stringify({ ...form, galleryImages: undefined }) !==
    JSON.stringify({ ...settings, galleryImages: undefined })

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dash-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  return (
    <div className="dash-page">
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(16px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }`}</style>

      {/* ── Page header ───────────────────────────────── */}
      <div style={{
        display        : 'flex',
        alignItems     : 'flex-start',
        justifyContent : 'space-between',
        marginBottom   : '2rem',
        gap            : '1rem',
        flexWrap       : 'wrap',
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Settings2 size={22} style={{ color: 'var(--primary)' }} />
            Settings
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage your clinic information, branding, and online presence
          </p>
        </div>

        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ position: 'relative', minWidth: 140 }}>
          {saving ? <span className="spinner spinner-sm" /> : <Save size={14} />}
          Save Changes
          {hasChanges && !saving && (
            <span style={{ position: 'absolute', top: -5, right: -5, width: 11, height: 11, borderRadius: '50%', background: '#f59e0b', border: '2.5px solid var(--surface)' }} />
          )}
        </button>
      </div>

      {/* ── Tab bar ───────────────────────────────────── */}
      <div style={{
        display    : 'flex',
        gap        : 3,
        background : 'var(--surface-2)',
        borderRadius: 14,
        padding    : 4,
        border     : '1.5px solid var(--border)',
        marginBottom: '2rem',
        overflowX  : 'auto',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex          : '1 1 0',
            minWidth      : 110,
            padding       : '0.6rem 0.75rem',
            borderRadius  : 10,
            border        : 'none',
            cursor        : 'pointer',
            fontSize      : '0.81rem',
            fontWeight    : 600,
            fontFamily    : 'inherit',
            display       : 'flex',
            alignItems    : 'center',
            justifyContent: 'center',
            gap           : 6,
            whiteSpace    : 'nowrap',
            transition    : 'all 0.18s',
            background    : tab === t.id ? 'var(--surface)' : 'transparent',
            color         : tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow     : tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          TAB: GENERAL
      ══════════════════════════════════════════════════ */}
      {tab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <Section title="Clinic Identity" subtitle="Basic information shown across your platform and website">
            <Row2>
              <Field label="Clinic Name" required>
                <input className="form-input" value={form.clinicName ?? ''} onChange={e => setF('clinicName', e.target.value)} placeholder="Glow Medical" />
              </Field>
              <Field label="Tagline" hint="A short slogan shown under your clinic name">
                <input className="form-input" value={form.tagline ?? ''} onChange={e => setF('tagline', e.target.value)} placeholder="Your beauty, our expertise" />
              </Field>
            </Row2>

            <Field label="About the Clinic" hint="Shown on your website's About page. You can write in Arabic, English, or both.">
              <textarea className="form-textarea" rows={6} value={form.aboutText ?? ''} onChange={e => setF('aboutText', e.target.value)}
                placeholder={`Glow Medical is a premium aesthetic clinic offering advanced skincare and body treatments…\n\nيقدم مركز Glow Medical خدمات تجميلية متطورة…`}
                style={{ lineHeight: 1.75, resize: 'vertical' }}
              />
            </Field>
          </Section>

          <Section title="Working Hours" subtitle="Displayed on your website and Google Business profile">
            <Field label="Hours schedule" hint="You can write in Arabic or English — or both">
              <textarea className="form-textarea" rows={5} value={form.workingHours ?? ''} onChange={e => setF('workingHours', e.target.value)}
                placeholder={`Saturday – Thursday: 10:00 AM – 9:00 PM\nFriday: Closed\n\nالسبت – الخميس: ١٠ صباحًا – ٩ مساءً\nالجمعة: مغلق`}
                style={{ lineHeight: 1.8, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </Field>
          </Section>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: CONTACT
      ══════════════════════════════════════════════════ */}
      {tab === 'contact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <Section title="Phone Numbers" subtitle="Main contact lines displayed to patients">
            <Row2>
              <Field label="Primary Phone">
                <IconInput icon={Phone} value={form.phone ?? ''} onChange={e => setF('phone', e.target.value)} placeholder="01000000000" />
              </Field>
              <Field label="Secondary Phone">
                <IconInput icon={Phone} value={form.phone2 ?? ''} onChange={e => setF('phone2', e.target.value)} placeholder="01100000000" />
              </Field>
            </Row2>
          </Section>

          <Section title="Email & WhatsApp" subtitle="Digital contact channels">
            <Row2>
              <Field label="Email Address">
                <IconInput icon={Mail} type="email" value={form.email ?? ''} onChange={e => setF('email', e.target.value)} placeholder="info@glowmedical.com" />
              </Field>
              <Field label="WhatsApp Number" hint="Include country code without '+' — e.g. 201001234567">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', lineHeight: 1, pointerEvents: 'none' }}>💬</span>
                  <input className="form-input" style={{ paddingLeft: 34 }} value={form.whatsapp ?? ''} onChange={e => setF('whatsapp', e.target.value)} placeholder="201001234567" />
                </div>
              </Field>
            </Row2>
          </Section>

          <Section title="Location" subtitle="Your physical address and Google Maps link">
            <Field label="Full Address">
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 11, top: 13, color: 'var(--text-subtle)', pointerEvents: 'none' }} />
                <textarea className="form-textarea" style={{ paddingLeft: 34, resize: 'vertical' }} rows={2}
                  value={form.address ?? ''} onChange={e => setF('address', e.target.value)} placeholder="123 Tahrir Street, Cairo, Egypt" />
              </div>
            </Field>

            <Field label="Google Maps URL" hint="Paste your clinic's Google Maps share link">
              <IconInput icon={Link2} value={form.mapUrl ?? ''} onChange={e => setF('mapUrl', e.target.value)} placeholder="https://maps.google.com/…" />
              {form.mapUrl && (
                <a href={form.mapUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                  <MapPin size={11} /> Preview on Google Maps →
                </a>
              )}
            </Field>
          </Section>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: SOCIAL MEDIA
      ══════════════════════════════════════════════════ */}
      {tab === 'social' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <Section title="Social Media Profiles" subtitle="Link your official accounts — displayed in your website's footer and contact page">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <SocialField icon={Instagram} label="Instagram" color="#e1306c"
                value={form.instagram ?? ''} onChange={v => setF('instagram', v)} placeholder="https://instagram.com/glowmedical" />
              <SocialField icon={Facebook}  label="Facebook"  color="#1877f2"
                value={form.facebook  ?? ''} onChange={v => setF('facebook',  v)} placeholder="https://facebook.com/glowmedical" />
              <SocialField icon={Twitter}   label="Twitter / X" color="#000"
                value={form.twitter   ?? ''} onChange={v => setF('twitter',   v)} placeholder="https://x.com/glowmedical" />
              <SocialField icon={Music2}    label="TikTok"    color="#010101"
                value={form.tiktok    ?? ''} onChange={v => setF('tiktok',    v)} placeholder="https://tiktok.com/@glowmedical" />
            </div>
          </Section>

          {(form.instagram || form.facebook || form.twitter || form.tiktok) && (
            <Section title="Active Links Preview">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                {[
                  { val: form.instagram, label: 'Instagram', emoji: '📸', color: '#e1306c' },
                  { val: form.facebook,  label: 'Facebook',  emoji: '👤', color: '#1877f2' },
                  { val: form.twitter,   label: 'X / Twitter', emoji: '🐦', color: '#000' },
                  { val: form.tiktok,    label: 'TikTok',    emoji: '🎵', color: '#010101' },
                ].filter(s => s.val).map(s => (
                  <a key={s.label} href={s.val!} target="_blank" rel="noopener noreferrer"
                    style={{ padding: '8px 16px', borderRadius: 30, background: `${s.color}10`, border: `1.5px solid ${s.color}30`,
                      fontSize: '0.82rem', fontWeight: 700, color: s.color, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${s.color}20`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${s.color}10`)}
                  >{s.emoji} {s.label}</a>
                ))}
              </div>
            </Section>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: BRANDING
      ══════════════════════════════════════════════════ */}
      {tab === 'branding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <Section title="Logo & Favicon" subtitle="Upload your clinic's visual identity assets">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

              {/* Logo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)' }}>Clinic Logo</p>
                  <PhotoUpload value={form.logoUrl ?? ''} onChange={url => setF('logoUrl', url)} folder="glow-medical/branding" size={110} shape="rect" />
                </div>
                {form.logoUrl && (
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: '0.73rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previews</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, padding: '0.75rem', background: '#fff', borderRadius: 10, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={form.logoUrl} alt="logo light" style={{ maxHeight: 40, maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1, padding: '0.75rem', background: '#082b56', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={form.logoUrl} alt="logo dark" style={{ maxHeight: 40, maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                  </div>
                )}
                <Field label="Or enter URL manually">
                  <input className="form-input" value={form.logoUrl ?? ''} onChange={e => setF('logoUrl', e.target.value)} placeholder="https://…" />
                </Field>
              </div>

              {/* Favicon */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)' }}>Favicon</p>
                  <PhotoUpload value={form.faviconUrl ?? ''} onChange={url => setF('faviconUrl', url)} folder="glow-medical/branding" size={64} shape="rect" />
                </div>
                {form.faviconUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', background: 'var(--surface-2)', borderRadius: 10, border: '1.5px solid var(--border)' }}>
                    <img src={form.faviconUrl} alt="favicon 16" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>16px</span>
                    <img src={form.faviconUrl} alt="favicon 32" style={{ width: 32, height: 32, objectFit: 'contain', marginLeft: 'auto' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>32px</span>
                  </div>
                )}
                <Field label="Or enter URL manually">
                  <input className="form-input" value={form.faviconUrl ?? ''} onChange={e => setF('faviconUrl', e.target.value)} placeholder="https://…" />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Clinic Gallery" subtitle="Photos shown in your website gallery. You can upload multiple images at once.">
            <GalleryManager images={localGallery} onAdd={handleGalleryAdd} onRemove={handleGalleryRemove} onAltChange={handleGalleryAltChange} />
          </Section>

        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: SEO
      ══════════════════════════════════════════════════ */}
      {tab === 'seo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <Section title="Search Engine Optimization" subtitle="Control how your clinic appears in Google and other search engines">
            <Field label="Meta Title" hint="Shown in browser tabs and search results. Recommended length: 50–60 characters.">
              <input className="form-input" value={form.metaTitle ?? ''} onChange={e => setF('metaTitle', e.target.value)}
                placeholder="Glow Medical — Premium Aesthetic Clinic in Cairo" maxLength={70} />
              <CharBar value={form.metaTitle?.length ?? 0} max={70} warn={60} />
            </Field>

            <Field label="Meta Description" hint="A short summary shown under your link in search results. Recommended: 150–160 characters.">
              <textarea className="form-textarea" rows={3} value={form.metaDescription ?? ''} onChange={e => setF('metaDescription', e.target.value)}
                placeholder="Discover premium medical aesthetic treatments at Glow Medical. Expert team, advanced technology, and natural-looking results."
                maxLength={170} style={{ resize: 'vertical' }} />
              <CharBar value={form.metaDescription?.length ?? 0} max={170} warn={160} />
            </Field>
          </Section>

          {(form.metaTitle || form.metaDescription) && (
            <Section title="Search Result Preview" subtitle="How your website may appear in Google">
              <div style={{ maxWidth: 620, padding: '1.25rem 1.5rem', background: '#fff', borderRadius: 12, border: '1.5px solid #dadce0', fontFamily: 'Arial, sans-serif' }}>
                {/* Fav + domain row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#4285f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>G</div>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#202124', fontWeight: 500, lineHeight: 1.2 }}>Glow Medical</div>
                    <div style={{ fontSize: '0.72rem', color: '#4d5156', lineHeight: 1.2 }}>https://glowmedical.com</div>
                  </div>
                </div>
                {/* Title */}
                <div style={{ fontSize: '1.15rem', color: '#1a0dab', fontWeight: 400, lineHeight: 1.4, marginBottom: 3 }}>
                  {form.metaTitle || 'Page Title'}
                </div>
                {/* Description */}
                <div style={{ fontSize: '0.84rem', color: '#4d5156', lineHeight: 1.6 }}>
                  {form.metaDescription || 'Page description will appear here…'}
                </div>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Google may adjust the displayed title and description based on search context.
              </p>
            </Section>
          )}

        </div>
      )}

      {/* ── Toast ─────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
