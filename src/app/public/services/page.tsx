'use client';

import { useEffect, useState } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';
import AppointmentBanner from '@/components/home/AppointmentBanner';

interface Category { id: number; name: string; color: string }
interface Service {
  id: number; name: string; slug: string;
  description?: string; shortDescription?: string;
  price: number; discountedPrice?: number; duration?: number;
  imageUrl?: string; isActive: boolean; isFeatured: boolean; order: number;
  category: Category;
  _count?: { appointmentServices: number };
}

/* ── Modal ───────────────────────────────────────────────── */
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
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:none} }
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
          maxHeight: '90vh', position: 'relative',
        }}
      >
        {service.imageUrl && (
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 340 }}>
            <img src={service.imageUrl} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(8,43,86,.5) 0%,transparent 55%)' }} />
            <div style={{ position: 'absolute', top: 16, left: 16, background: service.category.color || 'var(--primary)', color: '#fff', padding: '.28rem .8rem', borderRadius: 99, fontSize: '.72rem', fontWeight: 700 }}>
              {service.category.name}
            </div>
            {hasDiscount && <div style={{ position: 'absolute', top: 16, right: 16, background: '#ef4444', color: '#fff', padding: '.3rem .75rem', borderRadius: 99, fontSize: '.78rem', fontWeight: 800 }}>-{discount}% OFF</div>}
          </div>
        )}

        <div style={{ padding: '2.25rem 2rem', display: 'flex', flexDirection: 'column', gap: '.8rem', overflowY: 'auto' }}>
          <button onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--text-secondary)', zIndex: 10, transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,.16)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,.08)')}>✕</button>

          {!service.imageUrl && (
            <span style={{ alignSelf: 'flex-start', background: service.category.color || 'var(--primary)', color: '#fff', padding: '.22rem .72rem', borderRadius: 99, fontSize: '.72rem', fontWeight: 700 }}>
              {service.category.name}
            </span>
          )}

          <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--navy-700)', lineHeight: 1.25 }}>
            {service.name}
          </h2>

          {(service.description || service.shortDescription) && (
            <p style={{ margin: 0, fontSize: '.92rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              {service.description ?? service.shortDescription}
            </p>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            {service.duration && (
              <div style={{ flex: '1 1 110px', padding: '.8rem 1rem', borderRadius: '.85rem', background: 'var(--beige-50)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>⏱</p>
                <p style={{ margin: '.2rem 0 0', fontWeight: 700, fontSize: '.9rem', color: 'var(--navy-700)' }}>{service.duration} min</p>
                <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-muted)' }}>Duration</p>
              </div>
            )}
            {service._count && (
              <div style={{ flex: '1 1 110px', padding: '.8rem 1rem', borderRadius: '.85rem', background: 'var(--beige-50)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>📅</p>
                <p style={{ margin: '.2rem 0 0', fontWeight: 700, fontSize: '.9rem', color: 'var(--navy-700)' }}>{service._count.appointmentServices}+</p>
                <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-muted)' }}>Appointments</p>
              </div>
            )}
          </div>

          {/* Price block */}
          <div style={{ padding: '1rem 1.15rem', borderRadius: '1rem', background: 'linear-gradient(135deg,var(--navy-700) 0%,#1a4a7a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '.7rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em' }}>Session Price</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem', marginTop: '.2rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--beige-300)', fontFamily: 'var(--font-heading)' }}>{service.price.toLocaleString()} EGP</span>
                {hasDiscount && <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.3)', textDecoration: 'line-through' }}>{service.discountedPrice!.toLocaleString()}</span>}
              </div>
            </div>
            {hasDiscount && <span style={{ padding: '.3rem .9rem', background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: '.78rem', fontWeight: 700 }}>Save {discount}%</span>}
          </div>

          <a href="/book"
            style={{ display: 'block', textAlign: 'center', padding: '.85rem', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '.95rem', textDecoration: 'none', transition: 'opacity .2s,transform .15s', marginTop: '.1rem' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}>
            Book This Service
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Card ────────────────────────────────────────────────── */
function ServiceCard({ service, navy, onClick }: { service: Service; navy?: boolean; onClick: () => void }) {
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;

  return (
    <div onClick={onClick}
      style={{
        background: navy ? 'var(--navy-700)' : 'var(--white)',
        borderRadius: '1.15rem', overflow: 'hidden',
        boxShadow: navy ? '0 8px 32px rgba(8,43,86,.3)' : '0 2px 16px rgba(8,43,86,.07)',
        cursor: 'pointer', transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease',
        display: 'flex', flexDirection: 'column',
        border: navy ? '1px solid rgba(196,154,108,.2)' : '1px solid var(--border)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'; e.currentTarget.style.boxShadow = navy ? '0 20px 50px rgba(8,43,86,.4)' : '0 16px 40px rgba(8,43,86,.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = navy ? '0 8px 32px rgba(8,43,86,.3)' : '0 2px 16px rgba(8,43,86,.07)'; }}
    >
      {service.imageUrl ? (
        <div style={{ height: 190, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <img src={service.imageUrl} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s ease' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(8,43,86,.3) 0%,transparent 50%)' }} />
          <span style={{ position: 'absolute', top: 11, left: 11, background: service.category.color || 'var(--primary)', color: '#fff', padding: '.18rem .6rem', borderRadius: 99, fontSize: '.67rem', fontWeight: 700 }}>
            {service.category.name}
          </span>
          {hasDiscount && <span style={{ position: 'absolute', top: 11, right: 11, background: '#ef4444', color: '#fff', padding: '.18rem .55rem', borderRadius: 99, fontSize: '.67rem', fontWeight: 800 }}>OFFER</span>}
        </div>
      ) : (
        <div style={{ height: 7, background: service.category.color || 'var(--primary)' }} />
      )}

      <div style={{ padding: '1.2rem 1.25rem 1.35rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.28rem' }}>
        {!service.imageUrl && (
          <span style={{ alignSelf: 'flex-start', background: navy ? 'rgba(196,154,108,.18)' : 'rgba(8,43,86,.07)', color: navy ? 'var(--beige-300)' : (service.category.color || 'var(--primary)'), padding: '.17rem .6rem', borderRadius: 99, fontSize: '.67rem', fontWeight: 700 }}>
            {service.category.name}
          </span>
        )}
        <h3 style={{ margin: '.12rem 0 0', fontSize: '1.02rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: navy ? '#fff' : 'var(--navy-700)', lineHeight: 1.32 }}>
          {service.name}
        </h3>
        {(service.shortDescription || service.description) && (
          <p style={{ margin: '.15rem 0 0', fontSize: '.82rem', color: navy ? 'rgba(255,255,255,.75)' : 'var(--text-secondary)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {service.shortDescription ?? service.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.7rem' }}>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: navy ? 'var(--beige-300)' : 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
              {service.price.toLocaleString()} EGP
            </span>
            {hasDiscount && <p style={{ margin: 0, fontSize: '.7rem', color: navy ? 'rgba(255,255,255,.35)' : '#94a3b8', textDecoration: 'line-through' }}>{service.discountedPrice!.toLocaleString()}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
            {service.duration && <span style={{ fontSize: '.72rem', color: navy ? 'rgba(255,255,255,.5)' : 'var(--text-muted)', background: navy ? 'rgba(255,255,255,.1)' : 'var(--off-white)', border: navy ? '1px solid rgba(255,255,255,.12)' : '1px solid var(--border)', padding: '.2rem .55rem', borderRadius: 99 }}>⏱{service.duration}m</span>}
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: navy ? 'rgba(196,154,108,.22)' : 'var(--primary)', color: navy ? 'var(--beige-300)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.78rem', fontWeight: 700 }}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background: 'var(--white)', borderRadius: '1.15rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ height: 190, background: 'var(--surface-2)' }} />
      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[40, 75, 60].map((w, i) => <div key={i} style={{ height: i === 1 ? 16 : 12, background: 'var(--border)', borderRadius: 6, width: `${w}%` }} />)}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function ServicesPage() {
  const [services,   setServices]   = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [searchInput,setSearchInput]= useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [total,      setTotal]      = useState(0);
  const [selected,   setSelected]   = useState<Service | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/categories?active=true')
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ active: 'true', limit: '12', page: String(page) });
    if (search)     p.set('search', search);
    if (categoryId) p.set('categoryId', String(categoryId));
    fetch(`/api/dashboard/services?${p}`)
      .then(r => r.json())
      .then(d => { setServices(d.services ?? []); setPages(d.pages ?? 1); setTotal(d.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, categoryId, page]);

  const doSearch = () => { setSearch(searchInput.trim()); setPage(1); };
  const doClear  = () => { setSearch(''); setSearchInput(''); setCategoryId(null); setPage(1); };

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--navy-700)', padding: '9rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', right: '-4rem', top: '-4rem', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,154,108,.15) 0%,transparent 70%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="badge badge-white" style={{ marginBottom: '1rem' }}>Medical Services</span>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Comprehensive Care<br /><em style={{ color: 'var(--beige-300)' }}>Under One Roof</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', maxWidth: 520, margin: '1.5rem auto 0', fontSize: '1.05rem', lineHeight: 1.7 }}>
            From preventive care to complex treatment, our multidisciplinary team delivers seamless, expert healthcare.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <SectionTitle label="All Specialties" title="Our Medical Departments" centered />

          {/* ── Filter Card ── */}
          <div style={{ marginTop: '2.5rem', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 20px rgba(8,43,86,.07)' }}>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ flex: '1 1 220px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '1rem' }}>🔍</span>
                <input
                  type="text" value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  placeholder="Search services…"
                  style={{ width: '100%', padding: '.72rem .9rem .72rem 2.4rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '.9rem', outline: 'none', background: 'var(--off-white)', color: 'var(--text-primary)', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(8,43,86,.08)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Category dropdown */}
              <div style={{ flex: '0 1 210px', position: 'relative' }}>
                <select
                  value={categoryId ?? ''}
                  onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : null); setPage(1); }}
                  style={{ width: '100%', padding: '.72rem 2.2rem .72rem 1rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '.9rem', outline: 'none', background: 'var(--off-white)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8,43,86,.08)'; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <option value="">All Departments</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <span style={{ position: 'absolute', right: '.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '.7rem', color: 'var(--text-muted)' }}>▼</span>
              </div>

              <button onClick={doSearch}
                style={{ padding: '.72rem 1.6rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'opacity .2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Search
              </button>

              {(search || categoryId) && (
                <button onClick={doClear}
                  style={{ padding: '.72rem 1.1rem', borderRadius: 'var(--radius)', background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border)', fontSize: '.85rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  ✕ Clear
                </button>
              )}
            </div>

            {!loading && (
              <p style={{ margin: '.85rem 0 0', fontSize: '.82rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> {total === 1 ? 'service' : 'services'}
                {categoryId && <> in <strong style={{ color: 'var(--navy-700)' }}>"{categories.find(c => c.id === categoryId)?.name}"</strong></>}
                {search && <> matching <strong style={{ color: 'var(--navy-700)' }}>"{search}"</strong></>}
              </p>
            )}
          </div>

          {/* Grid */}
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            ) : services.length ? (
              services.map((s, i) => <ServiceCard key={s.id} service={s} navy={i % 5 === 1} onClick={() => setSelected(s)} />)
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '3rem', margin: '0 0 .75rem' }}>🔍</p>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 .4rem' }}>No services found</p>
                <p style={{ fontSize: '.9rem', margin: '0 0 1.5rem' }}>Try a different keyword or clear the filters</p>
                <button onClick={doClear} style={{ padding: '.6rem 1.4rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear Filters</button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '.45rem 1rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: page === 1 ? 'default' : 'pointer', fontSize: '.84rem', fontFamily: 'inherit', opacity: page === 1 ? .5 : 1 }}>← Prev</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 38, height: 38, borderRadius: 'var(--radius)', border: `1.5px solid ${page === n ? 'var(--primary)' : 'var(--border)'}`, background: page === n ? 'var(--primary)' : 'var(--white)', color: page === n ? '#fff' : 'var(--text-secondary)', fontWeight: page === n ? 700 : 400, cursor: 'pointer', fontSize: '.84rem', fontFamily: 'inherit', transition: 'all .15s' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                style={{ padding: '.45rem 1rem', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: page === pages ? 'default' : 'pointer', fontSize: '.84rem', fontFamily: 'inherit', opacity: page === pages ? .5 : 1 }}>Next →</button>
            </div>
          )}
        </div>
      </section>

      {selected && <ServiceModal service={selected} onClose={() => setSelected(null)} />}
      <AppointmentBanner />
    </>
  );
}
