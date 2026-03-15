'use client'

import { useState } from 'react'
import { signIn }   from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email:    email.toLowerCase().trim(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(
        result.error === 'CredentialsSignin'
          ? 'Invalid email or password'
          : result.error
      )
      return
    }

    router.push('/dashboard/overview')
    router.refresh()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: rgba(255,255,255,.25); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0e2040 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes float   {
          0%,100% { transform: translateY(0px) }
          50%     { transform: translateY(-12px) }
        }
        @media (max-width: 768px) { .login-left { display: none !important; } }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex',
        background: 'linear-gradient(135deg, #041b38 0%, #082b56 50%, #041b38 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position:'absolute', top:'-120px', right:'-80px', width:400, height:400, borderRadius:'50%', background:'rgba(196,154,108,.07)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-100px', left:'-60px', width:350, height:350, borderRadius:'50%', background:'rgba(196,154,108,.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'35%', right:'42%', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,.02)', animation:'float 6s ease-in-out infinite', pointerEvents:'none' }} />

        {/* ── LEFT — Branding ── */}
        <div className="login-left" style={{
          flex:1, display:'flex', flexDirection:'column',
          justifyContent:'center', padding:'3rem 4rem',
          borderRight:'1px solid rgba(255,255,255,.06)', position:'relative',
        }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'3.5rem' }}>
            <div style={{ width:46, height:46, borderRadius:13, background:'rgba(196,154,108,.15)', border:'1px solid rgba(196,154,108,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <rect x="10" y="4" width="4" height="16" rx="2" fill="#c49a6c" />
                <rect x="4"  y="10" width="16" height="4" rx="2" fill="#c49a6c" />
              </svg>
            </div>
            <div>
              <p style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.35rem', fontWeight:600, color:'#fff', lineHeight:1.1 }}>Glow Medical</p>
              <p style={{ fontSize:'.6rem', color:'#c49a6c', letterSpacing:'.18em', textTransform:'uppercase' }}>Admin Dashboard</p>
            </div>
          </div>

          <h1 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(2rem,3vw,2.9rem)', fontWeight:600, color:'#fff', lineHeight:1.2, marginBottom:'1rem' }}>
            Welcome back,<br />
            <span style={{ color:'#c49a6c' }}>Administrator</span>
          </h1>
          <p style={{ fontSize:'.9rem', color:'rgba(255,255,255,.45)', lineHeight:1.75, maxWidth:340 }}>
            Sign in to manage appointments, patients, team members, content, and all clinic operations from one place.
          </p>

          {/* Decorative stats */}
          <div style={{ display:'flex', gap:'2.5rem', marginTop:'3rem', paddingTop:'2.5rem', borderTop:'1px solid rgba(255,255,255,.07)' }}>
            {[
              { label:'Patients',     value:'500+' },
              { label:'Treatments',   value:'50+'  },
              { label:'Team Members', value:'12'   },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2rem', fontWeight:600, color:'#c49a6c', lineHeight:1 }}>{value}</p>
                <p style={{ fontSize:'.72rem', color:'rgba(255,255,255,.35)', marginTop:'.3rem', letterSpacing:'.04em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT — Login form ── */}
        <div style={{ width:'100%', maxWidth:480, display:'flex', flexDirection:'column', justifyContent:'center', padding:'2rem' }}>
          <div style={{
            background:'rgba(255,255,255,.04)', backdropFilter:'blur(20px)',
            WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,.1)',
            borderRadius:24, padding:'2.5rem',
            boxShadow:'0 24px 80px rgba(0,0,0,.4)',
          }}>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.8rem', fontWeight:600, color:'#fff', marginBottom:'.3rem' }}>
              Sign In
            </h2>
            <p style={{ fontSize:'.85rem', color:'rgba(255,255,255,.4)', marginBottom:'2rem' }}>
              Enter your admin credentials to continue
            </p>

            {/* Error */}
            {error && (
              <div style={{
                display:'flex', alignItems:'center', gap:'.6rem',
                padding:'.8rem 1rem', marginBottom:'1.25rem',
                borderRadius:10, background:'rgba(239,68,68,.12)',
                border:'1px solid rgba(239,68,68,.25)', color:'#fca5a5',
                fontSize:'.85rem', animation:'fadeUp .2s ease both',
              }}>
                <AlertCircle size={15} style={{ flexShrink:0 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              {/* Email */}
              <div style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}>
                <label style={{ fontSize:'.72rem', fontWeight:600, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em' }}>
                  Email Address
                </label>
                <div style={{ position:'relative' }}>
                  <Mail size={14} style={{ position:'absolute', left:'.9rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.25)', pointerEvents:'none' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@glowmedical.com"
                    autoComplete="email"
                    required
                    style={{
                      width:'100%', padding:'.72rem 1rem .72rem 2.4rem',
                      background:'rgba(255,255,255,.06)',
                      border:'1.5px solid rgba(255,255,255,.1)',
                      borderRadius:10, color:'#fff', fontSize:'.9rem',
                      outline:'none', transition:'border-color 200ms ease',
                      fontFamily:'DM Sans, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(196,154,108,.6)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}>
                <label style={{ fontSize:'.72rem', fontWeight:600, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em' }}>
                  Password
                </label>
                <div style={{ position:'relative' }}>
                  <Lock size={14} style={{ position:'absolute', left:'.9rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.25)', pointerEvents:'none' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    required
                    style={{
                      width:'100%', padding:'.72rem 2.8rem .72rem 2.4rem',
                      background:'rgba(255,255,255,.06)',
                      border:'1.5px solid rgba(255,255,255,.1)',
                      borderRadius:10, color:'#fff', fontSize:'.9rem',
                      outline:'none', transition:'border-color 200ms ease',
                      fontFamily:'DM Sans, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(196,154,108,.6)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ position:'absolute', right:'.9rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,.3)', cursor:'pointer', display:'flex' }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop:'.5rem', padding:'.88rem',
                  borderRadius:12,
                  background: loading ? 'rgba(196,154,108,.35)' : 'linear-gradient(135deg, #c49a6c, #a8804f)',
                  color:'#fff', fontSize:'.95rem', fontWeight:600,
                  border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(196,154,108,.3)',
                  transition:'all 200ms ease', fontFamily:'DM Sans, sans-serif',
                }}
                onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(196,154,108,.4)' } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = loading ? 'none' : '0 8px 24px rgba(196,154,108,.3)' }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Signing in…</>
                  : 'Sign In to Dashboard'
                }
              </button>
            </form>

            <p style={{ marginTop:'1.5rem', fontSize:'.73rem', color:'rgba(255,255,255,.2)', textAlign:'center', lineHeight:1.6 }}>
              Restricted access — authorised personnel only.<br />
              Forgot your password? Run the reset script.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
