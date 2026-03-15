import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import type { Testimonial } from '@/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* Quote icon */}
      <div style={{ color: 'var(--beige-300)' }}>
        <Quote size={32} />
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: '0.2rem' }}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={16} fill="var(--beige-400)" color="var(--beige-400)" />
        ))}
      </div>

      {/* Review */}
      <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--gray-soft)', flex: 1, fontStyle: 'italic' }}>
        "{testimonial.review}"
      </p>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--beige-200)' }}>
        {testimonial.avatar ? (
          <div style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <Image src={testimonial.avatar} alt={testimonial.name} fill style={{ objectFit: 'cover' }} sizes="44px" />
          </div>
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--navy-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy-500)', fontWeight: 700, fontSize: '1rem' }}>
            {testimonial.name[0]}
          </div>
        )}
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-700)', marginBottom: '0' }}>
            {testimonial.name}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--beige-500)', marginBottom: 0 }}>Verified Patient</p>
        </div>
      </div>
    </div>
  );
}
