'use client'
// components/dashboard/whatsapp/WhatsAppPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Send, MessageCircle, Clock, ToggleLeft, ToggleRight,
  History, Settings, Zap, ChevronLeft, ChevronRight,
  Phone, User, Hash,
} from 'lucide-react'

type Template = {
  id: number; name: string; type: string; bodyAr: string; bodyEn: string
  variables: string[]; isActive: boolean; sendBefore: number | null
  createdAt: string; _count: { logs: number }
}

type Log = {
  id: number; toPhone: string; toName: string | null; body: string
  status: string; twilioSid: string | null; errorMessage: string | null
  appointmentId: number | null; sentAt: string
  template?: { name: string; type: string } | null
}

const TEMPLATE_TYPES = [
  'APPOINTMENT_REMINDER','APPOINTMENT_CONFIRMATION','APPOINTMENT_CANCELLATION',
  'APPOINTMENT_FOLLOWUP','PAYMENT_REMINDER','BIRTHDAY_GREETING','PROMOTIONAL','CUSTOM',
]

const LOG_STATUS_COLOR: Record<string, string> = {
  SENT: 'var(--success)', DELIVERED: '#2563eb', FAILED: 'var(--danger)', PENDING: '#d97706',
}
const LOG_STATUS_BG: Record<string, string> = {
  SENT: '#f0fdf4', DELIVERED: '#eff6ff', FAILED: '#fef2f2', PENDING: '#fffbeb',
}

const DEFAULT_TEMPLATES: Partial<Record<string, { ar: string; en: string }>> = {
  APPOINTMENT_REMINDER: {
    ar: 'مرحبًا {{name}} 😊\nنُذكّرك بموعدك في *Glow Medical* غدًا\n📅 {{date}}\n⏰ {{time}}\n💆‍♀️ {{service}}\n👩‍⚕️ {{doctor}}\n\nللاستفسار أو التعديل، تواصل معنا 💬',
    en: 'Hello {{name}} 😊\nThis is a reminder of your appointment at *Glow Medical*\n📅 {{date}}\n⏰ {{time}}\n💆‍♀️ {{service}}\n👩‍⚕️ {{doctor}}\n\nTo reschedule, please contact us.',
  },
  APPOINTMENT_CONFIRMATION: {
    ar: 'تم تأكيد موعدك ✅\nمرحبًا {{name}}\nموعدك مع *Glow Medical* مؤكد:\n📅 {{date}} - ⏰ {{time}}\nنتطلع لرؤيتك 🌟',
    en: 'Appointment Confirmed ✅\nHi {{name}}, your appointment at *Glow Medical* is confirmed:\n📅 {{date}} - ⏰ {{time}}\nWe look forward to seeing you!',
  },
}

