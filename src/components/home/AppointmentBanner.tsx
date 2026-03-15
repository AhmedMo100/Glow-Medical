import Link from 'next/link';
import { Phone, CalendarDays } from 'lucide-react';

export default function AppointmentBanner() {
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '5rem 0',
      background: `
        linear-gradient(135deg, var(--navy-700) 0%, var(--navy-500) 100%)
      `,
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-80px', left: '-80px',  width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(196,154,108,0.08)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(196,154,108,0.06)' }} />

      <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: 'rgba(229,186,132,0.15)', border: '1px solid rgba(229,186,132,0.3)', borderRadius: 'var(--radius-full)', padding: '0.35rem 1.2rem', color: 'var(--beige-300)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Ready to Begin?
        </span>

        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: 'clamp(2rem, 4vw, 3.2rem)', marginBottom: '1rem' }}>
          Schedule Your Appointment Today
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
          Taking the first step toward better health is easy. Our team is ready to guide you every step of the way.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/appointment" className="btn btn-accent btn-lg">
            <CalendarDays size={18} /> Book Appointment
          </Link>
          <a href="tel:+1234567890" className="btn btn-outline-white btn-lg">
            <Phone size={18} /> +1 (234) 567-890
          </a>
        </div>
      </div>
    </section>
  );
}
