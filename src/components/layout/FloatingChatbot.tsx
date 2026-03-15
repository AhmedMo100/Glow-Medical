'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingChatbot() {
  const pathname = usePathname();
  const [visible, setVisible]   = useState(false);
  const [tooltip, setTooltip]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  /* show tooltip after 3s on first load */
  useEffect(() => {
    setVisible(false);
    const t1 = setTimeout(() => setVisible(true), 400);
    const t2 = setTimeout(() => setTooltip(true),  3200);
    const t3 = setTimeout(() => setTooltip(false), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (pathname === '/public/chat') return null;

  return (
    <>
      <style>{`
        @keyframes cfFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes cfPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(196,154,108,.55); }
          50%      { box-shadow: 0 0 0 14px rgba(196,154,108,0); }
        }
        @keyframes cfIn {
          from { opacity:0; transform: scale(.7) translateY(12px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes cfTooltipIn {
          from { opacity:0; transform: translateX(-8px); }
          to   { opacity:1; transform: translateX(0); }
        }
        .cf-btn:hover .cf-icon { transform: rotate(-15deg) scale(1.15); }
        .cf-icon { transition: transform .3s cubic-bezier(.34,1.56,.64,1); }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '.6rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity .4s ease, transform .4s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}>

        {/* Tooltip bubble */}
        {tooltip && !dismissed && (
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(8,43,86,.14)',
            padding: '.75rem 1rem',
            maxWidth: 230,
            position: 'relative',
            animation: 'cfTooltipIn .3s ease',
          }}>
            {/* Close tooltip */}
            <button
              onClick={() => setDismissed(true)}
              style={{ position:'absolute',top:6,right:8,background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'1rem',lineHeight:1,padding:0 }}
            >×</button>

            <p style={{ margin:0,fontSize:'.82rem',fontWeight:700,color:'var(--navy-700)',marginBottom:'.2rem' }}>
              👋 Need help?
            </p>
            <p style={{ margin:0,fontSize:'.78rem',color:'var(--text-secondary)',lineHeight:1.5 }}>
              Chat with our AI assistant for instant answers.
            </p>

            {/* Triangle pointer */}
            <div style={{
              position: 'absolute',
              bottom: -7,
              right: 28,
              width: 14, height: 14,
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderTop: 'none', borderLeft: 'none',
              transform: 'rotate(45deg)',
              clipPath: 'polygon(0 0,100% 0,100% 100%)',
            }} />
          </div>
        )}

        {/* Main button */}
        <Link
          href="/public/chat"
          aria-label="Open AI Chat Assistant"
          className="cf-btn"
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--navy-700) 0%, #1a4a7a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            animation: 'cfFloat 3.5s ease-in-out infinite, cfPulse 2.8s ease-in-out infinite',
            boxShadow: '0 8px 28px rgba(8,43,86,.35)',
            border: '2px solid rgba(196,154,108,.35)',
            position: 'relative',
            transition: 'transform .2s ease, box-shadow .2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.animation = 'none';
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgba(8,43,86,.45)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.animation = 'cfFloat 3.5s ease-in-out infinite, cfPulse 2.8s ease-in-out infinite';
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(8,43,86,.35)';
          }}
        >
          <MessageCircle size={26} color="var(--beige-300)" className="cf-icon" strokeWidth={1.8} />

          {/* Online dot */}
          <span style={{
            position: 'absolute',
            top: 3, right: 3,
            width: 12, height: 12,
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid #fff',
          }} />
        </Link>
      </div>
    </>
  );
}
