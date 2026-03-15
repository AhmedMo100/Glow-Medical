'use client'
// components/dashboard/overview/OverviewPage.tsx

import { useEffect, useState, useCallback } from 'react'
import {
  CalendarDays, Users, TrendingUp, DollarSign,
  AlertTriangle, MessageSquare, Star, Package,
  ArrowUp, ArrowDown, Minus, RefreshCw,
  Clock, CheckCircle2, XCircle,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

/* ── Types ────────────────────────────────────────────────── */
type OverviewData = {
  kpis: {
    todayAppointments: { value: number; change: number }
    monthAppointments: { value: number; change: number }
    monthRevenue: { value: number; change: number }
    totalPatients: { value: number; change: number }
  }
  alerts: { lowStock: number; unreadMessages: number; pendingReviews: number }
  todayStatus: Record<string, number>
  revenueChart: { date: string; revenue: number }[]
  sourceChart: Record<string, number>
  topServices: { name: string; count: number }[]
  upcoming: any[]
}

/* ── KPI Card ────────────────────────────────────────────── */
function KpiCard({
  icon, label, value, change, prefix = '', color,
}: {
  icon: React.ReactNode; label: string; value: number
  change: number; prefix?: string; color: string
}) {
  const dir = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${color}18`, color,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-EG') : value}
      </div>
      {change !== 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <span className={`kpi-change ${dir}`}>
            {dir === 'up' ? <ArrowUp size={10} /> : dir === 'down' ? <ArrowDown size={10} /> : <Minus size={10} />}
            {Math.abs(change)}%
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>vs last month</span>
        </div>
      )}
    </div>
  )
}

/* ── Status donut label ──────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#d97706',
  CONFIRMED: '#2563eb',
  IN_PROGRESS: '#a855f7',
  COMPLETED: '#059669',
  CANCELLED: '#dc2626',
  NO_SHOW: '#6b7280',
}

const SOURCE_COLORS = ['#082b56', '#c49a6c', '#2563eb', '#059669']
const SOURCE_LABELS: Record<string, string> = { WEBSITE: 'Website', WHATSAPP: 'WhatsApp', WALK_IN: 'Walk-in', PHONE: 'Phone' }

/* ── Main component ──────────────────────────────────────── */
export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/overview')
      if (!res.ok) throw new Error('Failed')
      setData(await res.json())
      setError('')
    } catch {
      setError('Could not load overview data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="dash-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div className="spinner spinner-lg" />
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

  const { kpis, alerts, todayStatus, revenueChart, sourceChart, topServices, upcoming } = data

  const sourceData = Object.entries(sourceChart).map(([k, v]) => ({ name: SOURCE_LABELS[k] ?? k, value: v }))
  const statusData = Object.entries(todayStatus).map(([k, v]) => ({ name: k, value: v }))

  const maxService = Math.max(...topServices.map(s => s.count), 1)

  return (
    <div className="dash-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load} style={{ gap: 6 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* ── Alerts row ── */}
      {(alerts.lowStock > 0 || alerts.unreadMessages > 0 || alerts.pendingReviews > 0) && (
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {alerts.lowStock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.55rem 1rem', background: 'var(--warning-bg)', border: '1px solid var(--warning)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--warning)' }}>
              <Package size={14} /> <strong>{alerts.lowStock}</strong> items low/out of stock
            </div>
          )}
          {alerts.unreadMessages > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.55rem 1rem', background: 'var(--info-bg)', border: '1px solid var(--info)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--info)' }}>
              <MessageSquare size={14} /> <strong>{alerts.unreadMessages}</strong> unread messages
            </div>
          )}
          {alerts.pendingReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.55rem 1rem', background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--success)' }}>
              <Star size={14} /> <strong>{alerts.pendingReviews}</strong> reviews pending approval
            </div>
          )}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid-kpi" style={{ marginBottom: '1.25rem' }}>
        <KpiCard icon={<CalendarDays size={17} />} label="Today's Appointments" value={kpis.todayAppointments.value} change={kpis.todayAppointments.change} color="#2563eb" />
        <KpiCard icon={<CalendarDays size={17} />} label="This Month Appts" value={kpis.monthAppointments.value} change={kpis.monthAppointments.change} color="#a855f7" />
        <KpiCard icon={<DollarSign size={17} />} label="Monthly Revenue" value={kpis.monthRevenue.value} change={kpis.monthRevenue.change} color="#059669" prefix="EGP " />
        <KpiCard icon={<Users size={17} />} label="Total Patients" value={kpis.totalPatients.value} change={kpis.totalPatients.change} color="#c49a6c" />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Revenue chart */}
        <div className="dash-card">
          <div className="dash-card-body">
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Revenue — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#082b56" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#082b56" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                  formatter={(value: any) => {
                    const num = Array.isArray(value) ? Number(value[0]) : Number(value)
                    return [`EGP ${num.toLocaleString()}`, 'Revenue']
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#082b56" fill="url(#revGrad)" strokeWidth={2} dot={{ r: 3, fill: '#c49a6c' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's status + source breakdown */}
        <div className="dash-card">
          <div className="dash-card-body">
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Today's Status Breakdown</h3>
            {statusData.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <CalendarDays size={24} style={{ opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '0.83rem' }}>No appointments today</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#888'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {statusData.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s.name] ?? '#888', flexShrink: 0 }} />
                      <span style={{ flex: 1, color: 'var(--text-muted)' }}>{s.name.replace('_', ' ')}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Top Services */}
        <div className="dash-card">
          <div className="dash-card-body">
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Top Services This Month</h3>
            {topServices.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.83rem' }}>No data yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topServices.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.count}x</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: 'var(--border)' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: i === 0 ? '#082b56' : i === 1 ? '#c49a6c' : 'var(--border-strong)', width: `${(s.count / maxService) * 100}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Source breakdown */}
        <div className="dash-card">
          <div className="dash-card-body">
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Booking Sources This Month</h3>
            {sourceData.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.83rem' }}>No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sourceData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {sourceData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Upcoming Appointments ── */}
      <div className="dash-card">
        <div className="dash-card-body">
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
            Upcoming Appointments (Next 7 Days)
          </h3>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={28} className="empty-state-icon" />
              <p className="empty-state-title">No upcoming appointments</p>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Services</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((appt: any) => (
                    <tr key={appt.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {appt.patient?.fullName ?? appt.tempPatientName ?? '—'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {appt.patient?.phone ?? appt.tempPatientPhone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.84rem' }}>
                          {new Date(appt.appointmentDate).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={11} />{new Date(appt.appointmentDate).toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {appt.services?.map((s: any) => s.service.name).join(', ') || '—'}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{appt.staff?.name ?? '—'}</td>
                      <td>
                        <span className={`badge badge-${appt.status}`}>{appt.status.replace('_', ' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
