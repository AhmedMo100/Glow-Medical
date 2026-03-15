import Link from 'next/link';
import { ArrowRight, Phone, CheckCircle } from 'lucide-react';

const TRUST_POINTS = [
  '25+ Years of Care',
  '120+ Expert Doctors',
  'ISO Certified Facilities',
];

export default function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(135deg, rgba(4,27,56,0.90) 0%, rgba(8,43,86,0.75) 50%, rgba(30,80,140,0.55) 100%),
          url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&h=900&fit=crop') center/cover no-repeat
        `,
      }} />

      {/* Decorative beige circle */}
      <div style={{
        position: 'absolute',
        right: '-8rem',
        top: '10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,154,108,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '8rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '720px' }}>

          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', animation: 'fadeUp 0.6s ease' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(229,186,132,0.15)', border: '1px solid rgba(229,186,132,0.3)', borderRadius: 'var(--radius-full)', padding: '0.35rem 1rem', color: 'var(--beige-300)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--beige-400)', display: 'block', animation: 'pulse-soft 2s infinite' }} />
              Excellence in Healthcare
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            color: '#fff',
            marginBottom: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.1,
            animation: 'fadeUp 0.6s ease 0.1s both',
          }}>
            Your Health,<br />
            Our <span style={{ color: 'var(--beige-300)', fontStyle: 'italic' }}>Highest</span>{' '}
            Priority
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.8,
            maxWidth: '560px',
            marginBottom: '2.5rem',
            animation: 'fadeUp 0.6s ease 0.2s both',
          }}>
            At Glow Medical, we combine cutting-edge medicine with genuine compassion.
            Experience healthcare that truly sees you as a whole person.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem', animation: 'fadeUp 0.6s ease 0.3s both' }}>
            <Link href="/public/appointment" className="btn btn-accent btn-lg">
              Book Appointment <ArrowRight size={18} />
            </Link>
            <a href="tel:+1234567890" className="btn btn-outline-white btn-lg">
              <Phone size={18} /> Call Us Now
            </a>
          </div>

          {/* Trust points */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', animation: 'fadeUp 0.6s ease 0.4s both' }}>
            {TRUST_POINTS.map(pt => (
              <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--beige-400)', flexShrink: 0 }} />
                {pt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '120px',
        background: 'linear-gradient(transparent, var(--off-white))',
        pointerEvents: 'none',
      }} />
    </section>
  );
}
