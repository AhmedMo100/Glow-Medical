'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, X, Menu, Sparkles } from 'lucide-react';

type Service = { id: number; name: string; slug: string; categoryId: number | null };

const STATIC_LINKS = [
  { label: 'Home',    href: '/' },
  { label: 'About',   href: '/public/about' },
  { label: 'Team',    href: '/public/team' },
  { label: 'Blog',    href: '/public/blog' },
  { label: 'Contact', href: '/public/contact' },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [dropdown,   setDropdown]   = useState<string | null>(null);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const [services,   setServices]   = useState<Service[]>([]);
  const pathname = usePathname();
  const ddTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── fetch services ── */
  useEffect(() => {
    fetch('/api/dashboard/services?limit=50')
      .then(r => r.json())
      .then(d => setServices(d.services ?? []))
      .catch(() => {});
  }, []);

  /* ── close drawer on route change ── */
  useEffect(() => { setMenuOpen(false); setDropdown(null); }, [pathname]);

  /* ── lock scroll when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const openDD  = (label: string) => {
    if (ddTimer.current) clearTimeout(ddTimer.current);
    setDropdown(label);
  };
  const closeDD = () => {
    ddTimer.current = setTimeout(() => setDropdown(null), 120);
  };

  /* ── NAV LINKS with dynamic services ── */
  const NAV_LINKS = [
    STATIC_LINKS[0],
    STATIC_LINKS[1],
    {
      label: 'Services',
      href: '/public/services',
      children: services.length > 0
        ? services.slice(0, 8).map(s => ({ label: s.name, href: `/public/services#service-${s.id}` }))
        : [{ label: 'View All Services', href: '/public/services' }],
    },
    ...STATIC_LINKS.slice(2),
  ];

  const textColor = (active: boolean) =>
    scrolled
      ? active ? 'var(--navy-600)' : 'var(--charcoal)'
      : active ? '#fff' : 'rgba(255,255,255,0.88)';

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        transition: 'all 0.3s ease',
        ...(scrolled
          ? { background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(18px)', boxShadow: '0 2px 24px rgba(8,43,86,0.09)', borderBottom: '1px solid rgba(196,154,108,0.25)' }
          : { background: 'transparent' }
        ),
      }}>
        <nav style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72,
        }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--navy-600, #082b56)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <rect x="10" y="4" width="4" height="16" rx="2" fill="#c49a6c" />
                <rect x="4" y="10" width="16" height="4" rx="2" fill="#c49a6c" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.35rem', fontWeight: 700, color: scrolled ? 'var(--navy-700, #082b56)' : '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Glow <span style={{ color: '#c49a6c', fontWeight: 400 }}>Medical</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <ul style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', listStyle: 'none', margin: 0, padding: 0 }}
              className="hidden-mobile">
            {NAV_LINKS.map(link => (
              <li key={link.label} style={{ position: 'relative' }}
                  onMouseEnter={() => (link as any).children && openDD(link.label)}
                  onMouseLeave={() => (link as any).children && closeDD()}>
                <Link href={link.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.2rem',
                  padding: '0.5rem 0.8rem', borderRadius: 8,
                  fontSize: '0.875rem', fontWeight: isActive(link.href) ? 600 : 450,
                  color: textColor(isActive(link.href)),
                  transition: 'all 0.2s', textDecoration: 'none',
                  borderBottom: isActive(link.href) ? '2px solid #c49a6c' : '2px solid transparent',
                }}>
                  {link.label}
                  {(link as any).children && (
                    <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: dropdown === link.label ? 'rotate(-180deg)' : 'none' }} />
                  )}
                </Link>

                {/* Dropdown */}
                {(link as any).children && dropdown === link.label && (
                  <div
                    onMouseEnter={() => openDD(link.label)}
                    onMouseLeave={closeDD}
                    style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)',
                      minWidth: 220, background: '#fff', borderRadius: 14,
                      boxShadow: '0 16px 48px rgba(8,43,86,0.14)', border: '1px solid rgba(196,154,108,0.2)',
                      padding: '0.5rem', animation: 'ddFadeUp 0.18s ease',
                      zIndex: 300,
                    }}>
                    {(link as any).children.map((child: any) => (
                      <Link key={child.label} href={child.href} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '0.52rem 0.85rem', borderRadius: 8,
                        fontSize: '0.84rem', color: '#374151',
                        transition: 'all 0.15s', textDecoration: 'none',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f4ff'; (e.currentTarget as HTMLElement).style.color = '#082b56'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c49a6c', flexShrink: 0 }} />
                        {child.label}
                      </Link>
                    ))}
                    <div style={{ margin: '0.3rem 0.85rem 0.4rem', paddingTop: '0.4rem', borderTop: '1px solid #f3e8d8' }}>
                      <Link href="/public/services" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#c49a6c', fontWeight: 600, textDecoration: 'none' }}>
                        <Sparkles size={11} /> View All Services →
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* ── CTA + Hamburger ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/public/appointment" className="btn btn-accent btn-sm hidden-mobile" style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              Book Appointment
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="show-mobile"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: scrolled ? '#082b56' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Drawer Overlay ── */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 190,
          background: 'rgba(8,43,86,0.35)', backdropFilter: 'blur(3px)',
          opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* ── Mobile Drawer ── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 195,
        width: 'min(320px, 88vw)',
        background: '#fff',
        boxShadow: '-8px 0 40px rgba(8,43,86,0.15)',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', borderBottom: '1px solid #f3e8d8' }}>
          <Link href="/public/home" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#082b56', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
                <rect x="10" y="4" width="4" height="16" rx="2" fill="#c49a6c" />
                <rect x="4" y="10" width="16" height="4" rx="2" fill="#c49a6c" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.15rem', fontWeight: 700, color: '#082b56' }}>
              Glow <span style={{ color: '#c49a6c', fontWeight: 400 }}>Medical</span>
            </span>
          </Link>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem' }}>
          {NAV_LINKS.map(link => (
            <div key={link.label}>
              {(link as any).children ? (
                <>
                  <button
                    onClick={() => setMobileServices(o => !o)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.85rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 10, fontSize: '0.925rem', fontWeight: 500, color: '#1f2937', fontFamily: 'inherit' }}>
                    Services
                    <ChevronDown size={15} style={{ transition: 'transform 0.2s', transform: mobileServices ? 'rotate(-180deg)' : 'none', color: '#6b7280' }} />
                  </button>
                  <div style={{ overflow: 'hidden', maxHeight: mobileServices ? 500 : 0, transition: 'max-height 0.3s ease' }}>
                    <div style={{ paddingLeft: '1rem', paddingBottom: '0.25rem' }}>
                      {(link as any).children.map((child: any) => (
                        <Link key={child.label} href={child.href} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.55rem 0.85rem', borderRadius: 8, fontSize: '0.855rem', color: '#4b5563', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#082b56'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4b5563'}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c49a6c', flexShrink: 0 }} />
                          {child.label}
                        </Link>
                      ))}
                      <Link href="/public/services" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.55rem 0.85rem', fontSize: '0.8rem', color: '#c49a6c', fontWeight: 600, textDecoration: 'none' }}>
                        <Sparkles size={11} /> View All →
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <Link href={link.href} onClick={() => setMenuOpen(false)} style={{
                  display: 'block', padding: '0.75rem 0.85rem', borderRadius: 10,
                  fontSize: '0.925rem', fontWeight: isActive(link.href) ? 600 : 450,
                  color: isActive(link.href) ? '#082b56' : '#1f2937',
                  background: isActive(link.href) ? '#f0f4ff' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}>
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Drawer CTA */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f3e8d8' }}>
          <Link href="/public/appointment" onClick={() => setMenuOpen(false)}
            className="btn btn-accent"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem' }}>
            Book Appointment
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes ddFadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .hidden-mobile { display: flex !important; }
        .show-mobile   { display: none  !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
