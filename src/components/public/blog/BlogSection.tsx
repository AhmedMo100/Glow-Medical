'use client'
// components/public/blog/BlogSection.tsx
// الهوم بيدج — آخر المقالات المميزة

import { useEffect, useState } from 'react'
import SectionTitle from '@/components/ui/SectionTitle'
import Button      from '@/components/ui/Button'

interface Post {
  id         : number
  title      : string
  slug       : string          // ← الرابط بيعتمد على slug
  excerpt?   : string
  coverImage?: string
  author     : string
  readTime?  : number
  publishedAt?: string
  isFeatured : boolean
  tags?      : string[]
}

function BlogCard({ post }: { post: Post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <a
      href={`/blog/${post.slug}`}   // ✅ slug وليس id
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--white)', borderRadius: '1rem', overflow: 'hidden',
        boxShadow: '0 2px 14px rgba(8,43,86,.07)', border: '1px solid var(--border)',
        textDecoration: 'none', transition: 'transform .25s, box-shadow .25s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(8,43,86,.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = '';                 e.currentTarget.style.boxShadow = '0 2px 14px rgba(8,43,86,.07)' }}
    >
      {/* Cover */}
      <div style={{ height: 200, background: 'var(--beige-50)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {post.coverImage
          ? <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')} />
          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📝</div>
        }
      </div>

      {/* Body */}
      <div style={{ padding: '1.15rem 1.2rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
        {post.tags?.length ? (
          <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginBottom: '.1rem' }}>
            {post.tags.slice(0, 2).map(t => (
              <span key={t} style={{ padding: '.12rem .5rem', background: 'rgba(8,43,86,.07)', borderRadius: 99, fontSize: '.67rem', color: 'var(--primary)', fontWeight: 600 }}>#{t}</span>
            ))}
          </div>
        ) : null}

        <h3 style={{ margin: 0, fontSize: '.97rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--navy-700)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h3>

        {post.excerpt && (
          <p style={{ margin: '.15rem 0 0', fontSize: '.81rem', color: 'var(--text-secondary)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {post.excerpt}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.72rem', fontWeight: 700, flexShrink: 0 }}>
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>{post.author}</p>
              {date && <p style={{ margin: 0, fontSize: '.7rem', color: 'var(--text-muted)' }}>{date}</p>}
            </div>
          </div>
          {post.readTime && <span style={{ fontSize: '.73rem', color: 'var(--text-muted)' }}>⏱ {post.readTime} min</span>}
        </div>
      </div>
    </a>
  )
}

export default function BlogSection() {
  const [posts,   setPosts]   = useState<Post[]>([])
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <SectionTitle
            label="Health Insights"
            title="Latest from Our<br/>Medical Blog"
            description="Expert advice and health tips from our specialists to help you make informed decisions."
          />
          <Button href="/blog" variant="outline">View All Articles</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {posts.map(p => <BlogCard key={p.id} post={p} />)}
        </div>
      </div>
    </section>
  )
}
