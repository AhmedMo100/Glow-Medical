'use client'
// src/components/dashboard/shared/ImageUpload.tsx
// Usage:
//   <ImageUpload value={url} onChange={url => setForm(f => ({...f, imageUrl: url}))} folder="services" />

import { useState, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

interface Props {
  value?      : string | null
  onChange    : (url: string | null) => void
  folder?     : string   // cloudinary sub-folder e.g. "services", "staff", "blog"
  label?      : string
  aspectHint? : string   // e.g. "1:1" or "16:9"
  disabled?   : boolean
}

export default function ImageUpload({
  value,
  onChange,
  folder    = 'general',
  label     = 'Image',
  aspectHint,
  disabled  = false,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024)    { setError('Max file size is 5 MB'); return }

    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file',   file)
      formData.append('folder', folder)

      const res = await fetch('/api/dashboard/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      onChange(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // reset so same file can be re-selected
    e.target.value = ''
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{aspectHint && <span style={{ fontWeight: 400, marginLeft: 6, color: 'var(--text-light)' }}>({aspectHint})</span>}</label>}

      {value ? (
        /* Preview */
        <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
          <img
            src={value}
            alt="preview"
            style={{ width: '100%', borderRadius: 10, border: '1.5px solid var(--border)', objectFit: 'cover', aspectRatio: '16/9', display: 'block' }}
          />
          {!disabled && (
            <button
              type="button"
              onClick={clear}
              style={{
                position: 'absolute', top: 6, right: 6,
                background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
              title="Remove image"
            >
              <X size={13} />
            </button>
          )}
          {!disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                position: 'absolute', bottom: 6, right: 6,
                background: 'var(--primary)', border: 'none', borderRadius: 6,
                padding: '4px 10px', cursor: 'pointer', color: '#fff',
                fontSize: '0.72rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Upload size={11} /> Change
            </button>
          )}
        </div>
      ) : (
        /* Drop Zone */
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border     : '2px dashed var(--border)',
            borderRadius: 10,
            padding    : '1.5rem',
            textAlign  : 'center',
            cursor     : disabled ? 'default' : 'pointer',
            background : 'var(--surface-2)',
            transition : 'all 0.15s',
            opacity    : disabled ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)' }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.82rem' }}>Uploading…</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-light, rgba(8,43,86,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>Click or drag & drop</p>
              <p style={{ fontSize: '0.75rem' }}>PNG, JPG, WebP — max 5 MB</p>
            </div>
          )}
        </div>
      )}

      {error && <p style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: 4 }}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={disabled || uploading}
      />
    </div>
  )
}