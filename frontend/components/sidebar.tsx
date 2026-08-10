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
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Candidates', href: '/candidates', icon: Users },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Interviews', href: '/interviews', icon: Calendar },
  { label: 'AI Recruiter', href: '/ai-recruiter', icon: Bot },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
]

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'ME'

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="fixed left-0 top-0 h-full w-56 z-40 flex flex-col"
      style={{
        background: 'rgba(5,5,5,0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}
        >
          <Zap className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="font-heading text-lg text-white">Synapse</span>
      </div>

      {/* Label */}
      <div className="px-5 mb-2">
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-foreground/30">Navigation</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item, i) => {
          const active = pathname.startsWith(item.href)
          return (
            <motion.div
              key={item.href}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-primary'
                    : 'text-foreground/50 hover:text-foreground/85 hover:bg-white/4'
                }`}
                style={active ? {
                  background: 'rgba(249,115,22,0.08)',
                  border: '1px solid rgba(249,115,22,0.15)',
                } : {}}
              >
                <item.icon className={`w-4 h-4 shrink-0 transition-all duration-200 ${active ? 'text-primary' : 'group-hover:text-foreground/85'}`} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 text-primary/60" />}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div className="px-3 pb-4 space-y-0.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="pt-3">
          {bottomItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? 'text-primary bg-primary/8' : 'text-foreground/50 hover:text-foreground/85 hover:bg-white/4'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl group hover:bg-white/4 transition-all">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground/85 truncate">{user?.name ?? 'Account'}</div>
            <div className="text-[10px] text-foreground/40 truncate">{user?.email ?? ''}</div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/8 text-foreground/40 hover:text-foreground/80"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
