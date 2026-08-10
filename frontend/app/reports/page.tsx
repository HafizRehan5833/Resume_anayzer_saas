'use client'

import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts'
import { AppLayout } from '@/components/app-layout'
import { TrendingUp, Users, Clock, Target } from 'lucide-react'

const funnelData = [
  { stage: 'Applied', count: 2847 },
  { stage: 'Screened', count: 1240 },
  { stage: 'Interview', count: 428 },
  { stage: 'Technical', count: 186 },
  { stage: 'Offer', count: 54 },
  { stage: 'Hired', count: 38 },
]

const timeData = [
  { month: 'Jan', days: 42 },
  { month: 'Feb', days: 38 },
  { month: 'Mar', days: 35 },
  { month: 'Apr', days: 29 },
  { month: 'May', days: 24 },
  { month: 'Jun', days: 18 },
]

const sourceData = [
  { name: 'LinkedIn', value: 42 },
  { name: 'Referral', value: 28 },
  { name: 'Direct', value: 18 },
  { name: 'Job Boards', value: 12 },
]

const skillsData = [
  { skill: 'React', count: 312 },
  { skill: 'Python', count: 289 },
  { skill: 'TypeScript', count: 247 },
  { skill: 'AWS', count: 198 },
  { skill: 'SQL', count: 176 },
  { skill: 'Node.js', count: 154 },
]

const recruiterData = [
  { subject: 'Speed', A: 92 },
  { subject: 'Quality', A: 88 },
  { subject: 'Volume', A: 75 },
  { subject: 'Retention', A: 94 },
  { subject: 'D&I', A: 86 },
]

const COLORS = ['#F97316', '#F8E6D0', '#10B981', 'rgba(249,115,22,0.4)']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs">
        <div className="font-semibold text-white mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="text-foreground/65">{p.value}</div>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mb-7"
        >
          <div className="text-xs text-foreground/40 uppercase tracking-[0.15em] mb-1.5">Reports</div>
          <h1 className="font-heading text-3xl text-white" style={{ letterSpacing: '-0.02em' }}>Hiring Analytics</h1>
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Avg. Time to Hire', value: '18 days', delta: '-55% vs last yr', icon: Clock, color: '#10B981' },
            { label: 'Offer Acceptance', value: '87%', delta: '+12%', icon: Target, color: '#F97316' },
            { label: 'Pipeline Quality', value: '92/100', delta: 'AI Score', icon: TrendingUp, color: '#F8E6D0' },
            { label: 'Active Candidates', value: '2,847', delta: '+340 this month', icon: Users, color: '#F97316' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="text-2xl font-semibold text-white mb-0.5">{kpi.value}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-foreground/40 mb-1">{kpi.label}</div>
              <div className="text-xs font-medium" style={{ color: '#10B981' }}>{kpi.delta}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Hiring Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-1">Hiring Funnel</h3>
            <p className="text-xs text-foreground/40 mb-5">Candidates through each stage</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={`rgba(249,115,22,${1 - i * 0.12})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Time to Hire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-1">Time to Hire</h3>
            <p className="text-xs text-foreground/40 mb-5">Average days — AI is accelerating</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="days" stroke="#10B981" strokeWidth={2} fill="url(#timeGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Source Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-1">Candidate Sources</h3>
            <p className="text-xs text-foreground/40 mb-5">Where hires come from</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {sourceData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-foreground/55">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  {s.name} <span className="text-white ml-auto">{s.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.49, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-1">Top Skills</h3>
            <p className="text-xs text-foreground/40 mb-5">In-demand across all roles</p>
            <div className="space-y-2.5">
              {skillsData.map((s, i) => (
                <div key={s.skill}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground/65">{s.skill}</span>
                    <span className="text-white font-medium">{s.count}</span>
                  </div>
                  <motion.div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / 312) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, #F97316, rgba(249,115,22,${0.5 - i * 0.06}))` }}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recruiter Performance Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-1">Recruiter Performance</h3>
            <p className="text-xs text-foreground/40 mb-5">AI-scored team metrics</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={recruiterData} margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Radar dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
