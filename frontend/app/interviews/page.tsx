'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, Video, Users, MapPin, CheckCircle, Circle } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'

const interviews = [
  {
    id: 1, candidate: 'Sarah Chen', role: 'Sr. Frontend Engineer', type: 'Technical', avatar: 'SC',
    date: 'Today', time: '2:00 PM', duration: '60 min', medium: 'Video', interviewers: ['Jamie T.', 'Alex R.'],
    status: 'upcoming', score: 94,
  },
  {
    id: 2, candidate: 'Emily Zhao', role: 'ML Engineer', type: 'Cultural', avatar: 'EZ',
    date: 'Today', time: '4:30 PM', duration: '45 min', medium: 'Video', interviewers: ['Morgan K.'],
    status: 'upcoming', score: 91,
  },
  {
    id: 3, candidate: 'Raj Kumar', role: 'Platform Eng', type: 'Technical', avatar: 'RK',
    date: 'Tomorrow', time: '10:00 AM', duration: '90 min', medium: 'Onsite', interviewers: ['Jamie T.', 'Sam P.', 'Chris L.'],
    status: 'upcoming', score: 89,
  },
  {
    id: 4, candidate: 'Nina Sato', role: 'UX Researcher', type: 'Portfolio Review', avatar: 'NS',
    date: 'Tomorrow', time: '2:00 PM', duration: '60 min', medium: 'Video', interviewers: ['Riley M.'],
    status: 'upcoming', score: 83,
  },
  {
    id: 5, candidate: 'Marcus Lee', role: 'Product Designer', type: 'Final', avatar: 'ML',
    date: 'Jun 27', time: '11:00 AM', duration: '90 min', medium: 'Video', interviewers: ['Jamie T.', 'Alex R.', 'Casey W.'],
    status: 'completed', score: 88,
  },
  {
    id: 6, candidate: 'Priya Patel', role: 'Data Scientist', type: 'Screening', avatar: 'PP',
    date: 'Jun 26', time: '3:00 PM', duration: '30 min', medium: 'Video', interviewers: ['Morgan K.'],
    status: 'completed', score: 85,
  },
]

const typeColor: Record<string, string> = {
  Technical: '#F97316',
  Cultural: '#F8E6D0',
  'Portfolio Review': '#10B981',
  Final: '#F97316',
  Screening: 'rgba(255,255,255,0.4)',
}

export default function InterviewsPage() {
  const upcoming = interviews.filter((i) => i.status === 'upcoming')
  const completed = interviews.filter((i) => i.status === 'completed')

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mb-7"
        >
          <div className="text-xs text-foreground/40 uppercase tracking-[0.15em] mb-1.5">Interviews</div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-3xl text-white" style={{ letterSpacing: '-0.02em' }}>Schedule</h1>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}
            >
              <Calendar className="w-4 h-4" /> Schedule Interview
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: 'Upcoming', value: upcoming.length, icon: Circle, color: '#F97316' },
            { label: 'Today', value: upcoming.filter((i) => i.date === 'Today').length, icon: Calendar, color: '#F8E6D0' },
            { label: 'Completed', value: completed.length, icon: CheckCircle, color: '#10B981' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon className="w-4.5 h-4.5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl font-semibold text-white">{s.value}</div>
                <div className="text-xs text-foreground/40 uppercase tracking-[0.12em]">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upcoming */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.15em] text-foreground/35 mb-3">Upcoming</div>
          <div className="space-y-2">
            {upcoming.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ x: 2, transition: { duration: 0.2 } }}
                className="flex items-center gap-4 rounded-2xl px-5 py-4 cursor-pointer group"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(248,160,80,0.15))', color: '#F97316' }}
                >
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{item.candidate}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${typeColor[item.type] ?? '#fff'}15`, color: typeColor[item.type] ?? '#fff' }}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="text-xs text-foreground/40 mt-0.5">{item.role}</div>
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground/45 shrink-0">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{item.time}
                  </span>
                  <span className="flex items-center gap-1">
                    {item.medium === 'Video' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    {item.medium}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />{item.interviewers.length}
                  </span>
                </div>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)' }}
                >
                  Join
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Completed */}
        <div>
          <div className="text-xs uppercase tracking-[0.15em] text-foreground/35 mb-3">Completed</div>
          <div className="space-y-2">
            {completed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-center gap-4 rounded-2xl px-5 py-4 opacity-60"
                style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                >
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground/70">{item.candidate}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500/60" />
                  </div>
                  <div className="text-xs text-foreground/30 mt-0.5">{item.role} · {item.type}</div>
                </div>
                <div className="text-xs text-foreground/30">{item.date} at {item.time}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
