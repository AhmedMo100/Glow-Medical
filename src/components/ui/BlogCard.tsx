// components/ui/BlogCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/types';

interface BlogCardProps {
  post: BlogPost;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BlogCard({ post }: BlogCardProps) {
  const mainImage = post.images?.[0]; // ← هنا بدل image

  return (
    <article className="card group" style={{ overflow: 'hidden' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: 'var(--beige-100)' }}>
        {mainImage ? (
          <Image
            src={mainImage?.url ?? ''}
            alt={mainImage?.alt ?? post.title}
            fill
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
            className="group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📝</div>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 50%, rgba(4,27,56,0.35) 100%)',
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '0.9rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--beige-500)' }}>
            <Calendar size={12} /> {formatDate(post.publishedAt ?? new Date())}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--beige-500)' }}>
            <User size={12} /> {post.author}
          </span>
        </div>

        <h4 style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--navy-700)',
          fontSize: '1.2rem',
          lineHeight: '1.35',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {post.title}
        </h4>

        <Link
          href={`/blog/${post.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--navy-500)',
            fontSize: '0.82rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Read Article <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
