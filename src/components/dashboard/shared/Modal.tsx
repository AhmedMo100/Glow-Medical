'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  open:     boolean
  onClose:  () => void
  title:    string
  children: React.ReactNode
  width?:   number
  footer?:  React.ReactNode
}

export default function Modal({ open, onClose, title, children, width = 560, footer }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', backdropFilter:'blur(4px)', zIndex:200, animation:'fadeIn .15s ease' }} />
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:`min(${width}px, calc(100vw - 2rem))`,
        maxHeight:'90vh', overflowY:'auto',
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:18, boxShadow:'0 24px 60px rgba(0,0,0,.25)',
        zIndex:201, animation:'slideUp .2s ease',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.1rem 1.5rem', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'var(--surface)', zIndex:1, borderRadius:'18px 18px 0 0' }}>
          <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1.15rem', fontWeight:600, color:'var(--text)' }}>{title}</h2>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <X size={14} color="var(--text-muted)" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:'1.5rem' }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:'.75rem', position:'sticky', bottom:0, background:'var(--surface)', borderRadius:'0 0 18px 18px' }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translate(-50%,-48%) } to { opacity:1; transform:translate(-50%,-50%) } }
      `}</style>
    </>
  )
}

// Reusable form field
export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.35rem' }}>
      <label style={{ fontSize:'.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.07em' }}>
        {label} {required && <span style={{ color:'#ef4444' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

// Reusable input styles
export const inputStyle: React.CSSProperties = {
  padding:'.6rem .875rem', border:'1px solid var(--border)', borderRadius:9,
  fontSize:'.875rem', background:'var(--surface-2)', color:'var(--text)',
  outline:'none', width:'100%', fontFamily:'inherit',
}

export const selectStyle: React.CSSProperties = { ...{ padding:'.6rem .875rem', border:'1px solid var(--border)', borderRadius:9, fontSize:'.875rem', background:'var(--surface-2)', color:'var(--text)', outline:'none', width:'100%', fontFamily:'inherit' } }

// Action buttons
export function Btn({ children, onClick, variant = 'primary', type = 'button', disabled, loading }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary'|'ghost'|'danger'; type?: 'button'|'submit'; disabled?: boolean; loading?: boolean }) {
  const bg = variant === 'primary' ? 'var(--primary)' : variant === 'danger' ? '#ef4444' : 'transparent'
  const color = variant === 'ghost' ? 'var(--text)' : '#fff'
  const border = variant === 'ghost' ? '1px solid var(--border)' : 'none'
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.6rem 1.1rem', borderRadius:9, background: bg, color, border, cursor: disabled || loading ? 'not-allowed' : 'pointer', fontSize:'.875rem', fontWeight:500, opacity: disabled ? .5 : 1, fontFamily:'inherit' }}>
      {loading && <span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', animation:'spin 1s linear infinite', display:'inline-block' }} />}
      {children}
    </button>
  )
}
