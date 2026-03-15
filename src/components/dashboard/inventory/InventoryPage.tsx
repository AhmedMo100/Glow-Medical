'use client'
// components/dashboard/inventory/InventoryPage.tsx

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Edit2, Trash2, X, CheckCircle, AlertCircle,
  Search, ChevronLeft, ChevronRight, Package,
  TrendingUp, TrendingDown, ArrowUpDown, AlertTriangle,
  BarChart2, RefreshCw, History,
} from 'lucide-react'

type InventoryItem = {
  id: number; name: string; sku: string | null; barcode: string | null
  category: string; status: string; description: string | null
  imageUrl: string | null; unit: string; quantity: number
  minQuantity: number; reorderQuantity: number
  costPrice: number | null; sellingPrice: number | null
  supplier: string | null; supplierPhone: string | null
  expiryDate: string | null; lastRestockedAt: string | null
  isActive: boolean; createdAt: string
  _count: { movements: number }
}

const CATEGORIES = ['CONSUMABLE', 'PRODUCT', 'EQUIPMENT', 'TOOL', 'MEDICATION']
const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  IN_STOCK    : { label: 'In Stock',     color: 'var(--success)', bg: 'var(--success-bg)'  },
  LOW_STOCK   : { label: 'Low Stock',    color: '#d97706',        bg: '#fef3c7'             },
  OUT_OF_STOCK: { label: 'Out of Stock', color: 'var(--danger)',  bg: 'var(--danger-bg)'    },
  EXPIRED     : { label: 'Expired',      color: '#7c3aed',        bg: '#ede9fe'             },
  DISCONTINUED: { label: 'Discontinued', color: 'var(--text-muted)', bg: 'var(--surface-2)' },
}

const EMPTY = {
  name: '', sku: '', barcode: '', category: 'CONSUMABLE', description: '',
  unit: 'piece', quantity: '0', minQuantity: '5', reorderQuantity: '10',
  costPrice: '', sellingPrice: '', supplier: '', supplierPhone: '',
  expiryDate: '', isActive: true,
}

