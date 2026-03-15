// app/(public)/contact/page.tsx
import type { Metadata } from 'next'
import ContactForm from '@/components/sections/ContactForm'
import ContactSidebar from '@/components/sections/ContactSidebar'

export const metadata: Metadata = { title: 'Contact Us' }

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--navy-700)', padding: '9rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="badge badge-white" style={{ marginBottom: '1rem' }}>Get In Touch</span>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>We Are Here to <em style={{ color: 'var(--beige-300)' }}>Help</em></h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '1.5rem auto 0' }}>
            Have a question, need directions, or want to learn more? Our friendly team is just a message away.
          </p>
        </div>
      </section>

      {/* Contact cards + form */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem', alignItems: 'start' }}>

            {/* Left: Info — ContactSidebar replaces the static cards */}
            <ContactSidebar />

            {/* Right: Form — ContactForm replaces the static form */}
            <div className="card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', marginBottom: '1.5rem' }}>Send a Message</h3>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </>
  )
}