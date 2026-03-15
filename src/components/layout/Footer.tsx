"use client"

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';

const FOOTER_LINKS = {
  company: [
    { label: 'About Us',    href: '/public/about' },
    { label: 'Our Doctors', href: '/public/doctors' },
    { label: 'Services',    href: '/public/services' },
    { label: 'Blog',        href: '/public/blog' },
    { label: 'Contact',     href: '/public/contact' },
    { label: 'FAQ',     href: '/public/faq' },
  ],
  services: [
    { label: 'Cardiology',    href: '/public/services#cardiology' },
    { label: 'Neurology',     href: '/public/services#neurology' },
    { label: 'Dermatology',   href: '/public/services#dermatology' },
    { label: 'Orthopedics',   href: '/public/services#orthopedics' },
    { label: 'Ophthalmology', href: '/public/services#ophthalmology' },
    { label: 'Pediatrics',    href: '/public/services#pediatrics' },
  ],
};

const SOCIAL = [
  { icon: Facebook,  href: '#', label: 'Facebook' },
  { icon: Twitter,   href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin,  href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--navy-800)', color: 'rgba(255,255,255,0.75)' }}>
      {/* Main Footer */}
      <div className="container" style={{ padding: '5rem var(--container-x) 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--beige-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <rect x="10" y="4" width="4" height="16" rx="2" fill="white" />
                  <rect x="4" y="10" width="16" height="4" rx="2" fill="white" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                Glow <span style={{ color: 'var(--beige-300)', fontWeight: 400 }}>Medical</span>
              </span>
            </Link>

            <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', marginTop: 0 }}>
              Dedicated to elevating healthcare through compassion, innovation, and excellence. Your wellness is our purpose.
            </p>

            {/* Social */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} style={{
                  width: 36, height: 36,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.6)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--beige-500)'; e.currentTarget.style.borderColor = 'var(--beige-500)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 style={{ color: '#fff', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
              Quick Links
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {FOOTER_LINKS.company.map(l => (
                <li key={l.label}>
                  <Link href={l.href} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--beige-300)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    <ArrowRight size={12} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h5 style={{ color: '#fff', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
              Our Services
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {FOOTER_LINKS.services.map(l => (
                <li key={l.label}>
                  <Link href={l.href} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--beige-300)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    <ArrowRight size={12} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 style={{ color: '#fff', marginBottom: '1.2rem', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
              Contact Us
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: MapPin, text: '123 Wellness Blvd, Cairo, Egypt 11511' },
                { icon: Phone, text: '+1 (234) 567-890', href: 'tel:+1234567890' },
                { icon: Mail,  text: 'hello@glowmedical.com', href: 'mailto:hello@glowmedical.com' },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Icon size={16} style={{ color: 'var(--beige-400)', flexShrink: 0, marginTop: '2px' }} />
                  {href ? (
                    <a href={href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', transition: 'color 0.2s' }}
                       onMouseEnter={e => e.currentTarget.style.color = 'var(--beige-300)'}
                       onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >{text}</a>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container" style={{ padding: '1.2rem var(--container-x)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            © {year} Glow Medical. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Sitemap'].map(l => (
              <Link key={l} href="#" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--beige-300)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
