'use client';

import { useEffect, useState } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';
import AppointmentBanner from '@/components/home/AppointmentBanner';

interface ReviewImage { url: string; publicId?: string; type?: string; label?: string; order?: number; }
interface Testimonial {
  id: number; name: string; review: string; rating: number;
  avatar?: string; isApproved: boolean; isFeatured: boolean;
  source?: string; treatmentDate?: string; images?: ReviewImage[];
}

/* ── Stars ──────────────────────────────────── */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display:'flex',gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i<=rating?'#f59e0b':'#e2e8f0'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

/* ── Modal ──────────────────────────────────── */
function ReviewModal({ review, onClose }: { review: Testimonial; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
  }, [onClose]);

  const date = review.treatmentDate
    ? new Date(review.treatmentDate).toLocaleDateString('en-US', { month:'long', year:'numeric' })
    : null;
  const beforeImgs = review.images?.filter(i => i.type==='before') ?? [];
  const afterImgs  = review.images?.filter(i => i.type==='after')  ?? [];
  const otherImgs  = review.images?.filter(i => i.type!=='before'&&i.type!=='after') ?? [];

  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(8,30,60,.72)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.25rem',animation:'rvFade .2s ease' }}>
      <style>{`@keyframes rvFade{from{opacity:0}to{opacity:1}}@keyframes rvUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}`}</style>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--white)',borderRadius:'1.5rem',maxWidth:600,width:'100%',boxShadow:'0 32px 80px rgba(8,43,86,.28)',animation:'rvUp .25s ease',overflow:'hidden',maxHeight:'90vh',overflowY:'auto',position:'relative' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute',top:16,right:16,width:34,height:34,borderRadius:'50%',background:'rgba(0,0,0,.08)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',color:'var(--text-secondary)',zIndex:10,transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,.16)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,.08)')}>✕</button>

        {/* Header */}
        <div style={{ padding:'2rem 2rem 1.5rem',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'1rem' }}>
          <div style={{ width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),#1a4a7a)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'1.3rem',flexShrink:0,overflow:'hidden' }}>
            {review.avatar
              ? <img src={review.avatar} alt={review.name} style={{ width:56,height:56,objectFit:'cover' }} />
              : review.name.charAt(0).toUpperCase()
            }
          </div>
          <div style={{ flex:1,minWidth:0 }}>
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
          <p style={{ margin:0,fontSize:'.98rem',color:'var(--text-secondary)',lineHeight:1.8,fontStyle:'italic' }}>"{review.review}"</p>
        </div>

        {/* Before / After */}
        {(beforeImgs.length>0||afterImgs.length>0) && (
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
            {otherImgs.map((img,i) => <img key={i} src={img.url} alt={img.label||`Image ${i+1}`} style={{ width:'100%',borderRadius:'.75rem',objectFit:'cover',height:120,display:'block' }} />)}
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
  const [hov, setHov] = useState(false);
  const hasImages = (review.images?.length ?? 0) > 0;
  const date = review.treatmentDate
    ? new Date(review.treatmentDate).toLocaleDateString('en-US', { month:'short', year:'numeric' })
    : null;

  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'var(--white)',borderRadius:'1.15rem',overflow:'hidden',border:'1px solid var(--border)',cursor:'pointer',display:'flex',flexDirection:'column',boxShadow:hov?'0 14px 38px rgba(8,43,86,.12)':'0 2px 14px rgba(8,43,86,.06)',transform:hov?'translateY(-4px)':'',transition:'transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .28s ease' }}>

      {/* Image preview */}
      {hasImages && review.images![0] && (
        <div style={{ height:160,overflow:'hidden',position:'relative',flexShrink:0 }}>
          <img src={review.images![0].url} alt="Treatment" style={{ width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform .45s',transform:hov?'scale(1.05)':'' }} />
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(8,43,86,.3) 0%,transparent 60%)' }} />
          {review.images!.length > 1 && (
            <span style={{ position:'absolute',bottom:10,right:10,background:'rgba(8,43,86,.75)',backdropFilter:'blur(4px)',color:'#fff',padding:'.18rem .55rem',borderRadius:99,fontSize:'.68rem',fontWeight:600 }}>
              +{review.images!.length-1} more
            </span>
          )}
          {(review.images![0].type==='before'||review.images![0].type==='after') && (
            <span style={{ position:'absolute',bottom:10,left:10,background:review.images![0].type==='after'?'rgba(16,185,129,.85)':'rgba(239,68,68,.75)',backdropFilter:'blur(4px)',color:'#fff',padding:'.18rem .55rem',borderRadius:99,fontSize:'.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em' }}>
              {review.images![0].type}
            </span>
          )}
        </div>
      )}

      <div style={{ padding:'1.25rem 1.3rem 1.4rem',flex:1,display:'flex',flexDirection:'column',gap:'.4rem' }}>
        <Stars rating={review.rating} />
        <p style={{ margin:'.3rem 0 0',fontSize:'.87rem',color:'var(--text-secondary)',lineHeight:1.72,fontStyle:'italic',flex:1,display:'-webkit-box',WebkitLineClamp:4,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
          "{review.review}"
        </p>

        {/* Footer */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'.75rem',paddingTop:'.75rem',borderTop:'1px solid var(--border)',gap:'.5rem' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'.55rem',minWidth:0 }}>
            <div style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),#1a4a7a)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'.8rem',fontWeight:700,flexShrink:0,overflow:'hidden' }}>
              {review.avatar ? <img src={review.avatar} alt={review.name} style={{ width:34,height:34,objectFit:'cover' }} /> : review.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0,fontSize:'.8rem',fontWeight:700,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{review.name}</p>
              {date && <p style={{ margin:0,fontSize:'.7rem',color:'var(--text-muted)' }}>{date}</p>}
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'.4rem',flexShrink:0 }}>
            {review.source && <span style={{ fontSize:'.68rem',padding:'.15rem .5rem',background:'var(--beige-50)',border:'1px solid var(--border)',borderRadius:99,color:'var(--text-muted)',whiteSpace:'nowrap' }}>{review.source}</span>}
            {hasImages && <span style={{ fontSize:'.72rem',fontWeight:600,color:'var(--primary)' }}>Photos →</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background:'var(--white)',borderRadius:'1.15rem',overflow:'hidden',border:'1px solid var(--border)' }}>
      <div style={{ height:160,background:'linear-gradient(90deg,var(--border) 25%,var(--off-white) 50%,var(--border) 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite' }} />
      <div style={{ padding:'1.25rem',display:'flex',flexDirection:'column',gap:8 }}>
        {[40,100,80,60].map((w,i) => <div key={i} style={{ height:i===1?55:12,background:'var(--border)',borderRadius:6,width:`${w}%` }} />)}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ── Page ──────────────────────────────────── */
