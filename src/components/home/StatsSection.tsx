import { STATS } from '@/lib/data';

export default function StatsSection() {
  return (
    <section style={{ background: 'var(--navy-700)', padding: '4rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(196,154,108,0.06)', pointerEvents: 'none' }} />

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="stat-number stat-number-white">{stat.value}</span>
              <div style={{ width: '2rem', height: '2px', background: 'var(--beige-400)', margin: '0.3rem auto' }} />
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
