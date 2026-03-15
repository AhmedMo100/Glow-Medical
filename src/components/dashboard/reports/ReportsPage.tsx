'use client'
// components/dashboard/reports/ReportsPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  TrendingUp, TrendingDown, DollarSign, Users, Calendar,
  CheckCircle2, XCircle, BarChart2, PieChart as PieIcon,
  Printer, Download, RefreshCw, Bookmark, ChevronLeft,
  ChevronRight, AlertTriangle, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'

/* ── Types ────────────────────────────────────────────────── */
type KPI = { value: number; prev?: number; change?: number }
type ReportData = {
  period     : string
  start      : string
  end        : string
  generatedAt: string
  kpis: {
    totalAppointments: KPI; completedAppts: KPI; cancelledAppts: KPI; paidAppts: KPI
    revenue: KPI; expenses: KPI; netProfit: KPI; newPatients: KPI
    completionRate: KPI; cancellationRate: KPI; collectionRate: KPI
  }
  revenueChart     : { label: string; revenue: number; expenses: number }[]
  statusBreakdown  : { status: string; count: number }[]
  sourceBreakdown  : { source: string; count: number }[]
  paymentBreakdown : { status: string; count: number }[]
  topServices      : { name: string; count: number }[]
  staffPerformance : { name: string; type: string; count: number }[]
  expenseCategories: { category: string; amount: number }[]
  recentTransactions: any[]
  savedReports      : { id: number; name: string; period: string; createdAt: string }[]
}

/* ── palette ─────────────────────────────────────────────── */
const C = {
  primary  : '#082b56',
  accent   : '#c49a6c',
  success  : '#059669',
  danger   : '#dc2626',
  warning  : '#d97706',
  info     : '#2563eb',
  purple   : '#a855f7',
}
const PIES = [C.primary, C.accent, C.info, C.success, C.warning, C.danger, C.purple, '#6b7280']

const STATUS_C: Record<string, string> = {
  PENDING: C.warning, CONFIRMED: C.info, IN_PROGRESS: C.purple,
  COMPLETED: C.success, CANCELLED: C.danger, NO_SHOW: '#6b7280',
}
const PAY_C: Record<string, string> = {
  UNPAID: C.danger, PARTIAL: C.warning, PAID: C.success, REFUNDED: C.info,
}

