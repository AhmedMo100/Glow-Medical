'use client'
// components/shared/PhotoUpload.tsx
// Direct browser → Cloudinary upload using unsigned preset
// No backend /api/upload route needed at all ✅

import { useRef, useState } from 'react'
import { Upload, Camera, X, AlertCircle } from 'lucide-react'

interface PhotoUploadProps {
  value   : string
  onChange: (url: string, publicId?: string) => void
  folder? : string
  size?   : number
  shape?  : 'circle' | 'rect'
}

export default function PhotoUpload({
  value,
  onChange,
  folder = 'glow-medical/staff',
  size   = 120,
  shape  = 'circle',
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const cloudName   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.')
      return
    }

    setError('')
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('file',         file)
      fd.append('upload_preset', uploadPreset)  // glow_unsigned
      fd.append('folder',       folder)

      // Direct upload to Cloudinary — no backend needed
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: fd }
      )

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error?.message ?? `Upload failed (${res.status})`)
        return
      }

      onChange(data.secure_url, data.public_id)
    } catch (err) {
      console.error('[PhotoUpload]', err)
      setError('Network error — please try again.')
    } finally {
      setUploading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const radius = shape === 'circle' ? '50%' : '12px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>

      {/* ── Upload Zone ── */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          position      : 'relative',
          width         : size,
          height        : size,
          borderRadius  : radius,
          border        : value ? 'none' : `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
          background    : value ? 'transparent' : dragOver ? 'var(--primary-light)' : 'var(--surface-2)',
          cursor        : uploading ? 'not-allowed' : 'pointer',
          overflow      : 'hidden',
          display       : 'flex',
          alignItems    : 'center',
          justifyContent: 'center',
          flexShrink    : 0,
          transition    : 'all 0.15s',
        }}
      >
        {/* Has image */}
        {value && !uploading && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded photo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4, color: '#fff',
                opacity: 0, transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
            >
              <Camera size={20} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Change Photo</span>
            </div>
          </>
        )}

        {/* Uploading */}
        {uploading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className="spinner" />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Uploading…</span>
          </div>
        )}

        {/* Empty */}
        {!value && !uploading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            color: dragOver ? 'var(--primary)' : 'var(--text-muted)', padding: '0.5rem',
          }}>
            <Upload size={22} />
            <span style={{ fontSize: '0.68rem', textAlign: 'center', lineHeight: 1.4 }}>
              Click or<br />drag & drop
            </span>
          </div>
        )}
      </div>

      {/* Remove button */}
      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange('', undefined)}
          className="btn btn-danger btn-sm"
          style={{ width: size, justifyContent: 'center' }}
        >
          <X size={12} /> Remove
        </button>
      )}

      {!value && (
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
          JPG · PNG · WebP · Max 5 MB
        </span>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: '0.76rem', color: 'var(--danger)',
          maxWidth: 180, textAlign: 'center',
        }}>
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
    </div>
  )
}
