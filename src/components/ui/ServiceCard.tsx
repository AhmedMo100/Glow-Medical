import { Heart, Brain, Sparkles, Eye, Baby, ArrowRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { Service } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Brain,
  Sparkles,
  Eye,
  Baby,
};

// fallback generic icon
function GenericIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={28} height={28}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

interface ServiceCardProps {
  service: Service;
  variant?: 'default' | 'navy';
}

export default function ServiceCard({ service, variant = 'default' }: ServiceCardProps) {
  const Icon: LucideIcon | null = service.icon ? (ICON_MAP[service.icon] ?? null) : null;
  const isNavy = variant === 'navy';

  return (
    <div
      className={`card group ${isNavy ? 'card-navy' : ''}`}
      style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Icon */}
      <div style={{
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: 'var(--radius-md)',
        background: isNavy ? 'rgba(255,255,255,0.12)' : 'var(--beige-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isNavy ? 'var(--beige-300)' : 'var(--navy-500)',
        transition: 'all var(--transition-base)',
        flexShrink: 0,
      }}
      className="group-hover:scale-110"
      >
        {Icon ? <Icon size={26} /> : <GenericIcon />}
      </div>

      <h4 style={{
        color: isNavy ? '#fff' : 'var(--navy-700)',
        fontFamily: 'var(--font-heading)',
        fontSize: '1.3rem',
      }}>
        {service.title}
      </h4>

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
