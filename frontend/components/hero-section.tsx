'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Users, Briefcase, TrendingUp } from 'lucide-react'

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] } },
}

const statsData = [
  { icon: Users, value: '12,400+', label: 'Candidates Placed' },
  { icon: Briefcase, value: '3,200+', label: 'Active Jobs' },
  { icon: TrendingUp, value: '94%', label: 'Hire Rate' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
      {/* Radial glow behind hero */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '900px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.2)',
              color: '#F97316',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-[0.1em] uppercase">Powered by Synapse AI</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-heading text-center leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.03em' }}
        >
          <span className="text-white">Hire Smarter</span>
          <br />
          <span className="text-white">with </span>
          <span className="shimmer">AI</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Synapse transforms recruiting with autonomous AI agents that source, screen, and rank candidates — so your team focuses on what matters.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="group relative flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #F97316, #F8A050)',
              boxShadow: '0 0 30px rgba(249,115,22,0.4), 0 0 60px rgba(249,115,22,0.15)',
            }}
          >
            <span>Start Recruiting</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full font-medium text-sm transition-all duration-200 hover:bg-white/8"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}
            >
              <Play className="w-3 h-3 text-primary ml-0.5" />
            </div>
            <span>Book Demo</span>
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {statsData.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <stat.icon className="w-4 h-4 text-primary/70" />
                <span className="text-2xl font-semibold text-white">{stat.value}</span>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-foreground/40">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Dashboard preview card */}
        <motion.div
          variants={fadeUp}
          className="mt-20 relative mx-auto max-w-4xl"
        >
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(249,115,22,0.08)',
            }}
          >
            {/* Mock dashboard header */}
            <div
              className="flex items-center gap-2 px-5 py-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-success/70" />
              <span className="ml-3 text-xs text-foreground/30">synapse.ai/dashboard</span>
            </div>

            {/* Mock metric cards */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Candidates', value: '2,847', change: '+12%', color: '#F97316' },
                { label: 'Active Jobs', value: '34', change: '+3', color: '#10B981' },
                { label: 'Interviews', value: '128', change: '+8%', color: '#F8E6D0' },
                { label: 'Hired This Month', value: '18', change: '+2', color: '#F97316' },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="text-xs text-foreground/40 mb-2 uppercase tracking-[0.1em]">{card.label}</div>
                  <div className="text-2xl font-semibold text-white">{card.value}</div>
                  <div className="text-xs mt-1" style={{ color: card.color }}>{card.change}</div>
                </div>
              ))}
            </div>

            {/* Gradient overlay at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16"
              style={{ background: 'linear-gradient(to top, rgba(3,3,3,0.8), transparent)' }}
            />
          </div>

          {/* Glow under card */}
          <div
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: '80%',
              height: '80px',
              background: 'rgba(249,115,22,0.15)',
              filter: 'blur(40px)',
              borderRadius: '50%',
            }}
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
