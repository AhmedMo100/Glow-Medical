// app/(public)/appointment/page.tsx
import type { Metadata } from 'next'
import { CalendarDays, Phone, Clock, CheckCircle } from 'lucide-react'
import AppointmentForm from '@/components/sections/AppointmentForm'

export const metadata: Metadata = { title: 'Book an Appointment' }

const STEPS = [
  { n: '01', title: 'Fill the Form', desc: 'Provide your details and preferred date.' },
  { n: '02', title: 'Confirmation',  desc: 'We confirm your slot within 24 hours.'   },
  { n: '03', title: 'Your Visit',    desc: 'Arrive and receive world-class care.'     },
]

export default function AppointmentPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--navy-700)', padding: '9rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="badge badge-white" style={{ marginBottom: '1rem' }}>Book Now</span>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Schedule Your<br /><em style={{ color: 'var(--beige-300)' }}>Appointment</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '1.5rem auto 0', fontSize: '1.05rem' }}>
            Your health journey starts with a single step. Let us make it as easy as possible.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(2rem, 5vw, 4rem)',
            alignItems: 'start',
          }}>

            {/* Left sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* How it works */}
              <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
                  How It Works
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {STEPS.map(step => (
                    <div key={step.n} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ background: 'var(--navy-600)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>
                        {step.n}
                      </span>
                      <div>
                        <h5 style={{ color: 'var(--navy-700)', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>{step.title}</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-soft)', margin: 0 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact quick */}
              <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', background: 'var(--navy-700)', border: 'none' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '1.2rem' }}>Need Immediate Help?</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { icon: Phone, text: '+1 (234) 567-890', href: 'tel:+1234567890' },
                    { icon: Clock, text: 'Mon–Sat: 8AM – 8PM', href: undefined },
                  ].map(({ icon: Icon, text, href }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={16} style={{ color: 'var(--beige-400)', flexShrink: 0 }} />
                      {href
                        ? <a href={href} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{text}</a>
                        : <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{text}</span>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantees */}
              <div className="card" style={{ padding: '1.5rem', background: 'var(--beige-50)' }}>
                {['No hidden fees', 'Easy rescheduling', 'Confidential consultation', 'Expert second opinions'].map((g, i, arr) => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0', borderBottom: i < arr.length - 1 ? '1px solid var(--beige-200)' : 'none' }}>
                    <CheckCircle size={15} style={{ color: 'var(--beige-500)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', color: 'var(--charcoal)' }}>{g}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <CalendarDays size={24} style={{ color: 'var(--navy-500)' }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', fontSize: '1.6rem' }}>
                  Book Your Visit
                </h2>
              </div>
              <AppointmentForm />
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
