// app/(public)/contact/page.tsx
import type { Metadata } from 'next'
import ContactForm from '@/components/sections/ContactForm'
import ContactSidebar from '@/components/sections/ContactSidebar'

export const metadata: Metadata = { title: 'Contact Us' }

export default function ContactPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section style={{
        background: 'var(--navy-700)', padding: '9rem 0 5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 340, height: 340, borderRadius: '50%', background: 'rgba(196,154,108,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: 240, height: 240, borderRadius: '50%', background: 'rgba(196,154,108,0.06)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="badge badge-white" style={{ marginBottom: '1rem' }}>Get In Touch</span>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
            We Are Here to{' '}
            <em style={{ color: 'var(--beige-300)', fontStyle: 'italic' }}>Help</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '500px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Have a question, need directions, or want to learn more?<br />
            Our friendly team is just a message away.
          </p>
        </div>
      </section>

      {/* ── Main ── */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div
            className="contact-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'clamp(260px, 34%, 380px) 1fr',
              gap: 'clamp(1.5rem, 4vw, 3.5rem)',
              alignItems: 'start',
            }}
          >
            <ContactSidebar />

            <div className="card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', boxShadow: '0 4px 32px rgba(8,43,86,0.07)' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', fontSize: 'clamp(1.2rem,3vw,1.6rem)', marginBottom: '0.35rem' }}>
                  Send a Message
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Fill in the form and we'll get back to you within 24 hours.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-grid > aside {
            position: static !important;
          }
        }
      `}</style>
    </>
  )
}
