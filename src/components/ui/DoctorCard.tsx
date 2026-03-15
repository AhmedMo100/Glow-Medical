'use client'
// components/ui/DoctorCard.tsx
// Clean info card for public team page — no action buttons

import { Instagram, Linkedin, Award, Briefcase } from 'lucide-react'

interface DoctorCardProps {
  doctor: {
    id            : number
    name          : string
    nameEn?       : string | null
    photo?        : string | null
    specialization?: string | null
    bio?          : string | null
    qualifications?: string | null
    experience?   : number | null
    staffType?    : string | null
    instagramUrl? : string | null
    linkedinUrl?  : string | null
  }
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const {
    name, nameEn, photo, specialization, bio,
    qualifications, experience, instagramUrl, linkedinUrl,
  } = doctor

  return (
    <div style={{
      background   : 'var(--surface)',
      borderRadius : 'var(--radius-lg)',
      overflow     : 'hidden',
      border       : '1px solid var(--border)',
      transition   : 'box-shadow 0.2s, transform 0.2s',
      display      : 'flex',
      flexDirection: 'column',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = 'var(--shadow-lg)'
        el.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = ''
        el.style.transform = ''
      }}
    >
      {/* ── Photo ── */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden', background: 'var(--navy-700)' }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div style={{
          position  : 'absolute',
          bottom    : 0, left: 0, right: 0,
          height    : '50%',
          background: 'linear-gradient(to top, rgba(8,43,86,0.85), transparent)',
        }} />

        {/* Name overlay on photo */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem' }}>
          <h3 style={{
            margin     : 0,
            color      : '#fff',
            fontSize   : '1.05rem',
            fontWeight : 700,
            fontFamily : 'var(--font-heading)',
            lineHeight : 1.3,
          }}>{name}</h3>
          {nameEn && (
            <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
              {nameEn}
            </p>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '1rem 1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

        {/* Specialization badge */}
        {specialization && (
          <span style={{
            display    : 'inline-block',
            padding    : '3px 10px',
            borderRadius: 20,
            fontSize   : '0.75rem',
            fontWeight : 700,
            background : 'var(--primary-light, rgba(8,43,86,0.08))',
            color      : 'var(--primary)',
            border     : '1px solid rgba(8,43,86,0.15)',
            alignSelf  : 'flex-start',
          }}>
            {specialization}
          </span>
        )}

        {/* Bio */}
        {bio && (
          <p style={{
            margin  : 0,
            fontSize: '0.83rem',
            color   : 'var(--text-muted)',
            lineHeight: 1.6,
            display : '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {bio}
          </p>
        )}

        {/* Info row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
          {experience !== null && experience !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Briefcase size={12} style={{ color: 'var(--accent, #c49a6c)', flexShrink: 0 }} />
              <span>{experience} years of experience</span>
            </div>
          )}
          {qualifications && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Award size={12} style={{ color: 'var(--accent, #c49a6c)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{qualifications}</span>
            </div>
          )}
        </div>

        {/* Social links — icon only, no text */}
        {(instagramUrl || linkedinUrl) && (
          <div style={{
            display    : 'flex',
            gap        : 8,
            paddingTop : '0.65rem',
            borderTop  : '1px solid var(--border)',
            marginTop  : '0.25rem',
          }}>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display        : 'flex',
                  alignItems     : 'center',
                  justifyContent : 'center',
                  width          : 32,
                  height         : 32,
                  borderRadius   : '50%',
                  background     : 'rgba(225,48,108,0.08)',
                  color          : '#e1306c',
                  border         : '1px solid rgba(225,48,108,0.2)',
                  textDecoration : 'none',
                  transition     : 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(225,48,108,0.18)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(225,48,108,0.08)'}
              >
                <Instagram size={14} />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display        : 'flex',
                  alignItems     : 'center',
                  justifyContent : 'center',
                  width          : 32,
                  height         : 32,
                  borderRadius   : '50%',
                  background     : 'rgba(0,119,181,0.08)',
                  color          : '#0077b5',
                  border         : '1px solid rgba(0,119,181,0.2)',
                  textDecoration : 'none',
                  transition     : 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,119,181,0.18)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,119,181,0.08)'}
              >
                <Linkedin size={14} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
