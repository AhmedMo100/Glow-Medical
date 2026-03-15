'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SectionTitle from '@/components/ui/SectionTitle'
import Button from '@/components/ui/Button'
import { Calendar, User, ArrowRight } from 'lucide-react'

// ── Types ───────────────────────────────
interface BlogImage {
  url: string
  alt?: string
}

interface Post {
  id: number
  title: string
  slug: string
  excerpt?: string
  images?: BlogImage[]
  author: string
  readTime?: number
  publishedAt?: string
  isFeatured: boolean
  tags?: string[]
}

// ── Utils ───────────────────────────────
function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── BlogCard ────────────────────────────
function BlogCard({ post }: { post: Post }) {
  const mainImage = post.images?.[0] // ناخد أول صورة لو موجودة
  const date = post.publishedAt ? formatDate(post.publishedAt) : null

  return (
    <article className="card group" style={{ overflow: 'hidden', borderRadius: '1rem', boxShadow: '0 2px 14px rgba(8,43,86,.07)' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: 'var(--beige-100)' }}>
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt ?? post.title}
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
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '.25rem', fontSize: '.78rem', color: 'var(--beige-500)' }}>
            <Calendar size={12} /> {date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '.25rem', fontSize: '.78rem', color: 'var(--beige-500)' }}>
            <User size={12} /> {post.author}
          </span>
        </div>

        <h4 style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--navy-700)',
          fontSize: '1.1rem',
          lineHeight: 1.35,
          marginBottom: '.8rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{post.title}</h4>

        {post.excerpt && (
          <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.excerpt}
          </p>
        )}

        <Link
          href={`/blog/${post.slug}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', color: 'var(--navy-500)', fontSize: '.82rem', fontWeight: 600, textTransform: 'uppercase' }}
        >
          Read Article <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  )
}

// ── BlogSection ─────────────────────────
export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/blog?published=true&limit=20')
      .then(r => r.json())
      .then(d => setPosts((d.posts ?? []).filter((p: Post) => p.isFeatured).slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !posts.length) return null

  return (
    <section className="section" style={{ background: 'var(--beige-50)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <SectionTitle
            label="Health Insights"
            title="Latest from Our<br/>Medical Blog"
            description="Expert advice and health tips from our specialists to help you make informed decisions."
          />
          <Button href="/blog" variant="outline">View All Articles</Button>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {posts.map(p => <BlogCard key={p.id} post={p} />)}
        </div>
      </div>
    </section>
  )
}
