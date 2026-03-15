'use client'

import { useRef, useState } from 'react'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string          // current URL
  onChange: (url: string) => void
  folder?: string        // cloudinary folder
  label?: string
  aspectRatio?: string   // e.g. "16/9", "1/1"
  height?: number
}

export default function ImageUpload({
  value, onChange, folder = 'uploads', label = 'Image',
  aspectRatio = '16/9', height = 140,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WEBP)'); return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB'); return
    }

    setError('')
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
        // No Content-Type header - browser sets it with boundary for multipart
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Upload failed (${res.status})`)
      }

      const data = await res.json()
      if (!data.url) throw new Error('No URL returned from upload')
      onChange(data.url)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem' }}>{label}</label>}

      <div
        style={{
          border: `2px dashed ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'border-color var(--transition)',
          position: 'relative',
          height: value ? 'auto' : height,
          background: 'var(--surface-2)',
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onMouseEnter={e => !error && (e.currentTarget.style.borderColor = 'var(--primary)')}
        onMouseLeave={e => !error && (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        {value ? (
          /* Preview */
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio, minHeight: height }}>
              <Image
                src={value} alt="Upload preview" fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
            {/* Overlay on hover */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
            >
              {uploading ? (
                <Loader2 size={24} color="#fff" className="anim-spin" />
              ) : (
                <>
                  <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500, opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}
                    className="img-hint">Change Image</span>
                </>
              )}
            </div>
            {/* Remove button */}
            {!uploading && (
              <button
                onClick={e => { e.stopPropagation(); onChange('') }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '100%', minHeight: height, gap: '0.5rem',
            padding: '1.25rem',
          }}>
            {uploading ? (
              <>
                <Loader2 size={24} className="anim-spin" style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Uploading…</span>
              </>
            ) : (
              <>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Upload size={18} color="var(--text-muted)" />
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Click or drag to upload
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>JPG, PNG, WEBP · Max 10MB</span>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--danger)',
        }}>
          <AlertCircle size={13} />
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', marginLeft: 'auto', padding: 0 }}><X size={12} /></button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
