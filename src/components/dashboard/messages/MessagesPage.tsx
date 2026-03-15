'use client'
// components/dashboard/messages/MessagesPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Mail, MailOpen, Archive, Reply, Trash2, X,
  Search, ChevronLeft, ChevronRight, Phone, AtSign,
  MessageCircle, CheckCircle, AlertCircle, Send, Clock,
} from 'lucide-react'

type Message = {
  id: number; name: string; email: string; phone: string | null
  subject: string | null; message: string; status: string
  replyText: string | null; repliedAt: string | null
  ipAddress: string | null; createdAt: string; updatedAt: string
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  UNREAD  : { label: 'Unread',   color: 'var(--primary)',  icon: Mail       },
  READ    : { label: 'Read',     color: 'var(--text-muted)', icon: MailOpen  },
  ARCHIVED: { label: 'Archived', color: 'var(--text-subtle)', icon: Archive  },
  REPLIED : { label: 'Replied',  color: 'var(--success)',   icon: Reply      },
}

/* ── Message Detail Modal ────────────────────────────────── */
function MessageDetailModal({ msg, onClose, onUpdate }: { msg: Message; onClose: () => void; onUpdate: () => void }) {
  const [reply,    setReply]    = useState(msg.replyText ?? '')
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState('')
  const [archived, setArchived] = useState(msg.status === 'ARCHIVED')

  // Mark as read on open
  useEffect(() => {
    if (msg.status === 'UNREAD') {
      fetch(`/api/dashboard/messages/${msg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'READ' }) })
        .then(() => onUpdate())
    }
  }, [msg.id, msg.status, onUpdate])

  const sendReply = async () => {
    if (!reply.trim()) return
    setSending(true); setError('')
    try {
      const res  = await fetch(`/api/dashboard/messages/${msg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ replyText: reply }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onUpdate(); onClose()
    } catch { setError('Network error') }
    finally { setSending(false) }
  }

  const archive = async () => {
    await fetch(`/api/dashboard/messages/${msg.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ARCHIVED' }) })
    setArchived(true); onUpdate()
  }

  const StatusInfo = STATUS_LABELS[msg.status]

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={16} style={{ color: 'var(--primary)' }} />
            <h2 className="modal-title">{msg.subject || 'No Subject'}</h2>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {!archived && <button className="btn btn-secondary btn-sm" onClick={archive}><Archive size={13} /> Archive</button>}
            <button className="btn-icon" onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Sender info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--surface-2)', borderRadius: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem' }}>{msg.name}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              <AtSign size={13} />
              <a href={`mailto:${msg.email}`} style={{ color: 'var(--primary)' }}>{msg.email}</a>
            </div>
            {msg.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                <Phone size={13} />
                <a href={`tel:${msg.phone}`} style={{ color: 'var(--primary)' }}>{msg.phone}</a>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-subtle)', marginLeft: 'auto' }}>
              <Clock size={11} />
              {new Date(msg.createdAt).toLocaleString('ar-EG')}
            </div>
          </div>

          {/* Message */}
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
            <p style={{ margin: 0, lineHeight: 1.75, whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>{msg.message}</p>
          </div>

          {/* Previous reply */}
          {msg.replyText && (
            <div style={{ background: 'var(--success-bg)', border: '1.5px solid var(--success)30', borderRadius: 12, padding: '1rem' }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Reply size={12} /> Previous Reply · {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString('ar-EG') : ''}
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{msg.replyText}</p>
            </div>
          )}

          {error && <div style={{ display: 'flex', gap: 8, padding: '0.6rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}

          {/* Reply editor */}
          <div className="form-group">
            <label className="form-label"><Reply size={12} style={{ verticalAlign: 'middle' }} /> Reply</label>
            <textarea className="form-textarea" rows={4} value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply here…" />
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Note: Replies are saved in the system. To send by email, copy and send manually.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={sendReply} disabled={sending || !reply.trim()}>
            {sending ? <span className="spinner spinner-sm" /> : <Send size={14} />}
            Save Reply
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [counts,   setCounts]   = useState({ unread: 0, archived: 0, replied: 0, all: 0 })
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [selected, setSelected] = useState<Message | null>(null)
  const [delId,    setDelId]    = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) p.set('search', search)
      if (status) p.set('status', status)
      const res  = await fetch(`/api/dashboard/messages?${p}`)
      const data = await res.json()
      setMessages(data.messages ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
      setCounts(data.counts ?? { unread: 0, archived: 0, replied: 0, all: 0 })
    } catch {} finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  const doDelete = async () => {
    if (!delId) return
    await fetch(`/api/dashboard/messages/${delId}`, { method: 'DELETE' })
    setDelId(null); load()
  }

  const STATUS_TABS = [
    { value: '',         label: 'All',      count: counts.all      },
    { value: 'UNREAD',   label: 'Unread',   count: counts.unread   },
    { value: 'REPLIED',  label: 'Replied',  count: counts.replied  },
    { value: 'ARCHIVED', label: 'Archived', count: counts.archived },
  ]

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={20} /> Contact Messages
          </h1>
          <p className="page-subtitle">{counts.unread > 0 && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{counts.unread} unread · </span>}{total} total messages</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {STATUS_TABS.map(tab => (
              <button key={tab.value} onClick={() => { setStatus(tab.value); setPage(1) }}
                className={status === tab.value ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                style={{ gap: 5 }}>
                {tab.label}
                {tab.count > 0 && <span style={{ background: status === tab.value ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)', borderRadius: 20, padding: '0 6px', fontSize: '0.72rem' }}>{tab.count}</span>}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search messages…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
      ) : messages.length === 0 ? (
        <div className="dash-card"><div className="empty-state"><Mail size={32} className="empty-state-icon" /><p className="empty-state-title">No messages found</p></div></div>
      ) : (
        <div className="dash-card">
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr><th>Status</th><th>Sender</th><th>Subject</th><th>Message</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {messages.map(m => {
                  const si = STATUS_LABELS[m.status]
                  const isUnread = m.status === 'UNREAD'
                  return (
                    <tr key={m.id} style={{ cursor: 'pointer', fontWeight: isUnread ? 700 : 400 }} onClick={() => setSelected(m)}>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: `${si.color}15`, color: si.color, display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                          <si.icon size={10} />{si.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{m.email}</div>
                        {m.phone && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{m.phone}</div>}
                      </td>
                      <td style={{ maxWidth: 160 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{m.subject || '—'}</span></td>
                      <td style={{ maxWidth: 260 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{m.message}</span></td>
                      <td><span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(m.createdAt).toLocaleDateString('ar-EG')}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" onClick={() => setSelected(m)}><MailOpen size={13} /></button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDelId(m.id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1}     onClick={() => setPage(p => p - 1)}><ChevronLeft  size={14} /></button>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
        </div>
      )}

      {selected && <MessageDetailModal msg={selected} onClose={() => { setSelected(null); load() }} onUpdate={load} />}

      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header"><h2 className="modal-title">Delete Message</h2><button className="btn-icon" onClick={() => setDelId(null)}><X size={16} /></button></div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <p style={{ fontWeight: 600 }}>Delete this message?</p>
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
