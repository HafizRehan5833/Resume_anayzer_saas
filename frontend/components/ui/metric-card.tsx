'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  accent?: string
  delay?: number
}

export function MetricCard({
  label,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  accent = '#F97316',
  delay = 0,
}: MetricCardProps) {
  const changeColor =
    changeType === 'positive' ? '#10B981' : changeType === 'negative' ? '#EF4444' : 'rgba(255,255,255,0.4)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } }}
      className="relative rounded-2xl p-5 cursor-default group overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at top left, ${accent}10, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
          </div>
          {change && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${changeColor}15`, color: changeColor }}>
              {change}
            </span>
          )}
        </div>
        <div className="text-2xl font-semibold text-white mb-1">{value}</div>
        <div className="text-xs uppercase tracking-[0.15em] text-foreground/45">{label}</div>
      </div>
    </motion.div>
  )
}
