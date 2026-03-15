'use client'
// ============================================================
//  Language Switcher — used in dashboard header / settings
// ============================================================
import { useI18n, LOCALES } from '@/lib/i18n'

interface Props {
  variant?: 'pill'  // compact row of pills (default)
           | 'dropdown'  // dropdown select
           | 'icon'      // flag + abbreviation only
}

export default function LanguageSwitcher({ variant = 'pill' }: Props) {
  const { locale, setLocale } = useI18n()

  if (variant === 'dropdown') {
    return (
      <select
        value={locale}
        onChange={e => setLocale(e.target.value as any)}
        style={{
          padding:       '.4rem .75rem',
          borderRadius:  9,
          border:        '1px solid var(--border)',
          background:    'var(--surface)',
          color:         'var(--text)',
          fontSize:      '.875rem',
          cursor:        'pointer',
          fontFamily:    'inherit',
        }}
      >
        {LOCALES.map(l => (
          <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
        ))}
      </select>
    )
  }

  if (variant === 'icon') {
    const current = LOCALES.find(l => l.value === locale)!
    const other   = LOCALES.find(l => l.value !== locale)!
    return (
      <button
        onClick={() => setLocale(other.value)}
        title={`Switch to ${other.label}`}
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         '.35rem',
          padding:     '.3rem .65rem',
          borderRadius: 9,
          border:      '1px solid var(--border)',
          background:  'var(--surface)',
          cursor:      'pointer',
          fontSize:    '.8rem',
          fontWeight:  600,
          color:       'var(--text)',
          fontFamily:  'inherit',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{other.flag}</span>
        <span style={{ textTransform: 'uppercase' }}>{other.value}</span>
      </button>
    )
  }

  // Default: pill buttons
  return (
    <div style={{
      display:    'flex',
      gap:        '.25rem',
      background: 'var(--surface-2)',
      padding:    '.2rem',
      borderRadius: 10,
      border:     '1px solid var(--border)',
    }}>
      {LOCALES.map(l => (
        <button
          key={l.value}
          onClick={() => setLocale(l.value)}
          title={l.label}
          style={{
            padding:      '.3rem .65rem',
            borderRadius:  8,
            border:       'none',
            cursor:       'pointer',
            fontSize:     '.8rem',
            fontWeight:   locale === l.value ? 700 : 400,
            background:   locale === l.value ? 'var(--surface)' : 'transparent',
            color:        locale === l.value ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow:    locale === l.value ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
            fontFamily:   'inherit',
            transition:   'all .15s ease',
            whiteSpace:   'nowrap',
          }}
        >
          {l.flag} {l.value.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
