'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Shield, CreditCard, Key, Bot, Bell,
  Check, Copy, Eye, EyeOff, Zap,
} from 'lucide-react'
import { AppLayout } from '@/components/app-layout'

const TABS = [
  { id: 'general', label: 'General', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'ai', label: 'AI Settings', icon: Bot },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className="relative w-10 h-5 rounded-full transition-all duration-300 shrink-0"
      style={{ background: on ? '#F97316' : 'rgba(255,255,255,0.1)' }}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
      />
    </button>
  )
}

function APIKeyRow({ name, prefix, created }: { name: string; prefix: string; created: string }) {
  const [shown, setShown] = useState(false)
  const [copied, setCopied] = useState(false)
  const fakeKey = `sk-syn-${prefix}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

  const copy = () => {
    navigator.clipboard.writeText(fakeKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="flex-1">
        <div className="text-sm font-medium text-white mb-0.5">{name}</div>
        <div className="text-xs text-foreground/40">Created {created}</div>
      </div>
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span className="text-foreground/55">
          {shown ? fakeKey : `sk-syn-${prefix}${'•'.repeat(20)}`}
        </span>
        <button onClick={() => setShown((v) => !v)} className="text-foreground/30 hover:text-foreground/60 transition-colors">
          {shown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button onClick={copy} className="text-foreground/30 hover:text-foreground/60 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState('general')

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mb-7"
        >
          <div className="text-xs text-foreground/40 uppercase tracking-[0.15em] mb-1.5">Settings</div>
          <h1 className="font-heading text-3xl text-white" style={{ letterSpacing: '-0.02em' }}>Account Settings</h1>
        </motion.div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <motion.nav
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="w-44 shrink-0 space-y-0.5"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === t.id ? 'text-primary' : 'text-foreground/50 hover:text-foreground/80 hover:bg-white/4'
                }`}
                style={tab === t.id ? { background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' } : {}}
              >
                <t.icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </motion.nav>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* GENERAL */}
                {tab === 'general' && (
                  <div>
                    <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <h2 className="text-sm font-semibold text-white">General</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">Manage your account profile</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)' }}>
                          JD
                        </div>
                        <div>
                          <button className="text-xs px-3 py-1.5 rounded-lg font-medium text-foreground/65 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                            Change photo
                          </button>
                        </div>
                      </div>
                      {[
                        { label: 'Full Name', value: 'Jordan Davis', type: 'text' },
                        { label: 'Email', value: 'jordan@synapse.ai', type: 'email' },
                        { label: 'Company', value: 'Synapse Inc.', type: 'text' },
                        { label: 'Job Title', value: 'Head of Talent', type: 'text' },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="block text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] mb-1.5">{f.label}</label>
                          <input
                            type={f.type}
                            defaultValue={f.value}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white focus:outline-none focus:border-primary/40 transition-colors"
                          />
                        </div>
                      ))}
                      <button
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* SECURITY */}
                {tab === 'security' && (
                  <div>
                    <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <h2 className="text-sm font-semibold text-white">Security</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">Protect your account</p>
                    </div>
                    <div className="p-6 space-y-5">
                      {['Current Password', 'New Password', 'Confirm Password'].map((l) => (
                        <div key={l}>
                          <label className="block text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] mb-1.5">{l}</label>
                          <input type="password" placeholder="••••••••••••"
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white focus:outline-none focus:border-primary/40 transition-colors" />
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div>
                          <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                          <div className="text-xs text-foreground/40 mt-0.5">Add an extra layer of security</div>
                        </div>
                        <Toggle defaultOn />
                      </div>
                      <button
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}

                {/* BILLING */}
                {tab === 'billing' && (
                  <div>
                    <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <h2 className="text-sm font-semibold text-white">Billing</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">Manage your subscription</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="rounded-2xl p-5" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-white">Pro Plan</span>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full text-emerald-400" style={{ background: 'rgba(16,185,129,0.1)' }}>Active</span>
                        </div>
                        <div className="text-2xl font-semibold text-white mb-1">$499 <span className="text-sm font-normal text-foreground/45">/month</span></div>
                        <div className="text-xs text-foreground/45">Renews July 29, 2026</div>
                      </div>
                      <div className="space-y-2">
                        {[
                          'Unlimited candidates',
                          'AI resume screening',
                          'Advanced analytics',
                          'API access',
                          'Priority support',
                        ].map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-foreground/65">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* API KEYS */}
                {tab === 'api' && (
                  <div>
                    <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <h2 className="text-sm font-semibold text-white">API Keys</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">Manage access to the Synapse API</p>
                    </div>
                    <div className="px-6 py-5">
                      <APIKeyRow name="Production Key" prefix="prod-4F9g" created="Jan 15, 2026" />
                      <APIKeyRow name="Development Key" prefix="dev-8mKz" created="Mar 3, 2026" />
                      <div className="mt-4">
                        <button
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 15px rgba(249,115,22,0.25)' }}
                        >
                          <Key className="w-4 h-4" /> Generate New Key
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI SETTINGS */}
                {tab === 'ai' && (
                  <div>
                    <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <h2 className="text-sm font-semibold text-white">AI Settings</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">Configure your AI recruiter behavior</p>
                    </div>
                    <div className="p-6 space-y-5">
                      {[
                        { label: 'Autonomous resume screening', desc: 'AI screens and scores all incoming resumes', on: true },
                        { label: 'AI-generated job descriptions', desc: 'Generate job descriptions from a prompt', on: true },
                        { label: 'Bias detection', desc: 'Flag potentially biased job descriptions', on: true },
                        { label: 'Candidate outreach drafts', desc: 'AI drafts email templates for recruiters', on: false },
                        { label: 'Interview question suggestions', desc: 'Suggest structured questions per role', on: true },
                        { label: 'Predictive hire scoring', desc: 'Predict hire likelihood based on historical data', on: false },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm font-medium text-white">{s.label}</div>
                            <div className="text-xs text-foreground/40 mt-0.5">{s.desc}</div>
                          </div>
                          <Toggle defaultOn={s.on} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {tab === 'notifications' && (
                  <div>
                    <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <h2 className="text-sm font-semibold text-white">Notifications</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">Control what updates you receive</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        { label: 'New applications', desc: 'Notify when candidates apply', on: true },
                        { label: 'Interview reminders', desc: '1 hour before scheduled interviews', on: true },
                        { label: 'AI screening complete', desc: 'When batch screening finishes', on: true },
                        { label: 'Offer accepted', desc: 'When a candidate accepts an offer', on: true },
                        { label: 'Weekly pipeline digest', desc: 'Sunday summary of pipeline activity', on: false },
                        { label: 'Team activity', desc: 'When teammates take pipeline actions', on: false },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                          <div>
                            <div className="text-sm font-medium text-white">{s.label}</div>
                            <div className="text-xs text-foreground/40 mt-0.5">{s.desc}</div>
                          </div>
                          <Toggle defaultOn={s.on} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
