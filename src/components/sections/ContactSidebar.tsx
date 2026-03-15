'use client'
// components/contact/ContactSidebar.tsx

import {
  Phone, Mail, MapPin, Clock,
  Instagram, Facebook, MessageCircle, Sparkles,
} from 'lucide-react'

function InfoCard({ icon: Icon, label, lines, href, accent }: {
  icon: React.FC<any>; label: string; lines: string[]
  href?: string; accent: string
}) {
  const inner = (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '1rem 1.15rem',
        background: 'rgba(255,255,255,0.055)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14, transition: 'background 0.15s', textDecoration: 'none',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.055)' }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color={accent} />
      </div>
      <div>
        <p style={{ margin: '0 0 3px', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
        {lines.map((l, i) => (
          <p key={i} style={{ margin: 0, fontSize: '0.84rem', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{l}</p>
        ))}
      </div>
    </div>
  )
  return href
    ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>{inner}</a>
    : inner
}

export default function ContactSidebar() {
  return (
    <aside style={{
      background: '#082b56', borderRadius: 20,
      padding: '1.75rem 1.5rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
      position: 'sticky', top: 24,
    }}>
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
          Contact Information
        </h3>
        <p style={{ margin: 0, fontSize: '0.79rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
          Reach us directly through any of the channels below.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <InfoCard icon={Phone}         label="Phone"    lines={['01000000000']}                         href="tel:01000000000"             accent="#4ade80" />
        <InfoCard icon={MessageCircle} label="WhatsApp" lines={['01000000000']}                         href="https://wa.me/201000000000"  accent="#25d366" />
        <InfoCard icon={Mail}          label="Email"    lines={['info@glowmedical.com']}                 href="mailto:info@glowmedical.com" accent="#60a5fa" />
        <InfoCard icon={MapPin}        label="Address"  lines={['123 Tahrir St, Cairo, Egypt']}          href="https://maps.google.com"     accent="#f87171" />
        <InfoCard icon={Clock}         label="Hours"    lines={['Mon – Sat: 10:00 AM – 9:00 PM', 'Sunday: Closed']}                        accent="#fbbf24" />
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

      <div>
        <p style={{ margin: '0 0 0.7rem', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Follow Us
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { Icon: Instagram,     href: 'https://instagram.com/glowmedical', color: '#e1306c', label: 'Instagram' },
            { Icon: Facebook,      href: 'https://facebook.com/glowmedical',  color: '#1877f2', label: 'Facebook'  },
            { Icon: MessageCircle, href: 'https://wa.me/201000000000',        color: '#25d366', label: 'WhatsApp'  },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
              style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}20`, border: `1px solid ${s.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = `${s.color}38`)}
              onMouseLeave={e => (e.currentTarget.style.background = `${s.color}20`)}
            >
              <s.Icon size={18} color={s.color} />
            </a>
          ))}
        </div>
      </div>

      <a href="/book"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0.88rem', background: '#c49a6c', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', transition: 'opacity 0.15s', marginTop: '0.25rem' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <Sparkles size={15} /> Book an Appointment
      </a>
    </aside>
  )
}
