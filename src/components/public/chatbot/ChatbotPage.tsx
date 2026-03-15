'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Send, Sparkles, Phone, Mail, MessageCircle,
  ExternalLink, X, RotateCcw, ChevronRight,
} from 'lucide-react'

/* ── TYPES ───────────────────────────────────────────────── */
interface Message {
  id:       string
  role:     'user' | 'assistant'
  content:  string
  showContact?: boolean
}

/* ── SUGGESTED QUESTIONS ─────────────────────────────────── */
const SUGGESTIONS = [
  'What treatments are best for acne scars?',
  'Is laser hair removal painful?',
  'How long does Botox last?',
  'What\'s the best skincare routine for my 30s?',
  'What should I expect after a chemical peel?',
  'Can I combine multiple treatments?',
]

const WELCOME_MSG = `Hi! I'm Glow Assistant 👋

I'm here to help you with questions about aesthetic treatments, skincare routines, and dermatology.

Feel free to ask me anything — and if you'd like a personalised consultation, I can connect you with our clinic team.

What can I help you with today?`

/* ── CONTACT CARD ─────────────────────────────────────────── */
function ContactCard() {
  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem 1.1rem',
      borderRadius: 14,
      background: 'linear-gradient(135deg, rgba(8,43,86,.06) 0%, rgba(196,154,108,.1) 100%)',
      border: '1px solid rgba(196,154,108,.25)',
    }}>
      <p style={{ fontSize: '.82rem', fontWeight: 600, color: '#082b56', marginBottom: '.6rem', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
        <Sparkles size={13} style={{ color: '#c49a6c' }} />
        Ready to take the next step?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {[
          { icon: MessageCircle, label: 'WhatsApp',   href: 'https://wa.me/201000000000', color: '#25D366', text: '+20 100 000 0000' },
          { icon: Phone,         label: 'Call us',    href: 'tel:+201000000000',           color: '#082b56', text: '+20 100 000 0000' },
          { icon: Mail,          label: 'Email us',   href: 'mailto:hello@glowmedical.com',color: '#c49a6c', text: 'hello@glowmedical.com' },
          { icon: ExternalLink,  label: 'Book online',href: '/contact#book',                color: '#082b56', text: 'Contact page' },
        ].map(({ icon: Icon, label, href, color, text }) => (
          <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              padding: '.45rem .65rem', borderRadius: 8,
              background: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.9)',
              fontSize: '.78rem', color: '#1a1a1a', textDecoration: 'none',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.7)'}
          >
            <Icon size={13} style={{ color, flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color, minWidth: 70 }}>{label}</span>
            <span style={{ color: '#888' }}>{text}</span>
            <ChevronRight size={11} style={{ color: '#ccc', marginLeft: 'auto', flexShrink: 0 }} />
          </a>
        ))}
      </div>
    </div>
  )
}

/* ── MESSAGE BUBBLE ───────────────────────────────────────── */
function Bubble({ msg, isLast, streaming }: { msg: Message; isLast: boolean; streaming: boolean }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '.6rem',
      alignItems: 'flex-end',
      animation: isLast ? 'fadeUp .25s ease both' : 'none',
    }}>
      {/* Avatar */}
      {!isUser && (
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #082b56, #0e3d75)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(8,43,86,.3)' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <rect x="10" y="4" width="4" height="16" rx="2" fill="#c49a6c" />
            <rect x="4"  y="10" width="16" height="4" rx="2" fill="#c49a6c" />
          </svg>
        </div>
      )}

      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {/* Bubble */}
        <div style={{
          padding: '.8rem 1.1rem',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser
            ? 'linear-gradient(135deg, #082b56, #0e3d75)'
            : '#fff',
          color: isUser ? '#fff' : '#1a1a1a',
          fontSize: '.9rem',
          lineHeight: 1.65,
          boxShadow: isUser
            ? '0 4px 16px rgba(8,43,86,.25)'
            : '0 2px 12px rgba(0,0,0,.07)',
          border: isUser ? 'none' : '1px solid #f0e8de',
          whiteSpace: 'pre-wrap',
        }}>
          {msg.content}
          {streaming && isLast && !isUser && (
            <span style={{ display: 'inline-flex', gap: 3, marginLeft: 4, verticalAlign: 'middle' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%', background: '#c49a6c',
                  display: 'inline-block',
                  animation: `bounce .9s ease-in-out ${i * .15}s infinite`,
                }} />
              ))}
            </span>
          )}
        </div>
        {/* Contact card if redirect triggered */}
        {msg.showContact && <ContactCard />}
      </div>
    </div>
  )
}