export default function TestimonialsPublicPage() {
  const [reviews,     setReviews]     = useState<Testimonial[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [ratingFilter,setRatingFilter]= useState(0);   // 0 = all
  const [sourceFilter,setSourceFilter]= useState('');
  const [allSources,  setAllSources]  = useState<string[]>([]);
  const [page,        setPage]        = useState(1);
  const [pages,       setPages]       = useState(1);
  const [total,       setTotal]       = useState(0);
  const [counts,      setCounts]      = useState<{pending:number;approved:number;featured:number}|null>(null);
  const [selected,    setSelected]    = useState<Testimonial | null>(null);

  /* fetch sources once */
  useEffect(() => {
    fetch('/api/dashboard/reviews?approved=true&limit=200')
      .then(r => r.json())
      .then(d => {
        const srcs = Array.from(new Set((d.reviews ?? []).map((r: Testimonial) => r.source).filter(Boolean))) as string[];
        setAllSources(srcs);
        if (d.counts) setCounts(d.counts);
      })
      .catch(console.error);
  }, []);

  /* fetch filtered */
  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ approved:'true', limit:'12', page:String(page) });
    if (search)       p.set('search', search);
    if (sourceFilter) p.set('source', sourceFilter);
    fetch(`/api/dashboard/reviews?${p}`)
      .then(r => r.json())
      .then(d => {
        let list: Testimonial[] = d.reviews ?? [];
        if (ratingFilter > 0) list = list.filter(r => r.rating >= ratingFilter);
        setReviews(list);
        setPages(d.pages ?? 1);
        setTotal(d.total ?? 0);
        if (d.counts) setCounts(d.counts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, sourceFilter, ratingFilter, page]);

  const doSearch = () => { setSearch(searchInput.trim()); setPage(1); };
  const doClear  = () => { setSearch(''); setSearchInput(''); setRatingFilter(0); setSourceFilter(''); setPage(1); };

  const hasFilter = search || ratingFilter > 0 || sourceFilter;

  /* average rating */
  const avg = reviews.length
    ? (reviews.reduce((s,r) => s+r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ background:'var(--navy-700)',padding:'9rem 0 5rem',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)',backgroundSize:'60px 60px' }} />
        <div style={{ position:'absolute',right:'-4rem',top:'-4rem',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle,rgba(196,154,108,.15) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute',left:'-5rem',bottom:'-5rem',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(196,154,108,.08) 0%,transparent 70%)' }} />
        <div className="container" style={{ position:'relative',textAlign:'center' }}>
          <span className="badge badge-white" style={{ marginBottom:'1rem' }}>Patient Stories</span>
          <h1 style={{ color:'#fff',fontFamily:'var(--font-heading)',marginBottom:0 }}>
            What Our Patients<br /><em style={{ color:'var(--beige-300)' }}>Are Saying</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,.7)',maxWidth:520,margin:'1.5rem auto 0',fontSize:'1.05rem',lineHeight:1.7 }}>
            Real experiences from real people — unfiltered and honest feedback from our valued patients.
          </p>

          {/* Stats row */}
          {counts && (
            <div style={{ display:'flex',justifyContent:'center',gap:'1rem',marginTop:'2.5rem',flexWrap:'wrap' }}>
              {[
                { label:'Total Reviews',   value: counts.approved },
                { label:'Featured',        value: counts.featured },
                { label:'Avg Rating',      value: avg ? `${avg} ★` : '—' },
              ].map(s => (
                <div key={s.label} style={{ padding:'.85rem 1.5rem',background:'rgba(255,255,255,.1)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'1rem',minWidth:110,textAlign:'center' }}>
                  <p style={{ margin:0,fontWeight:800,fontSize:'1.5rem',color:'#fff',fontFamily:'var(--font-heading)' }}>{s.value}</p>
                  <p style={{ margin:'.2rem 0 0',fontSize:'.72rem',color:'rgba(255,255,255,.65)',textTransform:'uppercase',letterSpacing:'.05em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <section className="section" style={{ background:'var(--off-white)' }}>
        <div className="container">
          <SectionTitle label="Reviews" title="Patient Testimonials" centered />

          {/* Filter card */}
          <div style={{ marginTop:'2.5rem',background:'var(--white)',border:'1px solid var(--border)',borderRadius:'1.25rem',padding:'1.5rem',boxShadow:'0 2px 20px rgba(8,43,86,.07)' }}>

            {/* Search row */}
            <div style={{ display:'flex',gap:'.75rem',flexWrap:'wrap' }}>
              <div style={{ flex:'1 1 240px',position:'relative' }}>
                <span style={{ position:'absolute',left:'.9rem',top:'50%',transform:'translateY(-50%)',pointerEvents:'none' }}>🔍</span>
                <input type="text" value={searchInput}
                  onChange={e=>setSearchInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&doSearch()}
                  placeholder="Search reviews or patient names…"
                  style={{ width:'100%',padding:'.72rem .9rem .72rem 2.4rem',border:'1.5px solid var(--border)',borderRadius:'var(--radius)',fontSize:'.9rem',background:'var(--off-white)',outline:'none',boxSizing:'border-box',color:'var(--text-primary)',fontFamily:'inherit',transition:'border-color .2s,box-shadow .2s' }}
                  onFocus={e=>{e.target.style.borderColor='var(--primary)';e.target.style.boxShadow='0 0 0 3px rgba(8,43,86,.08)'}}
                  onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}
                />
              </div>
              <button onClick={doSearch} style={{ padding:'.72rem 1.6rem',borderRadius:'var(--radius)',background:'var(--primary)',color:'#fff',border:'none',fontWeight:600,fontSize:'.9rem',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'opacity .2s' }} onMouseEnter={e=>(e.currentTarget.style.opacity='.88')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>Search</button>
              {hasFilter && (
                <button onClick={doClear} style={{ padding:'.72rem 1.1rem',borderRadius:'var(--radius)',background:'transparent',color:'var(--text-muted)',border:'1.5px solid var(--border)',fontSize:'.85rem',cursor:'pointer',fontFamily:'inherit',transition:'all .2s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--danger)';e.currentTarget.style.color='var(--danger)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>✕ Clear</button>
              )}
            </div>

            {/* Rating filter */}
            <div style={{ height:1,background:'var(--border)',margin:'1.1rem 0' }} />
            <div style={{ display:'flex',gap:'1.5rem',flexWrap:'wrap',alignItems:'center' }}>
              <div style={{ display:'flex',gap:'.4rem',flexWrap:'wrap',alignItems:'center' }}>
                <span style={{ fontSize:'.73rem',color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',marginRight:'.25rem',flexShrink:0 }}>Rating:</span>
                {[0,5,4,3].map(r => {
                  const active = ratingFilter===r;
                  return (
                    <button key={r} onClick={()=>{setRatingFilter(ratingFilter===r?0:r);setPage(1)}}
                      style={{ padding:'.28rem .82rem',borderRadius:99,border:`1.5px solid ${active?'var(--primary)':'var(--border)'}`,background:active?'var(--primary)':'transparent',color:active?'#fff':'var(--text-secondary)',fontWeight:active?600:400,fontSize:'.78rem',cursor:'pointer',fontFamily:'inherit',transition:'all .18s' }}
                      onMouseEnter={e=>{if(!active){e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.color='var(--primary)'}}}
                      onMouseLeave={e=>{if(!active){e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)'}}}>
                      {r===0?'All':`${r}★+`}
                    </button>
                  );
                })}
              </div>

              {allSources.length > 0 && (
                <div style={{ display:'flex',gap:'.4rem',flexWrap:'wrap',alignItems:'center' }}>
                  <span style={{ fontSize:'.73rem',color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',marginRight:'.25rem',flexShrink:0 }}>Source:</span>
                  {['', ...allSources].map(s => {
                    const isAll=s==='', active=isAll?!sourceFilter:sourceFilter===s;
                    return (
                      <button key={s||'all'} onClick={()=>{setSourceFilter(isAll?'':(sourceFilter===s?'':s));setPage(1)}}
                        style={{ padding:'.28rem .82rem',borderRadius:99,border:`1.5px solid ${active?'var(--primary)':'var(--border)'}`,background:active?'var(--primary)':'transparent',color:active?'#fff':'var(--text-secondary)',fontWeight:active?600:400,fontSize:'.78rem',cursor:'pointer',fontFamily:'inherit',transition:'all .18s' }}
                        onMouseEnter={e=>{if(!active){e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.color='var(--primary)'}}}
                        onMouseLeave={e=>{if(!active){e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)'}}}>{isAll?'All':s}</button>
                    );
                  })}
                </div>
              )}
            </div>

            {!loading && (
              <p style={{ margin:'.85rem 0 0',fontSize:'.82rem',color:'var(--text-muted)' }}>
                <strong style={{ color:'var(--text-primary)' }}>{total}</strong> {total===1?'review':'reviews'}
                {ratingFilter>0&&<> rated <strong style={{ color:'var(--navy-700)' }}>{ratingFilter}★ or above</strong></>}
                {sourceFilter&&<> from <strong style={{ color:'var(--navy-700)' }}>{sourceFilter}</strong></>}
                {search&&<> matching "<strong style={{ color:'var(--navy-700)' }}>{search}</strong>"</>}
              </p>
            )}
          </div>

          {/* Grid */}
          <div style={{ marginTop:'2rem',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.5rem' }}>
            {loading
              ? Array.from({length:9}).map((_,i) => <Skeleton key={i}/>)
              : reviews.length
                ? reviews.map(r => <ReviewCard key={r.id} review={r} onClick={() => setSelected(r)} />)
                : (
                  <div style={{ gridColumn:'1/-1',textAlign:'center',padding:'5rem 1rem',color:'var(--text-muted)' }}>
                    <p style={{ fontSize:'3rem',margin:'0 0 .5rem' }}>💬</p>
                    <p style={{ fontWeight:700,color:'var(--text-primary)',margin:'0 0 .4rem',fontSize:'1.1rem' }}>No reviews found</p>
                    <p style={{ margin:0,fontSize:'.9rem' }}>Try adjusting your filters</p>
                    <button onClick={doClear} style={{ marginTop:'1.25rem',padding:'.6rem 1.4rem',borderRadius:'var(--radius)',background:'var(--primary)',color:'#fff',border:'none',fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Clear Filters</button>
                  </div>
                )
            }
          </div>

          {/* Pagination */}
          {pages > 1 && !loading && (
            <div style={{ display:'flex',justifyContent:'center',alignItems:'center',gap:'.4rem',marginTop:'3rem',flexWrap:'wrap' }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'.45rem 1rem',borderRadius:'var(--radius)',border:'1.5px solid var(--border)',background:'var(--white)',cursor:page===1?'not-allowed':'pointer',fontSize:'.84rem',fontFamily:'inherit',opacity:page===1?.5:1 }}>← Prev</button>
              {Array.from({length:pages},(_,i)=>i+1).map(n=>(
                <button key={n} onClick={()=>setPage(n)} style={{ width:38,height:38,borderRadius:'var(--radius)',border:`1.5px solid ${page===n?'var(--primary)':'var(--border)'}`,background:page===n?'var(--primary)':'var(--white)',color:page===n?'#fff':'var(--text-secondary)',fontWeight:page===n?700:400,cursor:'pointer',fontSize:'.84rem',fontFamily:'inherit',transition:'all .15s' }}>{n}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} style={{ padding:'.45rem 1rem',borderRadius:'var(--radius)',border:'1.5px solid var(--border)',background:'var(--white)',cursor:page===pages?'not-allowed':'pointer',fontSize:'.84rem',fontFamily:'inherit',opacity:page===pages?.5:1 }}>Next →</button>
            </div>
          )}
        </div>
      </section>

      {selected && <ReviewModal review={selected} onClose={() => setSelected(null)} />}
      <AppointmentBanner />
    </>
  );
}