/* ── Item Form Modal ─────────────────────────────────────── */
function ItemFormModal({ item, onClose, onSave }: { item: InventoryItem | null; onClose: () => void; onSave: () => void }) {
  const [form,   setForm]   = useState(item ? {
    name           : item.name,
    sku            : item.sku            ?? '',
    barcode        : item.barcode        ?? '',
    category       : item.category,
    description    : item.description   ?? '',
    unit           : item.unit,
    quantity       : String(item.quantity),
    minQuantity    : String(item.minQuantity),
    reorderQuantity: String(item.reorderQuantity),
    costPrice      : item.costPrice      ? String(item.costPrice)    : '',
    sellingPrice   : item.sellingPrice   ? String(item.sellingPrice) : '',
    supplier       : item.supplier       ?? '',
    supplierPhone  : item.supplierPhone  ?? '',
    expiryDate     : item.expiryDate     ? item.expiryDate.slice(0, 10) : '',
    isActive       : item.isActive,
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.category) { setError('Name and category required.'); return }
    setSaving(true); setError('')
    try {
      const url    = item ? `/api/dashboard/inventory/${item.id}` : '/api/dashboard/inventory'
      const method = item ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, quantity: Number(form.quantity), minQuantity: Number(form.minQuantity), reorderQuantity: Number(form.reorderQuantity), costPrice: form.costPrice ? Number(form.costPrice) : null, sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : null, expiryDate: form.expiryDate || null }) })
      const data   = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave()
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg">
        <div className="modal-header"><h2 className="modal-title">{item ? 'Edit Item' : 'New Inventory Item'}</h2><button className="btn-icon" onClick={onClose}><X size={16} /></button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && <div style={{ display: 'flex', gap: 8, padding: '0.6rem 0.9rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}
          <div className="form-row form-row-2">
            <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Numbing Cream" /></div>
            <div className="form-group"><label className="form-label">Category *</label><select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-row form-row-3">
            <div className="form-group"><label className="form-label">SKU</label><input className="form-input" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SKU-001" /></div>
            <div className="form-group"><label className="form-label">Barcode</label><input className="form-input" value={form.barcode} onChange={e => set('barcode', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Unit</label><input className="form-input" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="piece / ml / g" /></div>
          </div>
          <div className="form-row form-row-3">
            <div className="form-group"><label className="form-label">Quantity *</label><input className="form-input" type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Min Quantity</label><input className="form-input" type="number" min="0" value={form.minQuantity} onChange={e => set('minQuantity', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Reorder Qty</label><input className="form-input" type="number" min="0" value={form.reorderQuantity} onChange={e => set('reorderQuantity', e.target.value)} /></div>
          </div>
          <div className="form-row form-row-2">
            <div className="form-group"><label className="form-label">Cost Price (EGP)</label><input className="form-input" type="number" min="0" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Selling Price (EGP)</label><input className="form-input" type="number" min="0" value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} /></div>
          </div>
          <div className="form-row form-row-2">
            <div className="form-group"><label className="form-label">Supplier</label><input className="form-input" value={form.supplier} onChange={e => set('supplier', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Supplier Phone</label><input className="form-input" value={form.supplierPhone} onChange={e => set('supplierPhone', e.target.value)} /></div>
          </div>
          <div className="form-row form-row-2">
            <div className="form-group"><label className="form-label">Expiry Date</label><input className="form-input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <label className="toggle"><input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} /><span className="toggle-track"><span className="toggle-thumb" /></span><span style={{ marginLeft: 8, fontSize: '0.84rem' }}>Active</span></label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : <CheckCircle size={14} />}{item ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Stock Movement Modal ────────────────────────────────── */
function StockMovementModal({ item, onClose, onSave }: { item: InventoryItem; onClose: () => void; onSave: () => void }) {
  const [type,  setType]  = useState('RESTOCK')
  const [qty,   setQty]   = useState('')
  const [notes, setNotes] = useState('')
  const [saving,setSaving]= useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!qty || Number(qty) <= 0) { setError('Enter a valid quantity'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/dashboard/inventory/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ movementType: type, movementQty: Number(qty), notes }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      onSave()
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }

  const newQty = type === 'ADJUSTMENT' ? Number(qty || 0) : type === 'RESTOCK' ? item.quantity + Number(qty || 0) : Math.max(0, item.quantity - Number(qty || 0))

  return createPortal(
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-sm">
        <div className="modal-header"><h2 className="modal-title"><ArrowUpDown size={15} /> Stock Movement · {item.name}</h2><button className="btn-icon" onClick={onClose}><X size={16} /></button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {error && <div style={{ display: 'flex', gap: 8, padding: '0.6rem', background: 'var(--danger-bg)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.83rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ v: 'RESTOCK', l: '+ Restock', c: 'var(--success)' }, { v: 'USED', l: '- Used', c: 'var(--danger)' }, { v: 'ADJUSTMENT', l: '= Adjust', c: 'var(--primary)' }].map(t => (
              <button key={t.v} onClick={() => setType(t.v)} style={{ flex: 1, padding: '0.5rem', border: `2px solid ${type === t.v ? t.c : 'var(--border)'}`, borderRadius: 9, background: type === t.v ? `${t.c}15` : 'transparent', color: type === t.v ? t.c : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>{t.l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', padding: '0.85rem', background: 'var(--surface-2)', borderRadius: 10 }}>
            <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current</p><p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{item.quantity}</p></div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-subtle)' }}>→</div>
            <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>New</p><p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: newQty < item.minQuantity ? 'var(--danger)' : 'var(--success)' }}>{qty ? newQty : '?'}</p></div>
          </div>
          <div className="form-group"><label className="form-label">Quantity *</label><input className="form-input" type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" autoFocus /></div>
          <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for adjustment…" /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : <RefreshCw size={14} />} Apply</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function InventoryPage() {
  const [items,    setItems]    = useState<InventoryItem[]>([])
  const [summary,  setSummary]  = useState({ inStock: 0, lowStock: 0, outOfStock: 0, expired: 0 })
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [catFilter,setCatFilter]= useState('')
  const [stFilter, setStFilter] = useState('')
  const [modal,    setModal]    = useState(false)
  const [mvModal,  setMvModal]  = useState(false)
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [delId,    setDelId]    = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), limit: '20' })
      if (search)    p.set('search',   search)
      if (catFilter) p.set('category', catFilter)
      if (stFilter)  p.set('status',   stFilter)
      const res  = await fetch(`/api/dashboard/inventory?${p}`)
      const data = await res.json()
      setItems(data.items     ?? [])
      setTotal(data.total     ?? 0)
      setPages(data.pages     ?? 1)
      setSummary(data.summary ?? { inStock: 0, lowStock: 0, outOfStock: 0, expired: 0 })
    } catch {} finally { setLoading(false) }
  }, [page, search, catFilter, stFilter])

  useEffect(() => { load() }, [load])

  const doDelete = async () => {
    if (!delId) return
    await fetch(`/api/dashboard/inventory/${delId}`, { method: 'DELETE' })
    setDelId(null); load()
  }

  const STAT_CARDS = [
    { label: 'In Stock',     count: summary.inStock,     color: 'var(--success)', status: 'IN_STOCK'     },
    { label: 'Low Stock',    count: summary.lowStock,    color: '#d97706',        status: 'LOW_STOCK'    },
    { label: 'Out of Stock', count: summary.outOfStock,  color: 'var(--danger)',  status: 'OUT_OF_STOCK' },
    { label: 'Expired',      count: summary.expired,     color: '#7c3aed',        status: 'EXPIRED'      },
  ]

  return (
    <div className="dash-page">
      <div className="page-header">
        <div><h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Package size={20} /> Inventory</h1><p className="page-subtitle">{total} items</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true) }}><Plus size={15} /> Add Item</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        {STAT_CARDS.map(c => (
          <div key={c.status} className="dash-card" style={{ padding: '1rem', cursor: 'pointer', border: stFilter === c.status ? `2px solid ${c.color}` : '1.5px solid var(--border)' }} onClick={() => setStFilter(stFilter === c.status ? '' : c.status)}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c.color }}>{c.count}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="dash-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search items…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select" style={{ width: 160 }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {stFilter && <button className="btn btn-secondary btn-sm" onClick={() => setStFilter('')}><X size={12} /> Clear Filter</button>}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
      ) : items.length === 0 ? (
        <div className="dash-card"><div className="empty-state"><Package size={32} className="empty-state-icon" /><p className="empty-state-title">No items found</p><button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); setModal(true) }}><Plus size={13} /> Add Item</button></div></div>
      ) : (
        <div className="dash-card">
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Stock Status</th><th>Price</th><th>Supplier</th><th>Expiry</th><th></th></tr></thead>
              <tbody>
                {items.map(item => {
                  const ss = STATUS_STYLE[item.status]
                  const isLow = item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK'
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isLow && <AlertTriangle size={13} style={{ color: '#d97706', flexShrink: 0 }} />}
                          {item.name}
                        </div>
                        {item.sku && <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{item.sku}</div>}
                      </td>
                      <td><span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{item.category}</span></td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: item.quantity === 0 ? 'var(--danger)' : item.quantity <= item.minQuantity ? '#d97706' : 'var(--text)' }}>
                          {item.quantity} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{item.unit}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>min: {item.minQuantity}</div>
                      </td>
                      <td><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                      <td>
                        {item.costPrice    && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cost: EGP {Number(item.costPrice).toLocaleString()}</div>}
                        {item.sellingPrice && <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Sell: EGP {Number(item.sellingPrice).toLocaleString()}</div>}
                      </td>
                      <td>
                        {item.supplier && <div style={{ fontSize: '0.82rem' }}>{item.supplier}</div>}
                        {item.supplierPhone && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.supplierPhone}</div>}
                      </td>
                      <td>
                        {item.expiryDate
                          ? <span style={{ fontSize: '0.78rem', color: new Date(item.expiryDate) < new Date() ? 'var(--danger)' : '#d97706', fontWeight: 600 }}>{new Date(item.expiryDate).toLocaleDateString('ar-EG')}</span>
                          : <span style={{ color: 'var(--text-subtle)' }}>—</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" title="Stock movement" onClick={() => { setSelected(item); setMvModal(true) }}><ArrowUpDown size={13} /></button>
                          <button className="btn-icon" onClick={() => { setSelected(item); setModal(true) }}><Edit2 size={13} /></button>
                          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDelId(item.id)}><Trash2 size={13} /></button>
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

      {modal    && <ItemFormModal item={selected} onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}
      {mvModal  && selected && <StockMovementModal item={selected} onClose={() => setMvModal(false)} onSave={() => { setMvModal(false); load() }} />}

      {delId && createPortal(
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDelId(null)}>
          <div className="modal-box modal-sm">
            <div className="modal-header"><h2 className="modal-title">Delete Item</h2><button className="btn-icon" onClick={() => setDelId(null)}><X size={16} /></button></div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--danger)' }}><Trash2 size={22} /></div>
              <p style={{ fontWeight: 600 }}>Delete this item?</p>
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
