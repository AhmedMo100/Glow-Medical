'use client';

import { useEffect, useState } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';

interface Service {
  id: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  duration?: number;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  category: { id: number; name: string; color: string };
  _count?: { appointmentServices: number };
}

/* ── Modal ─────────────────────────────────────────────── */
function ServiceModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;
  const discount    = hasDiscount ? Math.round((1 - service.discountedPrice! / service.price) * 100) : 0;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,30,60,0.72)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.25rem', animation: 'fadeIn .2s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(28px) scale(.97) } to { opacity:1; transform:none } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)', borderRadius: '1.5rem',
          maxWidth: 780, width: '100%', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(8,43,86,.28)',
          animation: 'slideUp .25s ease',
          display: 'grid',
          gridTemplateColumns: service.imageUrl ? '1fr 1fr' : '1fr',
          maxHeight: '90vh',
        }}
      >
        {/* Left — Image */}
        {service.imageUrl && (
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 340 }}>
            <img
              src={service.imageUrl} alt={service.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,43,86,.5) 0%, transparent 55%)' }} />
            {/* Category badge */}
            <div style={{
              position: 'absolute', top: 16, left: 16,
              background: service.category.color || 'var(--primary)',
              color: '#fff', padding: '.28rem .8rem', borderRadius: 99,
              fontSize: '.72rem', fontWeight: 700, letterSpacing: '.04em',
              boxShadow: '0 2px 8px rgba(0,0,0,.2)',
            }}>
              {service.category.name}
            </div>
            {/* Discount badge */}
            {hasDiscount && (
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: '#ef4444', color: '#fff',
                padding: '.3rem .75rem', borderRadius: 99,
                fontSize: '.78rem', fontWeight: 800,
                boxShadow: '0 2px 8px rgba(239,68,68,.4)',
              }}>
                -{discount}% OFF
              </div>
            )}
          </div>
        )}

        {/* Right — Content */}
        <div style={{ padding: '2.25rem 2rem', display: 'flex', flexDirection: 'column', gap: '.8rem', overflowY: 'auto' }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(0,0,0,.08)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', color: 'var(--text-secondary)', transition: 'background .15s',
              zIndex: 10,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,.08)')}
          >✕</button>

          {/* No image — show category here */}
          {!service.imageUrl && (
            <span style={{
              alignSelf: 'flex-start',
              background: service.category.color || 'var(--primary)',
              color: '#fff', padding: '.22rem .72rem', borderRadius: 99,
              fontSize: '.72rem', fontWeight: 700,
            }}>
              {service.category.name}
            </span>
          )}

          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--navy-700)', lineHeight: 1.25 }}>
              {service.name}
            </h2>
          </div>

          {(service.description || service.shortDescription) && (
            <p style={{ margin: 0, fontSize: '.92rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              {service.description ?? service.shortDescription}
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginTop: '.25rem' }}>
            {service.duration && (
              <div style={{
                flex: '1 1 110px', padding: '.8rem 1rem', borderRadius: '.85rem',
                background: 'var(--beige-50)', border: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>⏱</p>
                <p style={{ margin: '.2rem 0 0', fontWeight: 700, fontSize: '.9rem', color: 'var(--navy-700)' }}>{service.duration} min</p>
                <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-muted)' }}>Duration</p>
              </div>
            )}
            {service._count && (
              <div style={{
                flex: '1 1 110px', padding: '.8rem 1rem', borderRadius: '.85rem',
                background: 'var(--beige-50)', border: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>📅</p>
                <p style={{ margin: '.2rem 0 0', fontWeight: 700, fontSize: '.9rem', color: 'var(--navy-700)' }}>{service._count.appointmentServices}+</p>
                <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-muted)' }}>Appointments</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div style={{
            padding: '1rem 1.15rem', borderRadius: '1rem',
            background: 'linear-gradient(135deg, var(--navy-700) 0%, #1a4a7a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '.72rem', color: 'rgba(255,255,255,.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Session Price</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem', marginTop: '.2rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--beige-300)', fontFamily: 'var(--font-heading)' }}>
                  {service.price.toLocaleString()} EGP
                </span>
                {hasDiscount && (
                  <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.35)', textDecoration: 'line-through' }}>
                    {service.discountedPrice!.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            {hasDiscount && (
              <span style={{ padding: '.3rem .9rem', background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: '.78rem', fontWeight: 700 }}>
                Save {discount}%
              </span>
            )}
          </div>

          {/* CTA */}
          <div style={{ marginTop: '.25rem' }}>
            <a href="/book"
              style={{
                display: 'block', textAlign: 'center',
                padding: '.85rem', background: 'var(--accent)', color: '#fff',
                borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '.95rem',
                textDecoration: 'none', transition: 'opacity .2s, transform .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
            >
              Book This Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────── */
function ServiceCard({ service, navy, onClick }: { service: Service; navy?: boolean; onClick: () => void }) {
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;
  const bg      = navy ? 'var(--navy-700)' : 'var(--white)';
  const textCol = navy ? '#fff' : 'var(--navy-700)';
  const secCol  = navy ? 'rgba(255,255,255,.8)' : 'var(--text-secondary)';
  const mutedCol = navy ? 'rgba(255,255,255,.5)' : 'var(--text-muted)';

  return (
    <div
      onClick={onClick}
      style={{
        background: bg, borderRadius: '1.15rem', overflow: 'hidden',
        boxShadow: navy ? '0 8px 32px rgba(8,43,86,.3)' : '0 2px 16px rgba(8,43,86,.07)',
        cursor: 'pointer', transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease',
        display: 'flex', flexDirection: 'column',
        border: navy ? '1px solid rgba(196,154,108,.2)' : '1px solid var(--border)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
        e.currentTarget.style.boxShadow = navy ? '0 20px 50px rgba(8,43,86,.4)' : '0 16px 40px rgba(8,43,86,.14)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = navy ? '0 8px 32px rgba(8,43,86,.3)' : '0 2px 16px rgba(8,43,86,.07)';
      }}
    >
      {/* Image */}
      {service.imageUrl ? (
        <div style={{ height: 195, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <img
            src={service.imageUrl} alt={service.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s ease' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,43,86,.35) 0%, transparent 50%)' }} />
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: service.category.color || 'var(--primary)',
            color: '#fff', padding: '.2rem .65rem', borderRadius: 99,
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.04em',
            boxShadow: '0 2px 6px rgba(0,0,0,.2)',
          }}>
            {service.category.name}
          </span>
          {hasDiscount && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              background: '#ef4444', color: '#fff',
              padding: '.2rem .6rem', borderRadius: 99, fontSize: '.68rem', fontWeight: 800,
            }}>OFFER</span>
          )}
        </div>
      ) : (
        /* No image — colored header band */
        <div style={{
          height: 8, flexShrink: 0,
          background: service.category.color || 'var(--primary)',
        }} />
      )}

      {/* Body */}
      <div style={{ padding: '1.2rem 1.3rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
        {!service.imageUrl && (
          <span style={{
            alignSelf: 'flex-start',
            background: navy ? 'rgba(196,154,108,.18)' : (service.category.color ? service.category.color + '22' : 'rgba(8,43,86,.06)'),
            color: navy ? 'var(--beige-300)' : (service.category.color || 'var(--primary)'),
            padding: '.18rem .62rem', borderRadius: 99, fontSize: '.68rem', fontWeight: 700,
          }}>
            {service.category.name}
          </span>
        )}

        <h3 style={{ margin: '.15rem 0 0', fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: textCol, lineHeight: 1.32 }}>
          {service.name}
        </h3>

        {(service.shortDescription || service.description) && (
          <p style={{
            margin: '.18rem 0 0', fontSize: '.83rem', color: secCol, lineHeight: 1.65,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1,
          }}>
            {service.shortDescription ?? service.description}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.75rem', flexWrap: 'wrap', gap: '.35rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.12rem', fontWeight: 800, color: navy ? 'var(--beige-300)' : 'var(--accent)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {service.price.toLocaleString()} EGP
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '.72rem', color: navy ? 'rgba(255,255,255,.38)' : '#94a3b8', textDecoration: 'line-through', lineHeight: 1.4 }}>
                {service.discountedPrice!.toLocaleString()} EGP
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            {service.duration && (
              <span style={{
                fontSize: '.75rem', color: mutedCol,
                background: navy ? 'rgba(255,255,255,.1)' : 'var(--off-white)',
                border: navy ? '1px solid rgba(255,255,255,.12)' : '1px solid var(--border)',
                padding: '.22rem .6rem', borderRadius: 99, fontWeight: 500,
              }}>
                ⏱ {service.duration}m
              </span>
            )}
            <span style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: navy ? 'rgba(196,154,108,.2)' : 'var(--primary)',
              color: navy ? 'var(--beige-300)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.8rem', fontWeight: 700,
              transition: 'transform .2s',
            }}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section ───────────────────────────────────────────── */
export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Service | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/services?active=true&limit=20')
      .then(r => r.json())
      .then(d => setServices((d.services ?? []).filter((s: Service) => s.isFeatured)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!services.length) return null;

  return (
    <section className="section" style={{ background: 'var(--off-white)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <SectionTitle
            label="What We Offer"
            title="Specialised Medical<br/>Services for You"
            description="From routine check-ups to complex procedures, our team of specialists delivers comprehensive care under one roof."
          />
          <Button href="/public/services" variant="outline">View All Services</Button>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} navy={i === 1 || i === 4} onClick={() => setSelected(s)} />
          ))}
        </div>
      </div>

      {selected && <ServiceModal service={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
