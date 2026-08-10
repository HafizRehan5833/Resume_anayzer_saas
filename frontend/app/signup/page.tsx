'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { FloatingOrbs } from '@/components/ui/floating-orbs'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await signup(name, email, password, companyName)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Could not create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingOrbs />

      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 24px rgba(249,115,22,0.4)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-xl text-white">Synapse</span>
        </div>

        <div
          className="rounded-3xl p-8"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h1 className="font-heading text-2xl text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
            Create account
          </h1>
          <p className="text-sm text-foreground/45 mb-7">Start hiring smarter with AI</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Davis"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="company" className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">
                Company Name
              </label>
              <input
                id="company"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/35 hover:text-foreground/65 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2.5 rounded-xl text-xs text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 24px rgba(249,115,22,0.3)' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-foreground/40 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-foreground/25 mt-4">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}
