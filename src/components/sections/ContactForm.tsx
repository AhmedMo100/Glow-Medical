'use client'
// components/contact/ContactForm.tsx

import { useState } from 'react'
import {
  Send, User, Mail, Phone, MessageSquare, Tag,
  CheckCircle, AlertCircle, Loader2,
} from 'lucide-react'

const C = {
  navy  : '#082b56',
  gold  : '#c49a6c',
  border: 'var(--border, #e5e7eb)',
  surf  : 'var(--surface, #ffffff)',
  surf2 : 'var(--surface-2, #f9fafb)',
  text  : 'var(--text, #111827)',
  muted : 'var(--text-muted, #6b7280)',
  subtle: 'var(--text-subtle, #9ca3af)',
  danger: '#dc2626',
}

type FormState = { name: string; email: string; phone: string; subject: string; message: string }
const EMPTY: FormState = { name: '', email: '', phone: '', subject: '', message: '' }

function FieldWrap({ label, icon, required, error, hint, children }: {
  label: string; icon?: React.ReactNode; required?: boolean
  error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon && <span style={{ color: C.subtle, display: 'flex' }}>{icon}</span>}
        {label}
        {required && <span style={{ color: C.danger }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ margin: 0, fontSize: '0.73rem', color: C.danger, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={11} style={{ flexShrink: 0 }} />{error}
        </p>
      )}
      {hint && !error && (
        <p style={{ margin: 0, fontSize: '0.72rem', color: C.subtle, lineHeight: 1.5 }}>{hint}</p>
      )}
    </div>
  )
}

function IconInput({ icon, hasError, ...props }: {
  icon: React.ReactNode; hasError?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused ? C.navy : C.subtle, pointerEvents: 'none', display: 'flex', transition: 'color 0.15s' }}>
        {icon}
      </span>
      <input
        className="form-input"
        style={{
          paddingLeft: 36,
          borderColor: hasError ? C.danger : focused ? C.navy : undefined,
          outline    : hasError ? `2px solid ${C.danger}33` : focused ? `2px solid ${C.navy}22` : 'none',
          transition : 'border-color 0.15s, outline 0.15s',
        }}
        onFocus={e  => { setFocused(true);  props.onFocus?.(e)  }}
        onBlur={e   => { setFocused(false); props.onBlur?.(e)   }}
        {...props}
      />
    </div>
  )
}

function CharBar({ value, max }: { value: number; max: number }) {
  const pct   = Math.min(100, (value / max) * 100)
  const color = value > max ? C.danger : value > max * 0.9 ? '#d97706' : '#16a34a'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.2s, background 0.2s' }} />
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color, minWidth: 46, textAlign: 'right' }}>
        {value} / {max}
      </span>
    </div>
  )
}

export default function ContactForm() {
  const [form,       setForm      ] = useState<FormState>(EMPTY)
  const [errors,     setErrors    ] = useState<Partial<FormState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError  ] = useState('')
  const [success,    setSuccess   ] = useState(false)

  const set = (k: keyof FormState, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
    setApiError('')
  }

  const validate = (): boolean => {
    const e: Partial<FormState> = {}
    if (!form.name.trim())    e.name    = 'Full name is required.'
    if (!form.email.trim())   e.email   = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
                              e.email   = 'Please enter a valid email address.'
    if (!form.message.trim()) e.message = 'Message is required.'
    else if (form.message.trim().length < 10)
                              e.message = 'Message must be at least 10 characters.'
    else if (form.message.trim().length > 2000)
                              e.message = 'Message is too long (max 2000 characters).'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true); setApiError('')
    try {
      const res  = await fetch('/api/contact', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          name   : form.name.trim(),
          email  : form.email.trim(),
          phone  : form.phone.trim()   || undefined,
          subject: form.subject.trim() || undefined,
          message: form.message.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setApiError(data.error ?? 'Failed to send message.'); return }
      setSuccess(true); setForm(EMPTY); setErrors({})
    } catch {
      setApiError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', animation: 'fadeUp 0.3s ease' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircle size={42} style={{ color: '#16a34a' }} />
        </div>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: C.navy }}>
          Message Sent Successfully!
        </h3>
        <p style={{ margin: '0 0 1.75rem', color: C.muted, fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 360, marginInline: 'auto' }}>
          Thank you for reaching out. Our team will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          style={{ background: C.navy, color: '#fff', border: 'none', borderRadius: 12, padding: '0.78rem 2rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem', animation: 'fadeUp 0.25s ease' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin   { to   { transform:rotate(360deg) } }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <FieldWrap label="Full Name" icon={<User size={13} />} required error={errors.name}>
          <IconInput icon={<User size={13} />} value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Sara Ahmed" hasError={!!errors.name} maxLength={100} />
        </FieldWrap>
        <FieldWrap label="Email Address" icon={<Mail size={13} />} required error={errors.email}>
          <IconInput icon={<Mail size={13} />} type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="sara@email.com" hasError={!!errors.email} />
        </FieldWrap>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <FieldWrap label="Phone Number" icon={<Phone size={13} />} hint="Optional — for faster follow-up">
          <IconInput icon={<Phone size={13} />} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="01001234567" />
        </FieldWrap>
        <FieldWrap label="Subject" icon={<Tag size={13} />} hint="What is this about?">
          <IconInput icon={<Tag size={13} />} value={form.subject} onChange={e => set('subject', e.target.value)}
            placeholder="Inquiry about services…" maxLength={120} />
        </FieldWrap>
      </div>

      <FieldWrap label="Your Message" icon={<MessageSquare size={13} />} required error={errors.message}>
        <textarea
          className="form-textarea"
          rows={5}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Tell us about your inquiry, treatment of interest, or any questions you have…"
          maxLength={2100}
          style={{ resize: 'vertical', lineHeight: '1.75', borderColor: errors.message ? C.danger : undefined }}
        />
        <CharBar value={form.message.length} max={2000} />
      </FieldWrap>

      {apiError && (
        <div style={{ display: 'flex', gap: 9, padding: '0.85rem 1rem', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, color: C.danger, fontSize: '0.84rem', alignItems: 'flex-start', animation: 'fadeUp 0.2s ease' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{apiError}</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%', padding: '0.95rem', borderRadius: 13, border: 'none',
          background: submitting ? `${C.navy}90` : C.navy, color: '#fff',
          fontSize: '0.92rem', fontWeight: 800, fontFamily: 'inherit',
          cursor: submitting ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        {submitting
          ? <><Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> Sending…</>
          : <><Send size={16} /> Send Message</>
        }
      </button>
    </div>
  )
}
