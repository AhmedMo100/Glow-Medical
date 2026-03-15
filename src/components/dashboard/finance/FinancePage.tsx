'use client'
// components/dashboard/finance/FinancePage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, DollarSign, PiggyBank,
  Filter, Receipt,
} from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

type Transaction = {
  id: number; type: string; category: string
  amount: number; description: string | null; notes: string | null
  receiptUrl: string | null; transactionDate: string
  reference: string | null; appointmentId: number | null; createdAt: string
  appointment?: { id: number; patient?: { fullName: string } | null } | null
}

type Summary = { totalRevenue: number; totalExpenses: number; netProfit: number; refunds: number }
type ChartPoint = { date: string; revenue: number; expenses: number }
type CatBreak = { category: string; amount: number; count: number }

const TX_TYPES = ['REVENUE', 'EXPENSE', 'SALARY', 'REFUND']
const TX_CATEGORIES: Record<string, string[]> = {
  REVENUE : ['APPOINTMENT_PAYMENT', 'PRODUCT_SALE', 'OTHER_INCOME'],
  EXPENSE : ['SUPPLIES', 'EQUIPMENT', 'UTILITIES', 'RENT', 'MARKETING'],
  SALARY  : ['STAFF_SALARY', 'BONUS'],
  REFUND  : ['PATIENT_REFUND'],
}
const ALL_CATS = Object.values(TX_CATEGORIES).flat()

const TYPE_COLOR: Record<string, string> = {
  REVENUE: 'var(--success)', EXPENSE: 'var(--danger)', SALARY: '#7c3aed', REFUND: '#d97706',
}
const PIE_COLORS = ['#082b56', '#c49a6c', '#059669', '#dc2626', '#7c3aed', '#d97706', '#2563eb', '#be185d', '#0891b2', '#65a30d', '#ea580c']

const EMPTY_FORM = { type: 'REVENUE', category: 'APPOINTMENT_PAYMENT', amount: '', description: '', notes: '', receiptUrl: '', transactionDate: new Date().toISOString().slice(0, 10), reference: '' }

function fmt(n: number) { return `EGP ${n.toLocaleString('en-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` }