/* ── KPI Box ─────────────────────────────────────────────── */
function KpiBox({ label, value, change, prefix = '', suffix = '', color, icon: Icon, size = 'md' }: {
  label: string; value: number; change?: number; prefix?: string; suffix?: string
  color: string; icon: any; size?: 'sm' | 'md'
}) {
  const dir = (change ?? 0) > 0 ? 'up' : (change ?? 0) < 0 ? 'down' : 'flat'
  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
          <Icon size={15} />
        </div>
      </div>
      <div style={{ fontSize: size === 'sm' ? '1.4rem' : '1.75rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-EG') : value}{suffix}
      </div>
      {change !== undefined && change !== 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className={`kpi-change ${dir}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: dir === 'up' ? 'var(--success-bg)' : 'var(--danger-bg)', color: dir === 'up' ? 'var(--success)' : 'var(--danger)' }}>
            {dir === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(change)}%
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>vs prev</span>
        </div>
      )}
    </div>
  )
}

/* ── Section heading ─────────────────────────────────────── */
const SectionHeading = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
    <Icon size={16} color={C.accent} />
    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
  </div>
)

/* ── Custom tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '0.65rem 0.9rem', fontSize: '0.8rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--text)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ margin: '2px 0', color: p.color }}>{p.name}: {p.dataKey.includes('revenue') || p.dataKey.includes('expenses') || p.dataKey.includes('amount') ? `EGP ${Number(p.value).toLocaleString()}` : p.value}</p>
      ))}
    </div>
  )
}

/* ── Period Selector ─────────────────────────────────────── */
function PeriodSelector({ period, year, month, onChange }: {
  period: string; year: number; month: number
  onChange: (p: string, y: number, m: number) => void
}) {
  const now = new Date()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      {(['today','month','year'] as const).map(p => (
        <button
          key={p}
          onClick={() => onChange(p, year, month)}
          className={period === p ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}

      {period === 'month' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            const d = new Date(year, month - 2)
            onChange('month', d.getFullYear(), d.getMonth() + 1)
          }}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, minWidth: 90, textAlign: 'center' }}>{months[month - 1]} {year}</span>
          <button className="btn btn-secondary btn-sm" disabled={year === now.getFullYear() && month === now.getMonth() + 1} onClick={() => {
            const d = new Date(year, month)
            onChange('month', d.getFullYear(), d.getMonth() + 1)
          }}><ChevronRight size={14} /></button>
        </div>
      )}

      {period === 'year' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onChange('year', year - 1, month)}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, minWidth: 50, textAlign: 'center' }}>{year}</span>
          <button className="btn btn-secondary btn-sm" disabled={year >= now.getFullYear()} onClick={() => onChange('year', year + 1, month)}><ChevronRight size={14} /></button>
        </div>
      )}
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function ReportsPage() {
  const searchParams  = useSearchParams()
  const initPeriod    = (searchParams.get('period') as string) || 'month'
  const savedId       = searchParams.get('saved')

  const now = new Date()
  const [period,  setPeriod]  = useState(initPeriod)
  const [year,    setYear]    = useState(now.getFullYear())
  const [month,   setMonth]   = useState(now.getMonth() + 1)
  const [data,    setData]    = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      let url: string
      if (savedId) {
        url = `/api/dashboard/reports?saved=${savedId}`
      } else {
        url = `/api/dashboard/reports?period=${period}&year=${year}&month=${month}`
      }
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setData(savedId ? json.reportData : json)
    } catch { setError('Failed to load report') }
    finally { setLoading(false) }
  }, [period, year, month, savedId])

  useEffect(() => { load() }, [load])

  const handlePeriodChange = (p: string, y: number, m: number) => {
    setPeriod(p); setYear(y); setMonth(m)
  }

  const saveSnapshot = async () => {
    setSaving(true)
    try {
      await fetch('/api/dashboard/reports', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ period, year, month }),
      })
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="dash-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Generating report…</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="dash-page">
      <div className="empty-state">
        <AlertTriangle size={32} className="empty-state-icon" />
        <p className="empty-state-title">{error || 'No data'}</p>
        <button className="btn btn-primary btn-sm" onClick={load}>Retry</button>
      </div>
    </div>
  )

  const { kpis, revenueChart, statusBreakdown, sourceBreakdown, paymentBreakdown, topServices, staffPerformance, expenseCategories, recentTransactions, savedReports } = data

  const maxService = Math.max(...topServices.map(s => s.count), 1)

  return (
    <div className="dash-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">
            {savedId ? 'Saved Report' : `Generated: ${new Date(data.generatedAt).toLocaleString('en-EG', { dateStyle: 'medium', timeStyle: 'short' })}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-secondary btn-sm" onClick={saveSnapshot} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : <Bookmark size={13} />}
            Save Snapshot
          </button>
          <button className="btn btn-secondary btn-sm no-print" onClick={() => window.print()}>
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {/* ── Period Selector ── */}
      {!savedId && (
        <div className="dash-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
          <PeriodSelector period={period} year={year} month={month} onChange={handlePeriodChange} />
        </div>
      )}

      {/* ── KPI Grid Row 1 — Appointments ── */}
      <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Appointments</p>
      <div className="grid-kpi" style={{ marginBottom: '1.25rem' }}>
        <KpiBox label="Total Appointments" value={kpis.totalAppointments.value}  change={kpis.totalAppointments.change}  color={C.primary} icon={Calendar} />
        <KpiBox label="Completed"          value={kpis.completedAppts.value}                                             color={C.success} icon={CheckCircle2} />
        <KpiBox label="Cancelled"          value={kpis.cancelledAppts.value}                                             color={C.danger}  icon={XCircle} />
        <KpiBox label="Completion Rate"    value={kpis.completionRate.value}   suffix="%"                                color={C.info}    icon={TrendingUp} />
      </div>

      {/* ── KPI Grid Row 2 — Finance ── */}
      <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Finance</p>
      <div className="grid-kpi" style={{ marginBottom: '1.25rem' }}>
        <KpiBox label="Total Revenue"  value={kpis.revenue.value}    change={kpis.revenue.change}  color={C.success} icon={DollarSign} prefix="EGP " />
        <KpiBox label="Total Expenses" value={kpis.expenses.value}                                 color={C.warning} icon={TrendingDown} prefix="EGP " />
        <KpiBox label="Net Profit"     value={kpis.netProfit.value}                                color={kpis.netProfit.value >= 0 ? C.success : C.danger} icon={TrendingUp} prefix="EGP " />
        <KpiBox label="Collection Rate" value={kpis.collectionRate.value} suffix="%"              color={C.accent}  icon={CheckCircle2} />
      </div>

      {/* ── KPI Grid Row 3 — Patients ── */}
      <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Patients</p>
      <div className="grid-kpi" style={{ marginBottom: '1.5rem' }}>
        <KpiBox label="New Patients"   value={kpis.newPatients.value} change={kpis.newPatients.change} color={C.accent}  icon={Users} />
        <KpiBox label="Paid Appts"     value={kpis.paidAppts.value}                                    color={C.success} icon={CheckCircle2} />
        <KpiBox label="Cancellation %" value={kpis.cancellationRate.value} suffix="%"                  color={C.danger}  icon={XCircle} />
      </div>

      {/* ── Revenue vs Expenses Chart ── */}
      <div className="dash-card" style={{ marginBottom: '1.25rem' }}>
        <div className="dash-card-body">
          <SectionHeading title="Revenue vs Expenses" icon={BarChart2} />
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={revenueChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revGradR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.primary} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.primary} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
              <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke={C.primary} fill="url(#revGradR)" strokeWidth={2.5} dot={false} />
              <Bar  dataKey="expenses" name="Expenses" fill={C.warning} radius={[4,4,0,0]} opacity={0.75} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2: Status + Source ── */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Status Pie */}
        <div className="dash-card">
          <div className="dash-card-body">
            <SectionHeading title="Appointment Status" icon={PieIcon} />
            {statusBreakdown.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}><p style={{ margin: 0 }}>No data</p></div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="count" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {statusBreakdown.map(s => <Cell key={s.status} fill={STATUS_C[s.status] ?? '#888'} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {statusBreakdown.map(s => (
                    <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_C[s.status] ?? '#888', flexShrink: 0 }} />
                      <span style={{ flex: 1, color: 'var(--text-muted)' }}>{s.status.replace('_', ' ')}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Pie */}
        <div className="dash-card">
          <div className="dash-card-body">
            <SectionHeading title="Payment Breakdown" icon={DollarSign} />
            {paymentBreakdown.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}><p style={{ margin: 0 }}>No data</p></div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={paymentBreakdown} dataKey="count" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {paymentBreakdown.map(s => <Cell key={s.status} fill={PAY_C[s.status] ?? '#888'} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {paymentBreakdown.map(s => (
                    <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: PAY_C[s.status] ?? '#888', flexShrink: 0 }} />
                      <span style={{ flex: 1, color: 'var(--text-muted)' }}>{s.status}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts Row 3: Top Services + Staff ── */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Top Services */}
        <div className="dash-card">
          <div className="dash-card-body">
            <SectionHeading title="Top Services" icon={BarChart2} />
            {topServices.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}><p style={{ margin: 0 }}>No data</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topServices.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{s.name}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>{s.count}×</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: 'var(--border)' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        background: i === 0 ? C.primary : i === 1 ? C.accent : `${C.primary}60`,
                        width: `${(s.count / maxService) * 100}%`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="dash-card">
          <div className="dash-card-body">
            <SectionHeading title="Staff Performance" icon={Users} />
            {staffPerformance.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}><p style={{ margin: 0 }}>No data</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={staffPerformance} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={90} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Appointments" radius={[0,6,6,0]}>
                    {staffPerformance.map((_, i) => <Cell key={i} fill={PIES[i % PIES.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Expense Categories ── */}
      {expenseCategories.length > 0 && (
        <div className="dash-card" style={{ marginBottom: '1.25rem' }}>
          <div className="dash-card-body">
            <SectionHeading title="Expense Categories" icon={TrendingDown} />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={expenseCategories} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`EGP ${v.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" name="Amount" radius={[4,4,0,0]}>
                  {expenseCategories.map((_, i) => <Cell key={i} fill={PIES[i % PIES.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Source Breakdown ── */}
      {sourceBreakdown.length > 0 && (
        <div className="dash-card" style={{ marginBottom: '1.25rem' }}>
          <div className="dash-card-body">
            <SectionHeading title="Booking Sources" icon={BarChart2} />
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <ResponsiveContainer width="40%" height={180} minWidth={180}>
                <PieChart>
                  <Pie data={sourceBreakdown} dataKey="count" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                    {sourceBreakdown.map((_, i) => <Cell key={i} fill={PIES[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sourceBreakdown.map((s, i) => (
                  <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIES[i], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>{s.source.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Transactions ── */}
      {recentTransactions.length > 0 && (
        <div className="dash-card" style={{ marginBottom: '1.25rem' }}>
          <div className="dash-card-body">
            <SectionHeading title="Recent Transactions" icon={DollarSign} />
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Patient</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.slice(0, 15).map((t: any) => (
                    <tr key={t.id}>
                      <td style={{ fontSize: '0.80rem' }}>{new Date(t.transactionDate).toLocaleDateString('en-EG', { dateStyle: 'medium' })}</td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: t.type === 'REVENUE' ? 'var(--success-bg)' : t.type === 'EXPENSE' ? 'var(--danger-bg)' : 'var(--warning-bg)', color: t.type === 'REVENUE' ? 'var(--success)' : t.type === 'EXPENSE' ? 'var(--danger)' : 'var(--warning)' }}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{t.category.replace('_', ' ')}</td>
                      <td style={{ fontSize: '0.80rem' }}>{t.appointment?.patient?.fullName ?? '—'}</td>
                      <td style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{t.description ?? '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.84rem', color: t.type === 'REVENUE' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.type === 'EXPENSE' ? '−' : '+'}EGP {Number(t.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved Reports ── */}
      {savedReports.length > 0 && (
        <div className="dash-card">
          <div className="dash-card-body">
            <SectionHeading title="Saved Reports" icon={Bookmark} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {savedReports.map(r => (
                <a
                  key={r.id}
                  href={`/dashboard/reports?saved=${r.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: 'var(--surface-2)', borderRadius: 9, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Bookmark size={14} color={C.accent} />
                    <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>{r.name}</span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-EG', { dateStyle: 'medium' })}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
