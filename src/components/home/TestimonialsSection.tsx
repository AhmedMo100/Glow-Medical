'use client';

import { useEffect, useState } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';

interface ReviewImage {
  url: string; publicId?: string;
  type?: string; label?: string; order?: number;
}
interface Testimonial {
  id: number; name: string; review: string; rating: number;
  avatar?: string; isApproved: boolean; isFeatured: boolean;
  source?: string; treatmentDate?: string;
  images?: ReviewImage[];
}

/* ── Star renderer ──────────────────────────── */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? '#f59e0b' : '#e2e8f0'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Modal ──────────────────────────────────── */
function ReviewModal({ review, onClose }: { review: Testimonial; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', fn); };
  }, [onClose]);

  const date = review.treatmentDate
    ? new Date(review.treatmentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const beforeImgs = review.images?.filter(i => i.type === 'before') ?? [];
  const afterImgs  = review.images?.filter(i => i.type === 'after')  ?? [];
  const otherImgs  = review.images?.filter(i => i.type !== 'before' && i.type !== 'after') ?? [];

  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(8,30,60,.72)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.25rem',animation:'rvFade .2s ease' }}>
      <style>{`@keyframes rvFade{from{opacity:0}to{opacity:1}} @keyframes rvUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}`}</style>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--white)',borderRadius:'1.5rem',maxWidth:600,width:'100%',boxShadow:'0 32px 80px rgba(8,43,86,.28)',animation:'rvUp .25s ease',overflow:'hidden',maxHeight:'90vh',overflowY:'auto',position:'relative' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute',top:16,right:16,width:34,height:34,borderRadius:'50%',background:'rgba(0,0,0,.08)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',color:'var(--text-secondary)',zIndex:10,transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,.16)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,.08)')}>✕</button>

        {/* Header */}
        <div style={{ padding:'2rem 2rem 1.5rem',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'1rem' }}>
          <div style={{ width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),#1a4a7a)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'1.3rem',flexShrink:0 }}>
            {review.avatar
              ? <img src={review.avatar} alt={review.name} style={{ width:56,height:56,borderRadius:'50%',objectFit:'cover' }} />
              : review.name.charAt(0).toUpperCase()
            }
          </div>
          <div style={{ flex:1 }}>
            <h3 style={{ margin:0,fontFamily:'var(--font-heading)',fontSize:'1.15rem',color:'var(--navy-700)' }}>{review.name}</h3>
            <div style={{ display:'flex',alignItems:'center',gap:'.6rem',marginTop:'.3rem',flexWrap:'wrap' }}>
              <Stars rating={review.rating} size={15} />
              <span style={{ fontSize:'.78rem',fontWeight:700,color:'#f59e0b' }}>{review.rating}.0 / 5</span>
              {date && <span style={{ fontSize:'.75rem',color:'var(--text-muted)' }}>· {date}</span>}
              {review.source && <span style={{ fontSize:'.72rem',padding:'.15rem .55rem',background:'var(--beige-50)',border:'1px solid var(--border)',borderRadius:99,color:'var(--text-muted)' }}>{review.source}</span>}
            </div>
          </div>
        </div>

        {/* Review text */}
        <div style={{ padding:'1.5rem 2rem' }}>
          <p style={{ margin:0,fontSize:'.95rem',color:'var(--text-secondary)',lineHeight:1.8,fontStyle:'italic' }}>"{review.review}"</p>
        </div>

        {/* Before / After */}
        {(beforeImgs.length > 0 || afterImgs.length > 0) && (
          <div style={{ padding:'0 2rem 1.5rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem' }}>
            {beforeImgs.map((img,i) => (
              <div key={i}>
                <p style={{ margin:'0 0 .4rem',fontSize:'.73rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em' }}>Before</p>
                <img src={img.url} alt={img.label||'Before'} style={{ width:'100%',borderRadius:'.75rem',objectFit:'cover',maxHeight:200,display:'block' }} />
              </div>
            ))}
            {afterImgs.map((img,i) => (
              <div key={i}>
                <p style={{ margin:'0 0 .4rem',fontSize:'.73rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em' }}>After</p>
                <img src={img.url} alt={img.label||'After'} style={{ width:'100%',borderRadius:'.75rem',objectFit:'cover',maxHeight:200,display:'block' }} />
              </div>
            ))}
          </div>
        )}

        {/* Other images */}
        {otherImgs.length > 0 && (
          <div style={{ padding:'0 2rem 1.5rem',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'.75rem' }}>
            {otherImgs.map((img,i) => (
              <img key={i} src={img.url} alt={img.label||`Image ${i+1}`} style={{ width:'100%',borderRadius:'.75rem',objectFit:'cover',height:120,display:'block' }} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ padding:'0 2rem 2rem' }}>
          <a href="/book" style={{ display:'block',textAlign:'center',padding:'.78rem',background:'var(--accent)',color:'#fff',borderRadius:'var(--radius)',fontWeight:700,fontSize:'.9rem',textDecoration:'none',transition:'opacity .2s' }} onMouseEnter={e=>(e.currentTarget.style.opacity='.88')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
            Book Your Appointment
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Card ────────────────────────────────────── */
function ReviewCard({ review, onClick }: { review: Testimonial; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const hasImages = (review.images?.length ?? 0) > 0;
  const date = review.treatmentDate
    ? new Date(review.treatmentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)', borderRadius: '1.15rem', overflow: 'hidden',
        border: '1px solid var(--border)', cursor: 'pointer',
        boxShadow: hovered ? '0 14px 38px rgba(8,43,86,.12)' : '0 2px 14px rgba(8,43,86,.06)',
        transform: hovered ? 'translateY(-4px)' : '',
        transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Before/After preview image */}
      {hasImages && review.images![0] && (
        <div style={{ height: 160, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <img
            src={review.images![0].url}
            alt="Treatment result"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s', transform: hovered ? 'scale(1.05)' : '' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(8,43,86,.3) 0%,transparent 60%)' }} />
          {review.images!.length > 1 && (
            <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(8,43,86,.75)', backdropFilter: 'blur(4px)', color: '#fff', padding: '.18rem .55rem', borderRadius: 99, fontSize: '.68rem', fontWeight: 600 }}>
              +{review.images!.length - 1} more
            </span>
          )}
        </div>
      )}

      <div style={{ padding: '1.25rem 1.3rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {/* Stars */}
        <Stars rating={review.rating} />

        {/* Quote */}
        <p style={{
          margin: '.3rem 0 0', fontSize: '.87rem', color: 'var(--text-secondary)',
          lineHeight: 1.72, fontStyle: 'italic', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          "{review.review}"
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid var(--border)', gap: '.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#1a4a7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.8rem', fontWeight: 700, flexShrink: 0 }}>
              {review.avatar
                ? <img src={review.avatar} alt={review.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                : review.name.charAt(0).toUpperCase()
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.name}</p>
              {date && <p style={{ margin: 0, fontSize: '.7rem', color: 'var(--text-muted)' }}>{date}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexShrink: 0 }}>
            {review.source && (
              <span style={{ fontSize: '.68rem', padding: '.15rem .5rem', background: 'var(--beige-50)', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {review.source}
              </span>
            )}
            {hasImages && (
              <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--primary)' }}>
                Photos →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────── */
export default function TestimonialsSection() {
  const [reviews,  setReviews]  = useState<Testimonial[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/reviews?approved=true&featured=true&limit=20')
      .then(r => r.json())
      .then(d => setReviews(d.reviews ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !reviews.length) return null;

  /* average rating */
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="section" style={{ background: 'var(--white)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
          <SectionTitle
            label="Patient Stories"
            title="What Our Patients Say"
            description="Real experiences from the people who matter most — our patients."
            centered
          />

          {/* Average rating badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.75rem', marginTop: '1.5rem', padding: '.75rem 1.5rem', background: 'var(--beige-50)', border: '1px solid var(--border)', borderRadius: '3rem' }}>
            <Stars rating={5} size={18} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy-700)', fontFamily: 'var(--font-heading)' }}>{avg}</span>
            <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>average from {reviews.length} reviews</span>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} onClick={() => setSelected(r)} />
          ))}
        </div>
      </div>

      {selected && <ReviewModal review={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