/* ── Transaction Form Modal ──────────────────────────────── */
function TransactionFormModal({ tx, onClose, onSave }: { tx: Transaction | null; onClose: () => void; onSave: () => void }) {
  const [form,   setForm]   = useState(tx ? { type: tx.type, category: tx.category, amount: String(tx.amount), description: tx.description ?? '', notes: tx.notes ?? '', receiptUrl: tx.receiptUrl ?? '', transactionDate: tx.transactionDate.slice(0, 10), reference: tx.reference ?? '' } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  // Auto-set category when type changes
  const onTypeChange = (t: string) => { set('type', t); set('category', TX_CATEGORIES[t]?.[0] ?? '') }

  const submit = async () => {
    if (!form.amount || Number(form.amount) <= 0) { setError('Amount required.'); return }
    setSaving(true); setError('')
    try {
      const url    = tx ? `/api/dashboard/finance/${tx.id}` : '/api/dashboard/finance'
      const method = tx ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: Number(form.amount) }) })
      const data   = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave()
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-md">
        <div className="modal-header"><h2 className="modal-title">{tx ? 'Edit Transaction' : 'New Transaction'}</h2><button className="btn-icon" onClick={onClose}><X size={16} /></button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && <div style={{ display: 'flex', gap: 8, padding: '0.6rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {TX_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => onTypeChange(t)}
                    style={{ padding: '4px 10px', borderRadius: 20, border: `2px solid ${form.type === t ? TYPE_COLOR[t] : 'var(--border)'}`, background: form.type === t ? `${TYPE_COLOR[t]}15` : 'transparent', color: form.type === t ? TYPE_COLOR[t] : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit' }}>{t}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {(TX_CATEGORIES[form.type] ?? ALL_CATS).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row form-row-2">
            <div className="form-group"><label className="form-label">Amount (EGP) *</label><input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" /></div>
            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.transactionDate} onChange={e => set('transactionDate', e.target.value)} /></div>
          </div>

          <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Laser session payment — Patient: Ahmed" /></div>
          <div className="form-group"><label className="form-label">Reference</label><input className="form-input" value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="Invoice # or receipt #" /></div>
          <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Receipt URL</label><input className="form-input" value={form.receiptUrl} onChange={e => set('receiptUrl', e.target.value)} placeholder="https://…" /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}{tx ? 'Save' : 'Add Transaction'}</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary,      setSummary]      = useState<Summary>({ totalRevenue: 0, totalExpenses: 0, netProfit: 0, refunds: 0 })
  const [chart,        setChart]        = useState<ChartPoint[]>([])
  const [catBreakdown, setCatBreakdown] = useState<CatBreak[]>([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [pages,        setPages]        = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [typeFilter,   setTypeFilter]   = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [modal,        setModal]        = useState(false)
  const [selected,     setSelected]     = useState<Transaction | null>(null)
  const [delId,        setDelId]        = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '20' })
      if (search)    p.set('search',   search)
      if (typeFilter)p.set('type',     typeFilter)
      if (dateFrom)  p.set('dateFrom', dateFrom)
      if (dateTo)    p.set('dateTo',   dateTo)
      const res  = await fetch(`/api/dashboard/finance?${p}`)
      const data = await res.json()
      setTransactions(data.transactions  ?? [])
      setTotal(data.total                ?? 0)
      setPages(data.pages                ?? 1)
      setSummary(data.summary            ?? { totalRevenue: 0, totalExpenses: 0, netProfit: 0, refunds: 0 })
      setChart(data.chart                ?? [])
      setCatBreakdown(data.categoryBreakdown ?? [])
    } catch {} finally { setLoading(false) }
  }, [page, search, typeFilter, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  const doDelete = async () => {
    if (!delId) return
    await fetch(`/api/dashboard/finance/${delId}`, { method: 'DELETE' })
    setDelId(null); load()
  }

  const profitPositive = summary.netProfit >= 0

  return (
    <div className="dash-page">
      <div className="page-header">
        <div><h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={20} /> Finance</h1><p className="page-subtitle">{total} transactions</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}><Plus size={15} /> New Transaction</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Total Revenue',  value: summary.totalRevenue,  icon: TrendingUp,   color: 'var(--success)' },
          { label: 'Total Expenses', value: summary.totalExpenses, icon: TrendingDown,  color: 'var(--danger)'  },
          { label: 'Net Profit',     value: summary.netProfit,     icon: PiggyBank,     color: profitPositive ? 'var(--success)' : 'var(--danger)' },
          { label: 'Refunds',        value: summary.refunds,       icon: Receipt,       color: '#d97706'         },
        ].map(c => (
          <div key={c.label} className="dash-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                <c.icon size={16} />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c.color }}>{fmt(c.value)}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chart.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* Revenue vs Expenses line */}
          <div className="dash-card" style={{ padding: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.88rem', fontWeight: 700 }}>30-Day Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                <Legend />
                <Bar  dataKey="revenue"  fill="#059669" opacity={0.8} name="Revenue"  radius={[3,3,0,0]} />
                <Bar  dataKey="expenses" fill="#dc2626" opacity={0.8} name="Expenses" radius={[3,3,0,0]} />
                <Line dataKey="revenue"  stroke="#059669" dot={false} strokeWidth={2} name=" " />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown pie */}
          <div className="dash-card" style={{ padding: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.88rem', fontWeight: 700 }}>By Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={75} label={({ category }) => category.replace(/_/g, ' ')}>
                  {catBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 180px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={!typeFilter ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => setTypeFilter('')}>All</button>
            {TX_TYPES.map(t => (
              <button key={t} className={typeFilter === t ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => { setTypeFilter(t); setPage(1) }}
                style={{ color: typeFilter === t ? '#fff' : TYPE_COLOR[t] }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input className="form-input" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} style={{ width: 140 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
            <input className="form-input" type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value);   setPage(1) }} style={{ width: 140 }} />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="dash-card">
          {transactions.length === 0 ? (
            <div className="empty-state"><DollarSign size={32} className="empty-state-icon" /><p className="empty-state-title">No transactions found</p><button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}><Plus size={13} /> Add Transaction</button></div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Reference</th><th style={{ textAlign: 'right' }}>Amount</th><th></th></tr></thead>
                <tbody>
                  {transactions.map(tx => {
                    const isExpense = tx.type !== 'REVENUE'
                    return (
                      <tr key={tx.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(tx.transactionDate).toLocaleDateString('ar-EG')}</td>
                        <td><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: `${TYPE_COLOR[tx.type]}15`, color: TYPE_COLOR[tx.type] }}>{tx.type}</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.category.replace(/_/g, ' ')}</td>
                        <td style={{ maxWidth: 200 }}>
                          <div style={{ fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || '—'}</div>
                          {tx.appointment?.patient && <div style={{ fontSize: '0.73rem', color: 'var(--primary)' }}>{tx.appointment.patient.fullName}</div>}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{tx.reference || '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.92rem', color: isExpense ? 'var(--danger)' : 'var(--success)', whiteSpace: 'nowrap' }}>
                          {isExpense ? '−' : '+'}{fmt(Number(tx.amount))}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn-icon" onClick={() => { setSelected(tx); setModal(true) }}><Edit2 size={13} /></button>
                            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDelId(tx.id)}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1}     onClick={() => setPage(p => p - 1)}><ChevronLeft  size={14} /></button>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
        </div>
      )}

      {modal && <TransactionFormModal tx={selected} onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}

      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header"><h2 className="modal-title">Delete Transaction</h2><button className="btn-icon" onClick={() => setDelId(null)}><X size={16} /></button></div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <p style={{ fontWeight: 600 }}>Delete this transaction?</p>
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
