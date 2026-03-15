'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, TrendingUp, Users, CalendarDays } from 'lucide-react'

type Analytics = {
  period: number
  kpis: { totalRevenue: number; totalAppointments: number; newPatients: number; completionRate: number; avgRevenuePerApt: number }
  topServices: { name: string; count: number; revenue: number }[]
  topStaff   : { name: string; count: number; revenue: number; staffType: string }[]
  bySource   : { source: string; count: number }[]
  byStatus   : { status: string; count: number }[]
  dailyRevenue: { day: string; revenue: number; appointments: number }[]
}

const API = '/api/dashboard/analytics'

function Bar({ value, max, color = 'var(--primary)' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max * 100) : 0
  return (
    <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
    </div>
  )
}

function KpiCard({ label, value, icon: Icon, color, suffix = '', sub }: { label: string; value: number | string; icon: React.ElementType; color: string; suffix?: string; sub?: string }) {
  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="kpi-label">{label}</p>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="kpi-value">{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState('30')

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await fetch(`${API}?days=${period}`); const d = await r.json(); setData(d) }
    finally { setLoading(false) }
  }, [period])

  useEffect(() => { load() }, [load])

  const maxRev  = data ? Math.max(...data.topServices.map(s => s.revenue), 1) : 1
  const maxApt  = data ? Math.max(...data.topStaff.map(s => s.count), 1) : 1
  const maxSrc  = data ? Math.max(...data.bySource.map(s => s.count), 1) : 1
  const maxRev2 = data ? Math.max(...(data.dailyRevenue?.map(d => d.revenue) ?? [1]), 1) : 1

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Performance insights</p>
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner spinner-lg" /></div>
      ) : !data ? null : (
        <>
          {/* KPIs */}
          <div className="grid-kpi" style={{ marginBottom: '1.5rem' }}>
            <KpiCard label="Revenue" value={data.kpis.totalRevenue} icon={TrendingUp} color="var(--success)" suffix="" sub={`EGP ${data.kpis.avgRevenuePerApt.toLocaleString()} avg/apt`} />
            <KpiCard label="Appointments" value={data.kpis.totalAppointments} icon={CalendarDays} color="var(--info)" sub={`${data.kpis.completionRate}% completion rate`} />
            <KpiCard label="New Patients" value={data.kpis.newPatients} icon={Users} color="var(--primary)" />
            <KpiCard label="Avg Revenue/Apt" value={`EGP ${data.kpis.avgRevenuePerApt.toLocaleString()}`} icon={BarChart3} color="var(--warning)" />
          </div>

          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            {/* Top Services */}
            <div className="dash-card">
              <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Top Services</p>
              </div>
              <div style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {data.topServices.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data</p> :
                data.topServices.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{s.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.count} bookings · EGP {s.revenue.toLocaleString()}</span>
                    </div>
                    <Bar value={s.revenue} max={maxRev} />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Staff */}
            <div className="dash-card">
              <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Top Staff</p>
              </div>
              <div style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {data.topStaff.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data</p> :
                data.topStaff.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div>
                        <span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{s.name}</span>
                        <span className="badge badge-neutral" style={{ marginLeft: 6, fontSize: '0.65rem' }}>{s.staffType}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.count} completed</span>
                    </div>
                    <Bar value={s.count} max={maxApt} color="var(--info)" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            {/* By Source */}
            <div className="dash-card">
              <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Appointment Sources</p>
              </div>
              <div style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.bySource.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', width: 110, flexShrink: 0 }}>{s.source.replace('_',' ')}</span>
                    <Bar value={s.count} max={maxSrc} color="var(--success)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 30, textAlign: 'right', flexShrink: 0 }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Status */}
            <div className="dash-card">
              <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Appointment Status Breakdown</p>
              </div>
              <div style={{ padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.byStatus?.map((s, i) => {
                  const max = Math.max(...(data.byStatus?.map(x => x.count) ?? [1]), 1)
                  const colors: Record<string,string> = { COMPLETED: 'var(--success)', CANCELLED: 'var(--danger)', PENDING: 'var(--warning)', CONFIRMED: 'var(--info)', NO_SHOW: 'var(--text-subtle)' }
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.82rem', width: 110, flexShrink: 0 }}>{s.status.replace('_',' ')}</span>
                      <Bar value={s.count} max={max} color={colors[s.status] ?? 'var(--primary)'} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 30, textAlign: 'right', flexShrink: 0 }}>{s.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div className="dash-card">
            <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Daily Revenue & Appointments</p>
            </div>
            <div style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minWidth: 600, height: 160 }}>
                {data.dailyRevenue?.map((d, i) => {
                  const h = maxRev2 > 0 ? (d.revenue / maxRev2 * 140) : 0
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${d.day}: EGP ${d.revenue.toLocaleString()}, ${d.appointments} apts`}>
                      <div style={{ width: '100%', height: `${h}px`, minHeight: d.revenue > 0 ? 4 : 0, background: 'var(--primary)', borderRadius: '4px 4px 0 0', opacity: 0.85, transition: 'height 0.4s ease' }} />
                      {i % Math.ceil(data.dailyRevenue.length / 10) === 0 && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', transform: 'rotate(-35deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                          {new Date(d.day).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
