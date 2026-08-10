'use client'

import { motion } from 'framer-motion'
import {
  Users, Briefcase, Calendar, CheckCircle, Clock,
  TrendingUp, ArrowRight, Bot, Star,
} from 'lucide-react'
import { AppLayout } from '@/components/app-layout'
import { MetricCard } from '@/components/ui/metric-card'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

const metrics = [
  { label: 'Total Candidates', value: '2,847', change: '+12%', icon: Users, accent: '#F97316' },
  { label: 'Active Jobs', value: '34', change: '+3', changeType: 'positive' as const, icon: Briefcase, accent: '#F8E6D0' },
  { label: 'Interviews Scheduled', value: '128', change: '+8%', icon: Calendar, accent: '#10B981' },
  { label: 'Hired This Month', value: '18', change: '+2', icon: CheckCircle, accent: '#F97316' },
  { label: 'Pending Review', value: '76', change: '-5', changeType: 'negative' as const, icon: Clock, accent: '#EF4444' },
]

const chartData = [
  { month: 'Jan', applications: 120, hires: 8 },
  { month: 'Feb', applications: 180, hires: 12 },
  { month: 'Mar', applications: 150, hires: 10 },
  { month: 'Apr', applications: 210, hires: 15 },
  { month: 'May', applications: 290, hires: 18 },
  { month: 'Jun', applications: 340, hires: 22 },
  { month: 'Jul', applications: 280, hires: 19 },
]

const recentActivity = [
  { name: 'Sarah Chen', role: 'Senior Engineer', stage: 'Technical Interview', score: 92, avatar: 'SC' },
  { name: 'Marcus Lee', role: 'Product Designer', stage: 'Offer Sent', score: 88, avatar: 'ML' },
  { name: 'Priya Patel', role: 'Data Scientist', stage: 'Screening', score: 85, avatar: 'PP' },
  { name: 'James Okafor', role: 'Growth Manager', stage: 'Applied', score: 79, avatar: 'JO' },
  { name: 'Anika Rosen', role: 'Backend Engineer', stage: 'Hired', score: 95, avatar: 'AR' },
]

const stageColor: Record<string, string> = {
  'Applied': 'rgba(255,255,255,0.25)',
  'Screening': '#F8E6D0',
  'Technical Interview': '#F97316',
  'Offer Sent': '#10B981',
  'Hired': '#10B981',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 text-xs">
        <div className="font-semibold text-white mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{p.name}:</span>
            <span className="text-white font-medium">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-xs text-foreground/40 uppercase tracking-[0.15em] mb-2">
            <span>Dashboard</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-3xl text-white" style={{ letterSpacing: '-0.02em' }}>
                Good morning, Jordan
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Here&apos;s what&apos;s happening with your hiring pipeline today.
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI processed 34 resumes today</span>
            </div>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} {...m} delay={i * 0.07} changeType={m.changeType ?? 'positive'} />
          ))}
        </div>

        {/* Charts + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-white">Pipeline Overview</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Applications vs Hires</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Applications</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Hires</span>
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="applications" stroke="#F97316" strokeWidth={2} fill="url(#colorApps)" dot={false} name="Applications" />
                <Area type="monotone" dataKey="hires" stroke="#10B981" strokeWidth={2} fill="url(#colorHires)" dot={false} name="Hires" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-white">AI Insights</span>
            </div>
            <div className="space-y-3">
              {[
                { text: 'Engineering pipeline is 3x faster than last quarter', positive: true },
                { text: 'Top source: LinkedIn (42% of qualified candidates)', positive: true },
                { text: '12 candidates require follow-up within 24h', positive: false },
                { text: 'Senior roles average 18 days to fill — industry avg is 45', positive: true },
              ].map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-start gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: insight.positive ? '#10B981' : '#F97316' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{insight.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Candidates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Candidates</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Top AI-scored applicants</p>
            </div>
            <a href="/candidates" className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {recentActivity.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.06, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/2 transition-colors cursor-pointer"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(248,160,80,0.2))', color: '#F97316' }}
                >
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{c.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.role}</div>
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: stageColor[c.stage] ?? 'rgba(255,255,255,0.5)' }}>
                  <span>{c.stage}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary/70" />
                  <span className="text-xs font-semibold text-white">{c.score}</span>
                </div>
                <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${c.score}%`, background: 'linear-gradient(90deg, #F97316, #F8E6D0)' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