/* ── Template Form Modal ─────────────────────────────────── */
function TemplateFormModal({ template, onClose, onSave }: {
  template: Template | null; onClose: () => void; onSave: () => void
}) {
  const [form, setForm] = useState({
    name      : template?.name        ?? '',
    type      : template?.type        ?? 'APPOINTMENT_REMINDER',
    bodyAr    : template?.bodyAr      ?? '',
    bodyEn    : template?.bodyEn      ?? '',
    variables : template?.variables?.join(', ') ?? 'name, date, time, service, doctor',
    isActive  : template?.isActive    ?? true,
    sendBefore: template?.sendBefore  ? String(template.sendBefore) : '',
  })
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [preview, setPreview] = useState({ name: 'نور', date: '١ يناير ٢٠٢٥', time: '٢:٠٠ م', service: 'ليزر', doctor: 'د. سارة' })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const onTypeChange = (t: string) => {
    set('type', t)
    const def = DEFAULT_TEMPLATES[t]
    if (def && !form.bodyAr) { set('bodyAr', def.ar); set('bodyEn', def.en) }
  }

  const previewBody = (body: string) => body
    .replace('{{name}}',    preview.name)
    .replace('{{date}}',    preview.date)
    .replace('{{time}}',    preview.time)
    .replace('{{service}}', preview.service)
    .replace('{{doctor}}',  preview.doctor)

  const submit = async () => {
    if (!form.name || !form.bodyAr || !form.bodyEn) {
      setError('Name, Arabic body, and English body are required.')
      return
    }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        variables : form.variables.split(',').map(v => v.trim()).filter(Boolean),
        sendBefore: form.sendBefore ? Number(form.sendBefore) : null,
      }
      const url    = template ? `/api/dashboard/whatsapp/${template.id}` : '/api/dashboard/whatsapp'
      const method = template ? 'PATCH' : 'POST'
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
          <h2 className="modal-title">{template ? 'Edit Template' : 'New Template'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          {/* Left: form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ display: 'flex', gap: 8, padding: '0.65rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 10, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}>
                <AlertCircle size={14} />{error}
              </div>
            )}

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Template Name *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Appointment Reminder 2h" />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-select" value={form.type} onChange={e => onTypeChange(e.target.value)}>
                  {TEMPLATE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Arabic Body (للعربية) *
              </label>
              <textarea
                className="form-textarea" rows={6}
                value={form.bodyAr} onChange={e => set('bodyAr', e.target.value)}
                placeholder="مرحبًا {{name}}…"
                style={{ direction: 'rtl', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">English Body *</label>
              <textarea
                className="form-textarea" rows={6}
                value={form.bodyEn} onChange={e => set('bodyEn', e.target.value)}
                placeholder="Hello {{name}}…"
              />
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Variables (comma-separated)</label>
                <input className="form-input" value={form.variables} onChange={e => set('variables', e.target.value)} placeholder="name, date, time, service" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> Send Before Appointment (mins)
                </label>
                <input
                  className="form-input" type="number" min="0"
                  value={form.sendBefore} onChange={e => set('sendBefore', e.target.value)}
                  placeholder="120 = 2h before" />
              </div>
            </div>

            <label className="toggle">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
              <span className="toggle-track"><span className="toggle-thumb" /></span>
              <span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Active</span>
            </label>
          </div>

          {/* Right: preview */}
          <div>
            <div style={{ background: '#075e54', borderRadius: 14, padding: '1rem', position: 'sticky', top: 0 }}>
              <p style={{ margin: '0 0 0.85rem', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                WhatsApp Preview
              </p>
              <div style={{ background: '#dcf8c6', borderRadius: 12, padding: '0.85rem', fontSize: '0.82rem', lineHeight: 1.75, whiteSpace: 'pre-wrap', color: '#111', minHeight: 80 }}>
                {previewBody(form.bodyAr) || <span style={{ color: '#888' }}>Start typing…</span>}
              </div>

              <div style={{ marginTop: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.71rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Preview Variables
                </p>
                {(['name','date','time','service','doctor'] as const).map(k => (
                  <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', width: 56, flexShrink: 0, fontFamily: 'monospace' }}>
                      {'{{'}{k}{'}}'}
                    </span>
                    <input
                      style={{ flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '3px 8px', fontSize: '0.75rem', color: '#fff', outline: 'none', fontFamily: 'inherit' }}
                      value={(preview as any)[k] ?? ''}
                      onChange={e => setPreview(p => ({ ...p, [k]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Manual Send Modal ───────────────────────────────────── */
function SendModal({ templates, onClose }: { templates: Template[]; onClose: () => void }) {
  const [form,    setForm]    = useState({ toPhone: '', toName: '', templateId: '', language: 'ar', customBody: '' })
  const [varVals, setVarVals] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [result,  setResult]  = useState<{ success: boolean; msg: string } | null>(null)
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const selectedTemplate = templates.find(t => String(t.id) === form.templateId)
  const vars = selectedTemplate?.variables ?? []

  const send = async () => {
    if (!form.toPhone) return
    setSending(true); setResult(null)
    try {
      const res  = await fetch('/api/dashboard/whatsapp/send', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          ...form,
          templateId: form.templateId ? Number(form.templateId) : null,
          variables : { ...varVals, name: form.toName || varVals.name },
        }),
      })
      const data = await res.json()
      setResult({ success: res.ok, msg: res.ok ? `Sent! SID: ${data.twilioSid}` : (data.error ?? 'Failed') })
    } catch { setResult({ success: false, msg: 'Network error' }) }
    finally { setSending(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-md">
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Send size={15} /> Send WhatsApp Message
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {result && (
            <div style={{ display: 'flex', gap: 8, padding: '0.75rem 0.9rem', background: result.success ? 'var(--success-bg)' : 'var(--danger-bg)', borderRadius: 10, color: result.success ? 'var(--success)' : 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}>
              {result.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {result.msg}
            </div>
          )}

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={12} /> Phone * <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>(e.g. 01001234567)</span>
              </label>
              <input className="form-input" value={form.toPhone} onChange={e => set('toPhone', e.target.value)} placeholder="01001234567" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={12} /> Name
              </label>
              <input className="form-input" value={form.toName} onChange={e => set('toName', e.target.value)} placeholder="Patient name" />
            </div>
          </div>

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Template</label>
              <select className="form-select" value={form.templateId} onChange={e => set('templateId', e.target.value)}>
                <option value="">Custom message</option>
                {templates.filter(t => t.isActive).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[{ v: 'ar', l: '🇸🇦 عربي' }, { v: 'en', l: '🇺🇸 English' }].map(l => (
                  <button key={l.v}
                    className={form.language === l.v ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    onClick={() => set('language', l.v)}
                    style={{ flex: 1, justifyContent: 'center' }}>
                    {l.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {vars.length > 0 && (
            <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
              <p style={{ margin: '0 0 0.65rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Hash size={12} /> Template Variables
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {vars.map(v => (
                  <div key={v} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {'{{' + v + '}}'}
                    </label>
                    <input className="form-input" value={varVals[v] ?? ''} onChange={e => setVarVals(p => ({ ...p, [v]: e.target.value }))} placeholder={v} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!form.templateId && (
            <div className="form-group">
              <label className="form-label">Custom Message</label>
              <textarea
                className="form-textarea" rows={4}
                value={form.customBody} onChange={e => set('customBody', e.target.value)}
                placeholder="Type your message here…"
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={send} disabled={sending || !form.toPhone}>
            {sending ? <span className="spinner spinner-sm" /> : <Send size={14} />} Send
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function WhatsAppPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [logs,      setLogs]      = useState<Log[]>([])
  const [logCounts, setLogCounts] = useState({ sent: 0, delivered: 0, failed: 0, pending: 0 })
  const [logTotal,  setLogTotal]  = useState(0)
  const [logPage,   setLogPage]   = useState(1)
  const [logPages,  setLogPages]  = useState(1)
  const [view,      setView]      = useState<'templates' | 'logs'>('templates')
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [sendModal, setSendModal] = useState(false)
  const [selected,  setSelected]  = useState<Template | null>(null)
  const [delId,     setDelId]     = useState<number | null>(null)

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/dashboard/whatsapp')
      const data = await res.json()
      setTemplates(data.templates ?? [])
    } catch {} finally { setLoading(false) }
  }

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/dashboard/whatsapp?view=logs&page=${logPage}&limit=20`)
      const data = await res.json()
      setLogs(data.logs        ?? [])
      setLogTotal(data.total   ?? 0)
      setLogPages(data.pages   ?? 1)
      setLogCounts(data.counts ?? { sent: 0, delivered: 0, failed: 0, pending: 0 })
    } catch {} finally { setLoading(false) }
  }, [logPage])

  useEffect(() => {
    if (view === 'templates') loadTemplates()
    else loadLogs()
  }, [view, logPage])

  const toggleActive = async (t: Template) => {
    await fetch(`/api/dashboard/whatsapp/${t.id}`, {
      method : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ isActive: !t.isActive }),
    })
    loadTemplates()
  }

  const doDelete = async () => {
    if (!delId) return
    await fetch(`/api/dashboard/whatsapp/${delId}`, { method: 'DELETE' })
    setDelId(null); loadTemplates()
  }

  const triggerCron = async () => {
    const res  = await fetch('/api/dashboard/whatsapp/cron?secret=glow-cron-secret-2025')
    const data = await res.json()
    alert(`Cron result: ${data.message ?? JSON.stringify(data)}`)
  }

  const totalSent = logCounts.sent + logCounts.delivered

  return (
    <div className="dash-page">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#25d36620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={17} style={{ color: '#25d366' }} />
            </div>
            WhatsApp
          </h1>
          <p className="page-subtitle">{templates.length} templates · {logTotal} messages sent</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={triggerCron} title="Manually trigger auto-reminders">
            <Zap size={14} style={{ color: '#f59e0b' }} /> Run Reminders
          </button>
          <button className="btn btn-secondary" onClick={() => setSendModal(true)}>
            <Send size={14} /> Send Message
          </button>
          <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}>
            <Plus size={15} /> New Template
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Templates',  value: templates.length,    color: '#25d366', bg: '#f0fdf4' },
          { label: 'Sent',       value: logCounts.sent,      color: '#2563eb', bg: '#eff6ff' },
          { label: 'Delivered',  value: logCounts.delivered, color: '#059669', bg: '#ecfdf5' },
          { label: 'Failed',     value: logCounts.failed,    color: '#dc2626', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} className="dash-card" style={{ padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Auto-reminder banner ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.85rem 1rem', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, marginBottom: '1.25rem', fontSize: '0.82rem', color: '#166534' }}>
        <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Auto-Reminder System:</strong> Set up a cron job to call{' '}
          <code style={{ background: '#dcfce7', padding: '1px 6px', borderRadius: 4, fontSize: '0.78rem' }}>
            GET /api/dashboard/whatsapp/cron?secret=glow-cron-secret-2025
          </code>{' '}
          every 15 minutes. The <strong>APPOINTMENT_REMINDER</strong> template with <strong>sendBefore=120</strong> will auto-send 2h before appointments.
        </div>
      </div>

      {/* ── View tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', background: 'var(--surface-2)', borderRadius: 10, padding: 3, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { v: 'templates', l: 'Templates',  i: Settings },
          { v: 'logs',      l: 'Send Logs',  i: History  },
        ].map(tab => (
          <button key={tab.v}
            onClick={() => { setView(tab.v as any); setLogPage(1) }}
            style={{
              padding: '0.48rem 1.15rem', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.83rem', fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 5,
              background: view === tab.v ? 'var(--surface)' : 'transparent',
              color    : view === tab.v ? 'var(--primary)'  : 'var(--text-muted)',
              boxShadow: view === tab.v ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}>
            <tab.i size={13} />{tab.l}
            {tab.v === 'logs' && logCounts.failed > 0 && (
              <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: 20, padding: '0 6px', fontSize: '0.68rem' }}>
                {logCounts.failed} failed
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : view === 'templates' ? (
        templates.length === 0 ? (
          <div className="dash-card">
            <div className="empty-state">
              <MessageCircle size={32} className="empty-state-icon" />
              <p className="empty-state-title">No templates yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}>
                <Plus size={13} /> Create Template
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {templates.map(t => (
              <div key={t.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: 0, overflow: 'hidden', opacity: t.isActive ? 1 : 0.72 }}>

                {/* Card header */}
                <div style={{ padding: '1rem 1.1rem 0.75rem', display: 'flex', alignItems: 'flex-start', gap: 10, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: '#25d36612', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageCircle size={19} style={{ color: '#25d366' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.type.replace(/_/g, ' ')}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                    {t.sendBefore && (
                      <span style={{ padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={9} /> Auto {t.sendBefore}m
                      </span>
                    )}
                    <button onClick={() => toggleActive(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.isActive ? 'var(--success)' : 'var(--text-subtle)', padding: 0 }}>
                      {t.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </div>
                </div>

                {/* Body preview */}
                <div style={{ padding: '0.85rem 1.1rem', background: '#f8fafc', flex: 1 }}>
                  <div style={{ background: '#dcf8c6', borderRadius: 10, padding: '0.65rem 0.85rem', fontSize: '0.78rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 110, overflow: 'hidden', color: '#111', borderBottomRightRadius: 3 }}>
                    {t.bodyAr}
                  </div>
                </div>

                {/* Variables */}
                {t.variables.length > 0 && (
                  <div style={{ padding: '0.6rem 1.1rem', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {t.variables.map(v => (
                      <span key={v} style={{ padding: '2px 7px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.67rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {'{{' + v + '}}'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div style={{ padding: '0.7rem 1.1rem', display: 'flex', gap: 6, borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                  <span style={{ flex: 1, fontSize: '0.74rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Send size={11} /> {t._count.logs} sent
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(t); setModal(true) }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDelId(t.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ── Logs ── */
        <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 8, padding: '0.9rem 1.1rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>Status:</span>
            {([['sent','Sent','#059669'],['delivered','Delivered','#2563eb'],['failed','Failed','#dc2626'],['pending','Pending','#d97706']] as const).map(([k, l, c]) => (
              <span key={k} style={{ padding: '3px 10px', background: LOG_STATUS_BG[k.toUpperCase()] ?? '#f9fafb', color: c, borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                {l}: {(logCounts as any)[k]}
              </span>
            ))}
          </div>

          {logs.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <History size={28} className="empty-state-icon" />
              <p className="empty-state-title">No messages sent yet</p>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Recipient</th>
                    <th>Template</th>
                    <th>Message</th>
                    <th>Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: LOG_STATUS_BG[log.status] ?? '#f9fafb', color: LOG_STATUS_COLOR[log.status] ?? 'var(--text-muted)' }}>
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.toName ?? log.toPhone}</div>
                        {log.toName && (
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.toPhone}</div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.template?.name ?? 'Custom'}</span>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {log.body}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.sentAt).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {logPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9rem', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary btn-sm" disabled={logPage <= 1}       onClick={() => setLogPage(p => p - 1)}><ChevronLeft  size={14} /></button>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page {logPage} of {logPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={logPage >= logPages} onClick={() => setLogPage(p => p + 1)}><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {modal     && <TemplateFormModal template={selected} onClose={() => setModal(false)}     onSave={() => { setModal(false); loadTemplates() }} />}
      {sendModal && <SendModal         templates={templates} onClose={() => setSendModal(false)} />}

      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header">
              <h2 className="modal-title">Delete Template</h2>
              <button className="btn-icon" onClick={() => setDelId(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}>
                <Trash2 size={22} />
              </div>
              <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Delete this template?</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>This action cannot be undone.</p>
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