/* ── MAIN COMPONENT ───────────────────────────────────────── */
export default function ChatbotPage() {
  const [messages,  setMessages]  = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: WELCOME_MSG },
  ])
  const [input,     setInput]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error,     setError]     = useState('')

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const abortRef   = useRef<AbortController | null>(null)

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* auto-resize textarea */
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  /* ── SEND ── */
  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || streaming) return

    setInput('')
    setError('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    const assistantId = (Date.now() + 1).toString()
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setStreaming(true)

    abortRef.current = new AbortController()

    try {
      // Build conversation history (exclude welcome message from API call)
      const history = [...messages.filter(m => m.id !== 'welcome'), userMsg]
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chatbot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  abortRef.current.signal,
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let showContact = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              accumulated += parsed.text
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
              )
            }
            if (parsed.redirect) showContact = true
          } catch {}
        }
      }

      // Set contact card if redirect triggered
      if (showContact) {
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, showContact: true } : m)
        )
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Something went wrong. Please try again.')
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      }
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, messages])

  const handleReset = () => {
    abortRef.current?.abort()
    setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MSG }])
    setInput('')
    setStreaming(false)
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /* ── RENDER ── */
  return (
    <>
      <style>{`
        @keyframes fadeUp    { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes bounce    { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-4px) } }
        @keyframes shimmer   { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
      `}</style>

      <div style={{
        minHeight:      '100vh',
        background:     'linear-gradient(160deg, #f5f0ea 0%, #ede5d8 40%, #f0e8df 100%)',
        paddingTop:     72,   /* navbar height */
        display:        'flex',
        flexDirection:  'column',
      }}>

        {/* ── HERO HEADER ── */}
        <div style={{
          background:    'linear-gradient(135deg, #082b56 0%, #0e3d75 60%, #082b56 100%)',
          padding:       '2.5rem 2rem 0',
          textAlign:     'center',
          position:      'relative',
          overflow:      'hidden',
        }}>
          {/* Decorative orbs */}
          <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(196,154,108,.1)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-60, left:-30, width:200, height:200, borderRadius:'50%', background:'rgba(196,154,108,.06)', pointerEvents:'none' }} />

          <div style={{ position:'relative', maxWidth:600, margin:'0 auto' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.4rem 1rem', borderRadius:'var(--r-full)', background:'rgba(196,154,108,.15)', border:'1px solid rgba(196,154,108,.3)', marginBottom:'1rem' }}>
              <Sparkles size={13} style={{ color:'#c49a6c' }} />
              <span style={{ fontSize:'.75rem', fontWeight:600, color:'#c49a6c', letterSpacing:'.08em', textTransform:'uppercase' }}>AI Beauty Assistant</span>
            </div>
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(1.6rem,4vw,2.2rem)', fontWeight:600, color:'#fff', marginBottom:'.5rem', lineHeight:1.2 }}>
              Ask Glow Assistant
            </h1>
            <p style={{ fontSize:'.9rem', color:'rgba(255,255,255,.65)', marginBottom:'1.75rem', lineHeight:1.6 }}>
              Get expert answers about aesthetic treatments, skincare routines, and beauty advice — available 24/7.
            </p>
          </div>

          {/* Wave separator */}
          <svg viewBox="0 0 1440 40" style={{ display:'block', marginBottom:-1, width:'100%' }} preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f5f0ea" />
          </svg>
        </div>

        {/* ── CHAT AREA ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', maxWidth:780, width:'100%', margin:'0 auto', padding:'0 1rem 2rem', gap:'1rem' }}>

          {/* Chat window */}
          <div style={{
            flex:1,
            background:'rgba(255,255,255,.7)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            borderRadius:20,
            border:'1px solid rgba(255,255,255,.9)',
            boxShadow:'0 8px 48px rgba(8,43,86,.1)',
            display:'flex',
            flexDirection:'column',
            overflow:'hidden',
            minHeight:480,
          }}>

            {/* Chat header */}
            <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(240,232,222,.8)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,.8)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#082b56,#0e3d75)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 10px rgba(8,43,86,.3)' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <rect x="10" y="4" width="4" height="16" rx="2" fill="#c49a6c" />
                    <rect x="4"  y="10" width="16" height="4" rx="2" fill="#c49a6c" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize:'.875rem', fontWeight:700, color:'#082b56', lineHeight:1.2 }}>Glow Assistant</p>
                  <p style={{ fontSize:'.7rem', color:'#10b981', display:'flex', alignItems:'center', gap:'.25rem' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse-soft 2s ease infinite' }} />
                    Online — always here for you
                  </p>
                </div>
              </div>
              <button onClick={handleReset} style={{ display:'flex', alignItems:'center', gap:'.35rem', padding:'.35rem .75rem', borderRadius:'var(--r-full)', border:'1px solid rgba(240,232,222,.8)', background:'rgba(245,240,234,.5)', color:'#888', fontSize:'.75rem', cursor:'pointer', transition:'all 150ms' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f5f0ea'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,240,234,.5)'}
              >
                <RotateCcw size={12} /> New chat
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {messages.map((msg, i) => (
                <Bubble key={msg.id} msg={msg} isLast={i === messages.length - 1} streaming={streaming} />
              ))}
              {/* Error */}
              {error && (
                <div style={{ padding:'.75rem 1rem', borderRadius:10, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#dc2626', fontSize:'.82rem', display:'flex', justifyContent:'space-between' }}>
                  {error}
                  <button onClick={() => setError('')} style={{ color:'#dc2626', background:'none', border:'none', cursor:'pointer' }}><X size={13} /></button>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{ padding:'.85rem 1rem', borderTop:'1px solid rgba(240,232,222,.8)', background:'rgba(255,255,255,.9)' }}>
              <div style={{ display:'flex', gap:'.6rem', alignItems:'flex-end' }}>
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Ask about treatments, skincare, or anything beauty-related…"
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  disabled={streaming}
                  style={{
                    flex:1, resize:'none', border:'1.5px solid rgba(232,217,200,.8)',
                    borderRadius:12, padding:'.65rem .9rem',
                    fontFamily:'var(--font-body)', fontSize:'.9rem', color:'#1a1a1a',
                    background:'rgba(249,245,240,.6)',
                    outline:'none', lineHeight:1.5, transition:'border-color 150ms',
                    overflow:'hidden',
                  }}
                  onFocus={e => e.target.style.borderColor = '#082b56'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(232,217,200,.8)'}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || streaming}
                  style={{
                    width:42, height:42, borderRadius:'50%', flexShrink:0,
                    background: (!input.trim() || streaming) ? 'var(--cream-dark, #ede5d8)' : 'linear-gradient(135deg, #082b56, #0e3d75)',
                    color: (!input.trim() || streaming) ? '#aaa' : '#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow: (!input.trim() || streaming) ? 'none' : '0 4px 14px rgba(8,43,86,.35)',
                    transition:'all 200ms ease',
                    border:'none', cursor: (!input.trim() || streaming) ? 'not-allowed' : 'pointer',
                    transform: (!input.trim() || streaming) ? 'scale(1)' : 'scale(1)',
                  }}
                  onMouseEnter={e => { if (input.trim() && !streaming) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                >
                  <Send size={16} />
                </button>
              </div>
              <p style={{ fontSize:'.68rem', color:'#bbb', marginTop:'.5rem', textAlign:'center' }}>
                For medical advice, always consult a qualified practitioner. · Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Suggested questions */}
          {messages.length <= 2 && (
            <div>
              <p style={{ fontSize:'.75rem', fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.6rem' }}>
                Suggested questions
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem' }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSend(s)} style={{
                    padding:'.45rem .9rem', borderRadius:'var(--r-full)',
                    background:'rgba(255,255,255,.8)', border:'1px solid rgba(232,217,200,.9)',
                    fontSize:'.8rem', color:'#555', cursor:'pointer',
                    transition:'all 150ms ease', backdropFilter:'blur(4px)',
                    boxShadow:'0 1px 6px rgba(8,43,86,.06)',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#fff'; (e.currentTarget as HTMLElement).style.color='#082b56'; (e.currentTarget as HTMLElement).style.borderColor='#c49a6c' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.8)'; (e.currentTarget as HTMLElement).style.color='#555'; (e.currentTarget as HTMLElement).style.borderColor='rgba(232,217,200,.9)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
