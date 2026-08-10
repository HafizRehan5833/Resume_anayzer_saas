'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Bot,
  BarChart3,
  Settings,
  Zap,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Candidates', href: '/candidates', icon: Users },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Interviews', href: '/interviews', icon: Calendar },
  { label: 'AI Recruiter', href: '/ai-recruiter', icon: Bot },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
    >
      <nav
        className="glass rounded-full flex items-center gap-1 px-3 py-2 max-w-5xl w-full"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 py-1.5 mr-2 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)' }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading text-base text-white hidden sm:block">Synapse</span>
        </Link>

        {/* Nav links - desktop */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-foreground/60 hover:text-foreground/90 hover:bg-white/5'
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {isLanding && (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-foreground/60 hover:text-foreground/90 hover:bg-white/5 transition-all duration-200"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/signup"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #F97316, #F8A050)',
              boxShadow: '0 0 20px rgba(249,115,22,0.3)',
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Get Started</span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="lg:hidden flex items-center gap-1 px-2 py-1.5 text-foreground/60 hover:text-foreground/90"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-16 left-4 right-4 glass rounded-2xl p-3 grid grid-cols-2 gap-1"
        >
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-primary/15 text-primary' : 'text-foreground/60 hover:bg-white/5 hover:text-foreground/90'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </motion.div>
      )}
    </motion.header>
  )
}
