'use client';

import { useEffect, useState } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';
import AppointmentBanner from '@/components/home/AppointmentBanner';

interface StaffMember {
  id: number; staffType: string; name: string; nameEn?: string;
  photo?: string; bio?: string; specialization?: string;
  qualifications?: string; experience?: number; licenseNumber?: string;
  isPublic: boolean; isFeatured: boolean;
  instagramUrl?: string; linkedinUrl?: string;
  status?: string;
}

/* ─────────────── Modal ─────────────── */
function TeamModal({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(8,30,60,.72)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.25rem',animation:'tmFade .2s ease' }}
    >
      <style>{`
        @keyframes tmFade { from{opacity:0} to{opacity:1} }
        @keyframes tmUp   { from{opacity:0;transform:translateY(26px) scale(.97)} to{opacity:1;transform:none} }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'var(--white)',borderRadius:'1.5rem',maxWidth:760,width:'100%',boxShadow:'0 32px 80px rgba(8,43,86,.28)',animation:'tmUp .25s ease',overflow:'hidden',display:'grid',gridTemplateColumns:member.photo?'1fr 1fr':'1fr',maxHeight:'90vh',position:'relative' }}
      >
        {/* Photo side */}
        {member.photo && (
          <div style={{ position:'relative',overflow:'hidden',minHeight:360 }}>
            <img src={member.photo} alt={member.nameEn??member.name} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
            <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(8,43,86,.6) 0%,transparent 55%)' }} />
            <div style={{ position:'absolute',bottom:16,left:16,background:'rgba(255,255,255,.15)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.25)',color:'#fff',padding:'.28rem .8rem',borderRadius:99,fontSize:'.72rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase' }}>
              {member.staffType}
            </div>
          </div>
        )}

        {/* Info side */}
        <div style={{ padding:'2.25rem 2rem',display:'flex',flexDirection:'column',gap:'.7rem',overflowY:'auto' }}>
          {/* Close btn */}
          <button
            onClick={onClose}
            style={{ position:'absolute',top:16,right:16,width:34,height:34,borderRadius:'50%',background:'rgba(0,0,0,.08)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',color:'var(--text-secondary)',zIndex:10,transition:'background .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,.16)')}
            onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,.08)')}
          >✕</button>

          {!member.photo && (
            <span style={{ alignSelf:'flex-start',background:'var(--primary)',color:'#fff',padding:'.22rem .72rem',borderRadius:99,fontSize:'.72rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase' }}>
              {member.staffType}
            </span>
          )}

          <div>
            <h2 style={{ margin:0,fontFamily:'var(--font-heading)',fontSize:'1.5rem',color:'var(--navy-700)',lineHeight:1.25 }}>{member.nameEn??member.name}</h2>
            {member.nameEn&&member.name!==member.nameEn&&<p style={{ margin:'.3rem 0 0',fontSize:'.85rem',color:'var(--text-muted)' }}>{member.name}</p>}
          </div>

          {member.specialization && (
            <p style={{ margin:0,fontSize:'1rem',color:'var(--accent)',fontWeight:600 }}>{member.specialization}</p>
          )}

          {/* Experience stat — no appointments */}
          {member.experience != null && (
            <div style={{ display:'flex',gap:'.65rem' }}>
              <div style={{ flex:'1 1 100px',padding:'.75rem .9rem',borderRadius:'.85rem',background:'var(--beige-50)',border:'1px solid var(--border)',textAlign:'center' }}>
                <p style={{ margin:0,fontSize:'1.25rem' }}>⏱</p>
                <p style={{ margin:'.2rem 0 0',fontWeight:700,fontSize:'.92rem',color:'var(--navy-700)' }}>{member.experience} yrs</p>
                <p style={{ margin:0,fontSize:'.7rem',color:'var(--text-muted)' }}>Experience</p>
              </div>
            </div>
          )}

          {member.qualifications && (
            <p style={{ margin:0,fontSize:'.88rem',color:'var(--text-secondary)',display:'flex',alignItems:'flex-start',gap:'.4rem' }}>
              <span>🎓</span>{member.qualifications}
            </p>
          )}
          {member.licenseNumber && (
            <p style={{ margin:0,fontSize:'.82rem',color:'var(--text-muted)' }}>License: {member.licenseNumber}</p>
          )}
          {member.bio && (
            <p style={{ margin:0,fontSize:'.9rem',color:'var(--text-secondary)',lineHeight:1.75 }}>{member.bio}</p>
          )}

          <div style={{ marginTop:'auto',paddingTop:'.75rem',display:'flex',flexDirection:'column',gap:'.6rem' }}>
            {(member.instagramUrl||member.linkedinUrl) && (
              <div style={{ display:'flex',gap:'.5rem',flexWrap:'wrap' }}>
                {member.instagramUrl && <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.82rem',color:'#e1306c',textDecoration:'none',padding:'.3rem .85rem',border:'1px solid #fce4ec',borderRadius:99,fontWeight:500,transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='#fff0f5')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>📸 Instagram</a>}
                {member.linkedinUrl  && <a href={member.linkedinUrl}  target="_blank" rel="noopener noreferrer" style={{ fontSize:'.82rem',color:'#0077b5',textDecoration:'none',padding:'.3rem .85rem',border:'1px solid #e1f0fa',borderRadius:99,fontWeight:500,transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='#f0f8ff')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>💼 LinkedIn</a>}
              </div>
            )}
            <a
              href="/book"
              style={{ display:'block',textAlign:'center',padding:'.82rem',background:'var(--accent)',color:'#fff',borderRadius:'var(--radius)',fontWeight:700,fontSize:'.92rem',textDecoration:'none',transition:'opacity .2s,transform .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.opacity='.9';e.currentTarget.style.transform='translateY(-1px)'}}
              onMouseLeave={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform=''}}
            >
              Book an Appointment
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Card ─────────────── */
function TeamCard({ member, onClick }: { member: StaffMember; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background:'var(--white)',borderRadius:'1.15rem',overflow:'hidden',border:'1px solid var(--border)',cursor:'pointer',display:'flex',flexDirection:'column',boxShadow:hov?'0 18px 44px rgba(8,43,86,.14)':'0 2px 16px rgba(8,43,86,.07)',transform:hov?'translateY(-6px) scale(1.01)':'',transition:'transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .28s ease' }}
    >
      <div style={{ height:255,background:'var(--beige-50)',overflow:'hidden',position:'relative',flexShrink:0 }}>
        {member.photo
          ? <img src={member.photo} alt={member.nameEn??member.name} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform .45s',transform:hov?'scale(1.06)':'' }} />
          : <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}><div style={{ width:88,height:88,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),#1a4a7a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',color:'#fff',fontWeight:700 }}>{(member.nameEn??member.name).charAt(0)}</div></div>
        }
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(8,43,86,.35) 0%,transparent 50%)',opacity:hov?1:0,transition:'opacity .3s' }} />
        <div style={{ position:'absolute',bottom:10,left:10,background:'rgba(8,43,86,.82)',backdropFilter:'blur(6px)',color:'#fff',padding:'.2rem .65rem',borderRadius:99,fontSize:'.68rem',fontWeight:700,letterSpacing:'.05em',textTransform:'uppercase' }}>{member.staffType}</div>
        <div style={{ position:'absolute',top:12,right:12,width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.2)',backdropFilter:'blur(4px)',border:'1px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'.82rem',opacity:hov?1:0,transition:'opacity .2s,transform .2s',transform:hov?'scale(1)':'scale(.8)' }}>→</div>
      </div>

      <div style={{ padding:'1.1rem 1.2rem 1.3rem',flex:1,display:'flex',flexDirection:'column',gap:'.25rem' }}>
        <h3 style={{ margin:0,fontSize:'1rem',fontWeight:700,fontFamily:'var(--font-heading)',color:'var(--navy-700)',lineHeight:1.3 }}>{member.nameEn??member.name}</h3>
        {member.qualifications&&<p style={{ margin:0,fontSize:'.78rem',color:'var(--text-secondary)' }}>🎓 {member.qualifications}</p>}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'.65rem',paddingTop:'.65rem',borderTop:'1px solid var(--border)' }}>
          {member.experience!=null
            ? <span style={{ fontSize:'.75rem',color:'var(--text-muted)',background:'var(--off-white)',border:'1px solid var(--border)',padding:'.2rem .6rem',borderRadius:99 }}>⏱ {member.experience} yrs</span>
            : <span />
          }
          <span style={{ fontSize:'.78rem',fontWeight:600,color:'var(--primary)' }}>View profile →</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Skeleton ─────────────── */
function Skeleton() {
  return (
    <div style={{ background:'var(--white)',borderRadius:'1.15rem',overflow:'hidden',border:'1px solid var(--border)' }}>
      <div style={{ height:255,background:'linear-gradient(90deg,var(--border) 25%,var(--off-white) 50%,var(--border) 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite' }} />
      <div style={{ padding:'1.1rem',display:'flex',flexDirection:'column',gap:8 }}>
        {[60,85,50].map((w,i)=><div key={i} style={{ height:i===1?15:11,background:'var(--border)',borderRadius:6,width:`${w}%` }} />)}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ─────────────── Page ─────────────── */
export default function TeamPublicPage() {
  const [staff,       setStaff]       = useState<StaffMember[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');
  const [allTypes,    setAllTypes]    = useState<string[]>([]);
  const [page,        setPage]        = useState(1);
  const [pages,       setPages]       = useState(1);
  const [total,       setTotal]       = useState(0);
  const [selected,    setSelected]    = useState<StaffMember | null>(null);

  /* fetch types once */
  useEffect(() => {
    fetch('/api/dashboard/team?isPublic=true&limit=200')
      .then(r => r.json())
      .then(d => {
        const types = Array.from(new Set(
          (d.staff ?? []).map((s: StaffMember) => s.staffType).filter(Boolean)
        )) as string[];
        setAllTypes(types);
      })
      .catch(console.error);
  }, []);

  /* fetch filtered staff */
  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ isPublic:'true', limit:'12', page:String(page) });
    if (search)     p.set('search', search);
    if (typeFilter) p.set('type',   typeFilter);
    fetch(`/api/dashboard/team?${p}`)
      .then(r => r.json())
      .then(d => { setStaff(d.staff ?? []); setPages(d.pages ?? 1); setTotal(d.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, typeFilter, page]);

  const doSearch = () => { setSearch(searchInput.trim()); setPage(1); };
  const doClear  = () => { setSearch(''); setSearchInput(''); setTypeFilter(''); setPage(1); };

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ background:'var(--navy-700)',padding:'9rem 0 5rem',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)',backgroundSize:'60px 60px' }} />
        <div style={{ position:'absolute',right:'-4rem',top:'-4rem',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle,rgba(196,154,108,.15) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute',left:'-5rem',bottom:'-5rem',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(196,154,108,.08) 0%,transparent 70%)' }} />
        <div className="container" style={{ position:'relative',textAlign:'center' }}>
          <span className="badge badge-white" style={{ marginBottom:'1rem' }}>Our Specialists</span>
          <h1 style={{ color:'#fff',fontFamily:'var(--font-heading)',marginBottom:0 }}>
            Meet the Experts<br /><em style={{ color:'var(--beige-300)' }}>Behind Your Care</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,.7)',maxWidth:500,margin:'1.5rem auto 0',fontSize:'1.05rem',lineHeight:1.7 }}>
            Our physicians bring decades of experience and an unwavering commitment to your health outcomes.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="section" style={{ background:'var(--off-white)' }}>
        <div className="container">
          <SectionTitle label="Medical Team" title="Board-Certified Physicians" centered />

          {/* Filter card */}
          <div style={{ marginTop:'2.5rem',background:'var(--white)',border:'1px solid var(--border)',borderRadius:'1.25rem',padding:'1.5rem',boxShadow:'0 2px 20px rgba(8,43,86,.07)' }}>
            {/* Search row */}
            <div style={{ display:'flex',gap:'.75rem',flexWrap:'wrap' }}>
              <div style={{ flex:'1 1 240px',position:'relative' }}>
                <span style={{ position:'absolute',left:'.9rem',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',fontSize:'1rem' }}>🔍</span>
                <input
                  type="text" value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  placeholder="Search by name or specialization…"
                  style={{ width:'100%',padding:'.72rem .9rem .72rem 2.4rem',border:'1.5px solid var(--border)',borderRadius:'var(--radius)',fontSize:'.9rem',background:'var(--off-white)',outline:'none',boxSizing:'border-box',color:'var(--text-primary)',fontFamily:'inherit',transition:'border-color .2s,box-shadow .2s' }}
                  onFocus={e => { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px rgba(8,43,86,.08)'; }}
                  onBlur={e  => { e.target.style.borderColor='var(--border)';  e.target.style.boxShadow='none'; }}
                />
              </div>
              <button onClick={doSearch} style={{ padding:'.72rem 1.6rem',borderRadius:'var(--radius)',background:'var(--primary)',color:'#fff',border:'none',fontWeight:600,fontSize:'.9rem',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'opacity .2s' }} onMouseEnter={e=>(e.currentTarget.style.opacity='.88')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
                Search
              </button>
              {(search||typeFilter) && (
                <button onClick={doClear} style={{ padding:'.72rem 1.1rem',borderRadius:'var(--radius)',background:'transparent',color:'var(--text-muted)',border:'1.5px solid var(--border)',fontSize:'.85rem',cursor:'pointer',fontFamily:'inherit',transition:'all .2s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--danger)';e.currentTarget.style.color='var(--danger)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)'}}>
                  ✕ Clear
                </button>
              )}
            </div>

            {!loading && (
              <p style={{ margin:'.85rem 0 0',fontSize:'.82rem',color:'var(--text-muted)' }}>
                <strong style={{ color:'var(--text-primary)' }}>{total}</strong> {total===1?'specialist':'specialists'}
                {typeFilter && <> in <strong style={{ color:'var(--navy-700)' }}>{typeFilter}</strong></>}
                {search && <> matching "<strong style={{ color:'var(--navy-700)' }}>{search}</strong>"</>}
              </p>
            )}
          </div>

          {/* Grid */}
          <div style={{ marginTop:'2rem',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1.5rem' }}>
            {loading
              ? Array.from({length:8}).map((_,i) => <Skeleton key={i}/>)
              : staff.length
                ? staff.map(m => <TeamCard key={m.id} member={m} onClick={() => setSelected(m)} />)
                : (
                  <div style={{ gridColumn:'1/-1',textAlign:'center',padding:'5rem 1rem',color:'var(--text-muted)' }}>
                    <p style={{ fontSize:'3rem',margin:'0 0 .5rem' }}>👤</p>
                    <p style={{ fontWeight:700,color:'var(--text-primary)',margin:'0 0 .4rem',fontSize:'1.1rem' }}>No specialists found</p>
                    <p style={{ margin:0,fontSize:'.9rem' }}>Try a different search or filter</p>
                    <button onClick={doClear} style={{ marginTop:'1.25rem',padding:'.6rem 1.4rem',borderRadius:'var(--radius)',background:'var(--primary)',color:'#fff',border:'none',fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Clear Filters</button>
                  </div>
                )
            }
          </div>

          {/* Pagination */}
          {pages > 1 && !loading && (
            <div style={{ display:'flex',justifyContent:'center',alignItems:'center',gap:'.4rem',marginTop:'3rem',flexWrap:'wrap' }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ padding:'.45rem 1rem',borderRadius:'var(--radius)',border:'1.5px solid var(--border)',background:'var(--white)',cursor:page===1?'not-allowed':'pointer',fontSize:'.84rem',fontFamily:'inherit',opacity:page===1?.5:1,transition:'all .15s' }}>← Prev</button>
              {Array.from({length:pages},(_,i)=>i+1).map(n => (
                <button key={n} onClick={() => setPage(n)} style={{ width:38,height:38,borderRadius:'var(--radius)',border:`1.5px solid ${page===n?'var(--primary)':'var(--border)'}`,background:page===n?'var(--primary)':'var(--white)',color:page===n?'#fff':'var(--text-secondary)',fontWeight:page===n?700:400,cursor:'pointer',fontSize:'.84rem',fontFamily:'inherit',transition:'all .15s' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} style={{ padding:'.45rem 1rem',borderRadius:'var(--radius)',border:'1.5px solid var(--border)',background:'var(--white)',cursor:page===pages?'not-allowed':'pointer',fontSize:'.84rem',fontFamily:'inherit',opacity:page===pages?.5:1,transition:'all .15s' }}>Next →</button>
            </div>
          )}
        </div>
      </section>

      {selected && <TeamModal member={selected} onClose={() => setSelected(null)} />}
      <AppointmentBanner />
    </>
  );
}
