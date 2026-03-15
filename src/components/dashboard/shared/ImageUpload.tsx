'use client'
// src/components/dashboard/shared/ImageUpload.tsx
// Usage: <ImageUpload value={url} onChange={url => setUrl(url)} folder="staff" />

import { useRef, useState } from 'react'

interface ImageUploadProps {
  value     : string
  onChange  : (url: string) => void
  folder?   : string
  label?    : string
  size?     : 'sm' | 'md' | 'lg'
  shape?    : 'square' | 'circle'
  disabled? : boolean
}

export default function ImageUpload({
  value,
  onChange,
  folder   = 'general',
  label    = 'صورة',
  size     = 'md',
  shape    = 'square',
  disabled = false,
}: ImageUploadProps) {
  const inputRef               = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error,    setError]    = useState('')

  const dim = size === 'sm' ? 72 : size === 'lg' ? 160 : 110

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('ملف غير صالح — صور فقط'); return }
    if (file.size > 5 * 1024 * 1024)    { setError('الحجم أكبر من 5 ميجا'); return }
    setError(''); setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res  = await fetch('/api/dashboard/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'فشل الرفع')
      onChange(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الرفع')
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const borderRadius = shape === 'circle' ? '50%' : '10px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <span className="form-label">{label}</span>

      {/* Preview / Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        style={{
          width        : dim,
          height       : dim,
          borderRadius,
          border       : `2px dashed var(--border)`,
          background   : 'var(--surface-2)',
          display      : 'flex',
          alignItems   : 'center',
          justifyContent: 'center',
          cursor       : disabled || uploading ? 'default' : 'pointer',
          overflow     : 'hidden',
          position     : 'relative',
          transition   : 'border-color 0.15s',
          flexShrink   : 0,
        }}
      >
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={value}
            alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '0.5rem' }}>
            {uploading
              ? <span className="spinner" />
              : (
                <>
                  <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>📷</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {size === 'sm' ? 'رفع' : 'اضغط أو اسحب صورة'}
                  </div>
                  {size !== 'sm' && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', marginTop: 2 }}>
                      JPG / PNG / WebP · حتى 5MB
                    </div>
                  )}
                </>
              )
            }
          </div>
        )}

        {/* Overlay on hover if has image */}
        {value && !uploading && !disabled && (
          <div style={{
            position     : 'absolute',
            inset        : 0,
            background   : 'rgba(0,0,0,0.42)',
            display      : 'flex',
            alignItems   : 'center',
            justifyContent: 'center',
            opacity      : 0,
            transition   : 'opacity 0.15s',
            color        : '#fff',
            fontSize     : '0.75rem',
            fontWeight   : 600,
          }}
          className="img-upload-hover"
          >
            تغيير
          </div>
        )}
      </div>

      {/* Buttons row */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? <><span className="spinner-sm spinner" /> جارٍ الرفع…</> : '📁 اختر صورة'}
        </button>
        {value && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange('')}
            disabled={disabled}
            style={{ color: 'var(--danger)' }}
          >
            ✕ حذف
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />

      <style>{`.img-upload-hover:hover { opacity: 1 !important; }`}</style>
    </div>
  )
}
