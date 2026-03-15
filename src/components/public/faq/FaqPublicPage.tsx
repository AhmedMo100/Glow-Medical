'use client';

import { useEffect, useState, useRef } from 'react';
import AppointmentBanner from '@/components/home/AppointmentBanner';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
}

/* ── Accordion Item ───────────────────────── */
function AccordionItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
  }, [isOpen]);

  return (
    <div style={{
      background: isOpen ? 'var(--white)' : 'var(--white)',
      border: `1.5px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: '1rem',
      overflow: 'hidden',
      transition: 'border-color .25s ease, box-shadow .25s ease',
      boxShadow: isOpen ? '0 8px 32px rgba(8,43,86,.1)' : '0 1px 6px rgba(8,43,86,.04)',
    }}>
      {/* Question row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', flex: 1, minWidth: 0 }}>
          {/* Q badge */}
          <span style={{
            flexShrink: 0,
            width: 30, height: 30,
            borderRadius: '50%',
            background: isOpen ? 'var(--primary)' : 'var(--beige-50)',
            border: `1.5px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.72rem', fontWeight: 800,
            color: isOpen ? '#fff' : 'var(--text-muted)',
            transition: 'all .25s',
            letterSpacing: '.02em',
          }}>Q</span>

          <span style={{
            fontSize: '.97rem',
            fontWeight: isOpen ? 700 : 600,
            color: isOpen ? 'var(--navy-700)' : 'var(--text-primary)',
            lineHeight: 1.45,
            transition: 'color .2s',
          }}>
            {faq.question}
          </span>
        </div>

        {/* Chevron */}
        <span style={{
          flexShrink: 0,
          width: 28, height: 28,
          borderRadius: '50%',
          background: isOpen ? 'var(--primary)' : 'var(--off-white)',
          border: `1.5px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .25s',
        }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
            stroke={isOpen ? '#fff' : 'var(--text-muted)'}
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform .3s ease', transform: isOpen ? 'rotate(180deg)' : '' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      {/* Answer */}
      <div style={{ height, overflow: 'hidden', transition: 'height .32s cubic-bezier(.4,0,.2,1)' }}>
        <div ref={bodyRef} style={{ padding: '0 1.5rem 1.4rem', paddingLeft: '4.1rem' }}>
          <div style={{ height: 1, background: 'var(--border)', marginBottom: '1rem' }} />
          <p style={{
            margin: 0,
            fontSize: '.92rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.82,
            whiteSpace: 'pre-line',
          }}>
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background:'var(--white)',border:'1.5px solid var(--border)',borderRadius:'1rem',padding:'1.25rem 1.5rem',display:'flex',alignItems:'center',gap:'.85rem' }}>
      <div style={{ width:30,height:30,borderRadius:'50%',background:'var(--border)',flexShrink:0 }} />
      <div style={{ flex:1,height:14,borderRadius:6,background:'linear-gradient(90deg,var(--border) 25%,var(--off-white) 50%,var(--border) 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite' }} />
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ── Page ─────────────────────────────────── */
export default function FaqPublicPage() {
  const [faqs,        setFaqs]        = useState<FAQ[]>([]);
  const [categories,  setCategories]  = useState<string[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('');
  const [openId,      setOpenId]      = useState<number | null>(null);

  const doSearch = () => { setSearch(searchInput.trim()); setOpenId(null); };
  const doClear  = () => { setSearch(''); setSearchInput(''); setCatFilter(''); setOpenId(null); };
  const hasFilter = search || catFilter;

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ active: 'true' });
    if (search)    p.set('search',   search);
    if (catFilter) p.set('category', catFilter);
    fetch(`/api/dashboard/faq?${p}`)
      .then(r => r.json())
      .then(d => {
        setFaqs(d.faqs ?? []);
        if (d.categories?.length) setCategories(d.categories);
        /* open first on load */
        if (!search && !catFilter && d.faqs?.length) setOpenId(d.faqs[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, catFilter]);

  /* Group faqs by category */
  const grouped: Record<string, FAQ[]> = {};
  for (const f of faqs) {
    const key = f.category || 'General';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  }
  const groupKeys = Object.keys(grouped);

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ background:'var(--navy-700)',padding:'9rem 0 5rem',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)',backgroundSize:'60px 60px' }} />
        <div style={{ position:'absolute',right:'-4rem',top:'-4rem',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle,rgba(196,154,108,.15) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute',left:'-5rem',bottom:'-5rem',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(196,154,108,.08) 0%,transparent 70%)' }} />

        <div className="container" style={{ position:'relative',textAlign:'center' }}>
          <span className="badge badge-white" style={{ marginBottom:'1rem' }}>Help Center</span>
          <h1 style={{ color:'#fff',fontFamily:'var(--font-heading)',marginBottom:0 }}>
            Frequently Asked<br/><em style={{ color:'var(--beige-300)' }}>Questions</em>
          </h1>
          <p style={{ color:'rgba(255,255,255,.7)',maxWidth:520,margin:'1.5rem auto 2rem',fontSize:'1.05rem',lineHeight:1.7 }}>
            Find quick answers to the most common questions about our services, appointments, and treatments.
          </p>

          {/* Inline search in hero */}
          <div style={{ maxWidth:560,margin:'0 auto',display:'flex',gap:'.6rem',background:'rgba(255,255,255,.12)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'var(--radius-lg)',padding:'.5rem .5rem .5rem .9rem' }}>
            <input
              type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && doSearch()}
              placeholder="Search your question…"
              style={{ flex:1,background:'transparent',border:'none',outline:'none',color:'#fff',fontSize:'.95rem',fontFamily:'inherit' }}
            />
            <button
              onClick={doSearch}
              style={{ padding:'.62rem 1.4rem',borderRadius:'var(--radius)',background:'var(--accent)',color:'#fff',border:'none',fontWeight:700,fontSize:'.88rem',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'opacity .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='.88')}
              onMouseLeave={e=>(e.currentTarget.style.opacity='1')}
            >Search</button>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="section" style={{ background:'var(--off-white)' }}>
        <div className="container" style={{ maxWidth:860 }}>

          {/* Category pills */}
          {categories.length > 0 && (
            <div style={{ display:'flex',gap:'.4rem',flexWrap:'wrap',justifyContent:'center',marginBottom:'2.5rem' }}>
              {['', ...categories].map(c => {
                const isAll=c==='', active=isAll?!catFilter:catFilter===c;
                return (
                  <button key={c||'all'} onClick={()=>{setCatFilter(isAll?'':(catFilter===c?'':c));setOpenId(null)}}
                    style={{ padding:'.38rem 1rem',borderRadius:99,border:`1.5px solid ${active?'var(--primary)':'var(--border)'}`,background:active?'var(--primary)':'var(--white)',color:active?'#fff':'var(--text-secondary)',fontWeight:active?600:400,fontSize:'.82rem',cursor:'pointer',fontFamily:'inherit',transition:'all .18s',boxShadow:active?'0 4px 14px rgba(8,43,86,.18)':'none' }}
                    onMouseEnter={e=>{if(!active){e.currentTarget.style.borderColor='var(--primary)';e.currentTarget.style.color='var(--primary)'}}}
                    onMouseLeave={e=>{if(!active){e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)'}}}>
                    {isAll ? '✦ All Topics' : c}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active filter banner */}
          {hasFilter && !loading && (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.75rem',padding:'.75rem 1.1rem',background:'var(--beige-50)',border:'1px solid var(--border)',borderRadius:'.85rem',marginBottom:'1.5rem',flexWrap:'wrap' }}>
              <p style={{ margin:0,fontSize:'.85rem',color:'var(--text-secondary)' }}>
                <strong style={{ color:'var(--navy-700)' }}>{faqs.length}</strong> result{faqs.length!==1?'s':''}
                {search&&<> for "<strong style={{ color:'var(--navy-700)' }}>{search}</strong>"</>}
                {catFilter&&<> in <strong style={{ color:'var(--navy-700)' }}>{catFilter}</strong></>}
              </p>
              <button onClick={doClear} style={{ fontSize:'.8rem',fontWeight:600,color:'var(--danger,#ef4444)',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',padding:0,whiteSpace:'nowrap' }}>✕ Clear filters</button>
            </div>
          )}

          {/* FAQ list */}
          {loading ? (
            <div style={{ display:'flex',flexDirection:'column',gap:'.75rem' }}>
              {Array.from({length:6}).map((_,i) => <Skeleton key={i}/>)}
            </div>
          ) : faqs.length === 0 ? (
            <div style={{ textAlign:'center',padding:'5rem 1rem',color:'var(--text-muted)' }}>
              <p style={{ fontSize:'3rem',margin:'0 0 .5rem' }}>🔍</p>
              <p style={{ fontWeight:700,color:'var(--text-primary)',margin:'0 0 .4rem',fontSize:'1.1rem' }}>No results found</p>
              <p style={{ margin:0,fontSize:'.9rem' }}>Try different keywords or browse all topics</p>
              <button onClick={doClear} style={{ marginTop:'1.25rem',padding:'.6rem 1.4rem',borderRadius:'var(--radius)',background:'var(--primary)',color:'#fff',border:'none',fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Show all FAQs</button>
            </div>
          ) : catFilter || search ? (
            /* Flat list when filtering */
            <div style={{ display:'flex',flexDirection:'column',gap:'.75rem' }}>
              {faqs.map(f => (
                <AccordionItem key={f.id} faq={f} isOpen={openId===f.id} onToggle={() => setOpenId(openId===f.id?null:f.id)} />
              ))}
            </div>
          ) : (
            /* Grouped by category */
            <div style={{ display:'flex',flexDirection:'column',gap:'2.5rem' }}>
              {groupKeys.map(cat => (
                <div key={cat}>
                  {groupKeys.length > 1 && (
                    <div style={{ display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'1.1rem' }}>
                      <span style={{ fontSize:'.72rem',fontWeight:700,color:'var(--primary)',textTransform:'uppercase',letterSpacing:'.07em',background:'var(--beige-50)',border:'1px solid var(--border)',padding:'.28rem .82rem',borderRadius:99,whiteSpace:'nowrap' }}>
                        {cat}
                      </span>
                      <div style={{ flex:1,height:1,background:'var(--border)' }} />
                    </div>
                  )}
                  <div style={{ display:'flex',flexDirection:'column',gap:'.75rem' }}>
                    {grouped[cat].map(f => (
                      <AccordionItem key={f.id} faq={f} isOpen={openId===f.id} onToggle={() => setOpenId(openId===f.id?null:f.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still have questions? */}
          {!loading && faqs.length > 0 && (
            <div style={{ marginTop:'3.5rem',background:'var(--white)',border:'1.5px solid var(--border)',borderRadius:'1.5rem',padding:'2.25rem 2rem',textAlign:'center',boxShadow:'0 2px 20px rgba(8,43,86,.06)' }}>
              <div style={{ width:52,height:52,borderRadius:'50%',background:'var(--beige-50)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto .9rem',fontSize:'1.5rem' }}>💬</div>
              <h3 style={{ margin:'0 0 .4rem',fontFamily:'var(--font-heading)',fontSize:'1.2rem',color:'var(--navy-700)' }}>Still have questions?</h3>
              <p style={{ margin:'0 0 1.5rem',fontSize:'.9rem',color:'var(--text-secondary)',lineHeight:1.6 }}>
                Can't find what you're looking for? Our team is happy to help.
              </p>
              <div style={{ display:'flex',justifyContent:'center',gap:'.75rem',flexWrap:'wrap' }}>
                <a href="/public/contact" style={{ padding:'.72rem 1.5rem',borderRadius:'var(--radius)',background:'var(--primary)',color:'#fff',fontWeight:700,fontSize:'.9rem',textDecoration:'none',transition:'opacity .2s' }} onMouseEnter={e=>(e.currentTarget.style.opacity='.88')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>Contact Us</a>
                <a href="/public/chat" style={{ padding:'.72rem 1.5rem',borderRadius:'var(--radius)',background:'var(--beige-50)',color:'var(--navy-700)',fontWeight:700,fontSize:'.9rem',textDecoration:'none',border:'1.5px solid var(--border)',transition:'all .2s' }} onMouseEnter={e=>{e.currentTarget.style.background='var(--beige-100,#f0e6d8)';e.currentTarget.style.borderColor='var(--accent)'}} onMouseLeave={e=>{e.currentTarget.style.background='var(--beige-50)';e.currentTarget.style.borderColor='var(--border)'}}>Ask AI Assistant</a>
              </div>
            </div>
          )}
        </div>
      </section>

      <AppointmentBanner />
    </>
  );
}
