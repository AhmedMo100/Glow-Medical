'use client'

interface Props {
  checked:  boolean
  onChange: (v: boolean) => void
  label?:   string
  size?:    'sm' | 'md'
}

export default function Toggle({ checked, onChange, label, size = 'md' }: Props) {
  const w = size === 'sm' ? 32 : 40
  const h = size === 'sm' ? 18 : 22
  const d = size === 'sm' ? 12 : 16

  return (
    <label style={{ display:'flex', alignItems:'center', gap:'.5rem', cursor:'pointer', userSelect:'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: w, height: h, borderRadius: h, position:'relative',
          background: checked ? 'var(--primary)' : 'var(--border)',
          transition:'background .2s ease', cursor:'pointer', flexShrink:0,
        }}>
        <div style={{
          position:'absolute', top:(h - d) / 2, left: checked ? w - d - (h - d) / 2 : (h - d) / 2,
          width: d, height: d, borderRadius:'50%', background:'#fff',
          boxShadow:'0 1px 4px rgba(0,0,0,.2)', transition:'left .2s ease',
        }} />
      </div>
      {label && <span style={{ fontSize:'.82rem', color:'var(--text)' }}>{label}</span>}
    </label>
  )
}

// Published + Featured row used in many pages
export function PublishControls({ isPublished, isFeatured, onPublish, onFeature }: { isPublished: boolean; isFeatured: boolean; onPublish: (v: boolean) => void; onFeature: (v: boolean) => void }) {
  return (
    <div style={{ display:'flex', gap:'1.5rem', padding:'.875rem 1rem', background:'var(--surface-2)', borderRadius:10, border:'1px solid var(--border)' }}>
      <Toggle checked={isPublished} onChange={onPublish} label="Published on website" />
      <Toggle checked={isFeatured}  onChange={onFeature} label="Featured"              />
    </div>
  )
}
