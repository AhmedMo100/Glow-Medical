'use client';

import { useEffect, useState } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';

interface StaffMember {
  id: number;
  staffType: string;
  name: string;
  nameEn?: string;
  photo?: string;
  bio?: string;
  specialization?: string;
  qualifications?: string;
  experience?: number;
  licenseNumber?: string;
  isPublic: boolean;
  isFeatured: boolean;
  instagramUrl?: string;
  linkedinUrl?: string;
  _count?: { appointments: number };
}

/* ── Modal ──────────────────────────────────── */
function TeamModal({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', fn); };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(8,30,60,.72)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.25rem',animation:'tmFade .2s ease' }}>
      <style>{`@keyframes tmFade{from{opacity:0}to{opacity:1}} @keyframes tmUp{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}`}</style>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--white)',borderRadius:'1.5rem',maxWidth:760,width:'100%',boxShadow:'0 32px 80px rgba(8,43,86,.28)',animation:'tmUp .25s ease',overflow:'hidden',display:'grid',gridTemplateColumns:member.photo?'1fr 1fr':'1fr',maxHeight:'90vh',position:'relative' }}>

        {member.photo && (
          <div style={{ position:'relative',overflow:'hidden',minHeight:360 }}>
            <img src={member.photo} alt={member.nameEn??member.name} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
            <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(8,43,86,.6) 0%,transparent 55%)' }} />
            <div style={{ position:'absolute',bottom:16,left:16,background:'rgba(255,255,255,.15)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.25)',color:'#fff',padding:'.28rem .8rem',borderRadius:99,fontSize:'.72rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase' }}>
              {member.staffType}
            </div>
          </div>
        )}

        <div style={{ padding:'2.25rem 2rem',display:'flex',flexDirection:'column',gap:'.75rem',overflowY:'auto' }}>
          <button onClick={onClose} style={{ position:'absolute',top:16,right:16,width:34,height:34,borderRadius:'50%',background:'rgba(0,0,0,.08)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',color:'var(--text-secondary)',zIndex:10,transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,0,0,.16)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,0,0,.08)')}>✕</button>

          {!member.photo && <span style={{ alignSelf:'flex-start',background:'var(--primary)',color:'#fff',padding:'.22rem .72rem',borderRadius:99,fontSize:'.72rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase' }}>{member.staffType}</span>}

          <div>
            <h2 style={{ margin:0,fontFamily:'var(--font-heading)',fontSize:'1.5rem',color:'var(--navy-700)',lineHeight:1.25 }}>{member.nameEn??member.name}</h2>
            {member.nameEn&&member.name!==member.nameEn&&<p style={{ margin:'.3rem 0 0',fontSize:'.85rem',color:'var(--text-muted)' }}>{member.name}</p>}
          </div>

          {member.specialization&&<p style={{ margin:0,fontSize:'1rem',color:'var(--accent)',fontWeight:600 }}>{member.specialization}</p>}

          <div style={{ display:'flex',gap:'.65rem',flexWrap:'wrap' }}>
            {member.experience!=null&&(
              <div style={{ flex:'1 1 100px',padding:'.75rem .9rem',borderRadius:'.85rem',background:'var(--beige-50)',border:'1px solid var(--border)',textAlign:'center' }}>
                <p style={{ margin:0,fontSize:'1.25rem' }}>⏱</p>
                <p style={{ margin:'.2rem 0 0',fontWeight:700,fontSize:'.92rem',color:'var(--navy-700)' }}>{member.experience} yrs</p>
                <p style={{ margin:0,fontSize:'.7rem',color:'var(--text-muted)' }}>Experience</p>
              </div>
            )}
            {member._count?.appointments!=null&&(
              <div style={{ flex:'1 1 100px',padding:'.75rem .9rem',borderRadius:'.85rem',background:'var(--beige-50)',border:'1px solid var(--border)',textAlign:'center' }}>
                <p style={{ margin:0,fontSize:'1.25rem' }}>📅</p>
                <p style={{ margin:'.2rem 0 0',fontWeight:700,fontSize:'.92rem',color:'var(--navy-700)' }}>{member._count.appointments}+</p>
                <p style={{ margin:0,fontSize:'.7rem',color:'var(--text-muted)' }}>Appointments</p>
              </div>
            )}
          </div>

          {member.qualifications&&<p style={{ margin:0,fontSize:'.88rem',color:'var(--text-secondary)',display:'flex',alignItems:'flex-start',gap:'.4rem' }}><span>🎓</span>{member.qualifications}</p>}
          {member.licenseNumber&&<p style={{ margin:0,fontSize:'.82rem',color:'var(--text-muted)' }}>License: {member.licenseNumber}</p>}
          {member.bio&&<p style={{ margin:0,fontSize:'.9rem',color:'var(--text-secondary)',lineHeight:1.75 }}>{member.bio}</p>}

          <div style={{ marginTop:'auto',paddingTop:'.75rem',display:'flex',flexDirection:'column',gap:'.6rem' }}>
            {(member.instagramUrl||member.linkedinUrl)&&(
              <div style={{ display:'flex',gap:'.5rem',flexWrap:'wrap' }}>
                {member.instagramUrl&&<a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.82rem',color:'#e1306c',textDecoration:'none',padding:'.3rem .85rem',border:'1px solid #fce4ec',borderRadius:99,fontWeight:500,transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='#fff0f5')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>📸 Instagram</a>}
                {member.linkedinUrl&&<a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:'.82rem',color:'#0077b5',textDecoration:'none',padding:'.3rem .85rem',border:'1px solid #e1f0fa',borderRadius:99,fontWeight:500,transition:'background .15s' }} onMouseEnter={e=>(e.currentTarget.style.background='#f0f8ff')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>💼 LinkedIn</a>}
              </div>
            )}
            <a href="/book" style={{ display:'block',textAlign:'center',padding:'.82rem',background:'var(--accent)',color:'#fff',borderRadius:'var(--radius)',fontWeight:700,fontSize:'.92rem',textDecoration:'none',transition:'opacity .2s,transform .15s' }} onMouseEnter={e=>{e.currentTarget.style.opacity='.9';e.currentTarget.style.transform='translateY(-1px)'}} onMouseLeave={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform=''}}>
              Book an Appointment
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Card ────────────────────────────────────── */
function TeamCard({ member, onClick }: { member: StaffMember; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)', borderRadius: '1.15rem', overflow: 'hidden',
        boxShadow: hovered ? '0 18px 44px rgba(8,43,86,.14)' : '0 2px 16px rgba(8,43,86,.07)',
        border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : '',
        transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease',
      }}
    >
      {/* Photo */}
      <div style={{ height: 255, background: 'var(--beige-50)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {member.photo
          ? <img src={member.photo} alt={member.nameEn ?? member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s ease', transform: hovered ? 'scale(1.06)' : '' }} />
          : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#1a4a7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', fontWeight: 700 }}>
                {(member.nameEn ?? member.name).charAt(0).toUpperCase()}
              </div>
            </div>
          )
        }
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(8,43,86,.35) 0%,transparent 50%)', opacity: hovered ? 1 : 0, transition: 'opacity .3s' }} />
        {/* Type badge */}
        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(8,43,86,.82)', backdropFilter: 'blur(6px)', color: '#fff', padding: '.2rem .65rem', borderRadius: 99, fontSize: '.68rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>
          {member.staffType}
        </div>
        {/* Hover arrow */}
        <div style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.82rem', opacity: hovered ? 1 : 0, transition: 'opacity .2s', transform: hovered ? 'scale(1)' : 'scale(.8)' }}>→</div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.1rem 1.2rem 1.3rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', lineHeight: 1.3 }}>
          {member.nameEn ?? member.name}
        </h3>
        {member.qualifications && (
          <p style={{ margin: 0, fontSize: '.78rem', color: 'var(--text-secondary)' }}>🎓 {member.qualifications}</p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.65rem', paddingTop: '.65rem', borderTop: '1px solid var(--border)' }}>
          {member.experience != null
            ? <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', background: 'var(--off-white)', border: '1px solid var(--border)', padding: '.2rem .6rem', borderRadius: 99 }}>⏱ {member.experience} yrs</span>
            : <span />
          }
          <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)' }}>View profile →</span>
        </div>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────── */
export default function PublicTeamSection() {
  const [staff,   setStaff]   = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected,setSelected]= useState<StaffMember | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/team?limit=100&isPublic=true')
      .then(r => r.json())
      .then(d => {
        const list: StaffMember[] = (d.staff ?? []).filter((s: StaffMember) => s.isPublic);
        setStaff(list.sort(() => Math.random() - 0.5).slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !staff.length) return null;

  return (
    <section className="section" style={{ background: 'var(--beige-50)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <SectionTitle
            label="Our Specialists"
            title="Meet Our Expert<br/>Medical Team"
            description="Board-certified physicians with decades of combined experience, dedicated to your long-term wellbeing."
          />
          <Button href="/public/team" variant="outline">All Doctors</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {staff.map(m => <TeamCard key={m.id} member={m} onClick={() => setSelected(m)} />)}
        </div>
      </div>

      {selected && <TeamModal member={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
