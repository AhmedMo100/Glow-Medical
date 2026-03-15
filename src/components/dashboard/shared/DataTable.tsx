'use client'
import { useState } from 'react'
import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Column<T> {
  key:     string
  label:   string
  render?: (row: T) => React.ReactNode
  width?:  string
}

interface Props<T> {
  title:        string
  data:         T[]
  columns:      Column<T>[]
  loading?:     boolean
  onAdd?:       () => void
  addLabel?:    string
  searchable?:  boolean
  searchKeys?:  string[]
  actions?:     (row: T) => React.ReactNode
  emptyText?:   string
  filters?:     React.ReactNode
}

export default function DataTable<T extends { id: number }>({
  title, data, columns, loading, onAdd, addLabel = 'Add New',
  searchable = true, searchKeys = [], actions, emptyText = 'No records found', filters,
}: Props<T>) {
  const [q,    setQ]    = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = searchable && q
    ? data.filter(row => searchKeys.some(k => String((row as any)[k] ?? '').toLowerCase().includes(q.toLowerCase())))
    : data

  const total = filtered.length
  const pages = Math.ceil(total / perPage)
  const rows  = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'1.5rem', fontWeight:600, color:'var(--text)' }}>{title}</h1>
        <div style={{ display:'flex', alignItems:'center', gap:'.75rem', flexWrap:'wrap' }}>
          {filters}
          {searchable && (
            <div style={{ position:'relative' }}>
              <Search size={14} style={{ position:'absolute', left:'.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} />
              <input
                value={q} onChange={e => { setQ(e.target.value); setPage(1) }}
                placeholder="Search…"
                style={{ padding:'.5rem 1rem .5rem 2.25rem', border:'1px solid var(--border)', borderRadius:9, fontSize:'.875rem', background:'var(--surface)', color:'var(--text)', outline:'none', width:200 }}
              />
            </div>
          )}
          {onAdd && (
            <button onClick={onAdd} style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.5rem 1rem', borderRadius:9, background:'var(--primary)', color:'#fff', border:'none', cursor:'pointer', fontSize:'.875rem', fontWeight:500 }}>
              <Plus size={15} /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, gap:'.5rem', color:'var(--text-muted)' }}>
            <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }} /> Loading…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--surface-2)' }}>
                    {columns.map(col => (
                      <th key={col.key} style={{ padding:'.75rem 1rem', textAlign:'left', fontSize:'.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap', width: col.width }}>
                        {col.label}
                      </th>
                    ))}
                    {actions && <th style={{ padding:'.75rem 1rem', textAlign:'right', fontSize:'.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', width:120 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)', fontSize:'.875rem' }}>{emptyText}</td></tr>
                  ) : rows.map(row => (
                    <tr key={row.id} style={{ borderTop:'1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      {columns.map(col => (
                        <td key={col.key} style={{ padding:'.875rem 1rem', fontSize:'.875rem', color:'var(--text)' }}>
                          {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                        </td>
                      ))}
                      {actions && <td style={{ padding:'.875rem 1rem', textAlign:'right' }}>{actions(row)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ padding:'.75rem 1rem', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>
                  {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
                </span>
                <div style={{ display:'flex', gap:'.5rem' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding:'.3rem .6rem', borderRadius:7, border:'1px solid var(--border)', background:'var(--surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1 }}>
                    <ChevronLeft size={14} color="var(--text-muted)" />
                  </button>
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    const n = page <= 3 ? i + 1 : page + i - 2
                    if (n < 1 || n > pages) return null
                    return (
                      <button key={n} onClick={() => setPage(n)}
                        style={{ width:30, height:30, borderRadius:7, border:'1px solid var(--border)', background: n === page ? 'var(--primary)' : 'var(--surface)', color: n === page ? '#fff' : 'var(--text)', cursor:'pointer', fontSize:'.8rem', fontWeight: n === page ? 600 : 400 }}>
                        {n}
                      </button>
                    )
                  })}
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                    style={{ padding:'.3rem .6rem', borderRadius:7, border:'1px solid var(--border)', background:'var(--surface)', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? .4 : 1 }}>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
