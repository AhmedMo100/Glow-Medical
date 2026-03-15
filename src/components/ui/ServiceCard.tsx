import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  variant?: 'default' | 'navy';
}

export default function ServiceCard({ service, variant = 'default' }: ServiceCardProps) {
  const isNavy = variant === 'navy';

  return (
    <div
      className={`card group ${isNavy ? 'card-navy' : ''}`}
      style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Title */}
      <h4 style={{
        color: isNavy ? '#fff' : 'var(--navy-700)',
        fontFamily: 'var(--font-heading)',
        fontSize: '1.3rem',
      }}>
        {service.name}
      </h4>

      {/* Description */}
      <p style={{
        fontSize: '0.9rem',
        lineHeight: '1.75',
        color: isNavy ? 'rgba(255,255,255,0.7)' : 'var(--gray-soft)',
        flex: 1,
      }}>
        {service.description}
      </p>

      <Link
        href={`/services#${service.id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: isNavy ? 'var(--beige-300)' : 'var(--navy-500)',
          transition: 'gap var(--transition-base)',
        }}
      >
        Learn More <ArrowRight size={14} />
      </Link>
    </div>
  );
}
