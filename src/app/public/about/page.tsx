import type { Metadata } from 'next';
import Image from 'next/image';
import { CheckCircle, Award, Users, Heart } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import StatsSection from '@/components/home/StatsSection';
import AppointmentBanner from '@/components/home/AppointmentBanner';

export const metadata: Metadata = { title: 'About Us' };

const VALUES = [
  { icon: Heart,   title: 'Compassion',  desc: 'Every patient is treated with genuine care and empathy as an individual, not a case number.' },
  { icon: Award,   title: 'Excellence',  desc: 'We uphold the highest standards in medicine, continuously improving through learning and innovation.' },
  { icon: Users,   title: 'Community',   desc: 'We are deeply invested in the health and wellbeing of the communities we serve.' },
  { icon: CheckCircle, title: 'Integrity', desc: 'Transparency, honesty, and ethical practice are the foundations of everything we do.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Page Hero */}
      <section style={{ background: 'var(--navy-700)', padding: '9rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="badge badge-white" style={{ marginBottom: '1rem' }}>About Glow Medical</span>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>Healing with Heart,<br /><em style={{ color: 'var(--beige-300)', fontStyle: 'italic' }}>Since 2000</em></h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '560px', margin: '1.5rem auto 0', fontSize: '1.05rem' }}>
            For over 25 years, Glow Medical has been a trusted pillar of healthcare — combining clinical expertise with a deeply human approach.
          </p>
        </div>
      </section>

      {/* Story section */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '480px' }}>
                <Image
                  src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=700&h=500&fit=crop"
                  alt="Our clinic"
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="50vw"
                />
              </div>
              {/* Floating badge */}
              <div style={{
                position: 'absolute', bottom: '2rem', right: '-2rem',
                background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                padding: '1.2rem 1.5rem', boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--beige-200)', textAlign: 'center',
              }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--navy-600)', lineHeight: 1 }}>25+</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-soft)', fontWeight: 500 }}>Years of Service</span>
              </div>
            </div>

            <div>
              <SectionTitle
                label="Our Story"
                title="Built on a Foundation of Care"
                description="Founded in 2000 by Dr. Eleanor Hayes, Glow Medical began as a small neighbourhood clinic with a singular vision: healthcare that never loses its human touch."
              />
              <p style={{ color: 'var(--gray-soft)', lineHeight: 1.8, marginTop: '1rem', fontSize: '0.95rem' }}>
                Over the decades, we have grown into a comprehensive medical centre — but our core belief remains unchanged. Every person who walks through our doors deserves to be heard, respected, and given the very best care modern medicine can offer.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['ISO 9001 Certified since 2008', 'Regional Hospital of the Year 2022', 'Over 50,000 patients served', 'JCIA Accredited Facility'].map(pt => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--charcoal)' }}>
                    <CheckCircle size={16} style={{ color: 'var(--beige-500)', flexShrink: 0 }} /> {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--beige-50)' }}>
        <div className="container">
          <SectionTitle label="Our Values" title="What Drives Us Every Day" centered className="mb-14" />
          <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {VALUES.map(v => (
              <div key={v.title} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--navy-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy-500)' }}>
                  <v.icon size={24} />
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy-700)' }}>{v.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-soft)', lineHeight: 1.75, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatsSection />
      <AppointmentBanner />
    </>
  );
}
