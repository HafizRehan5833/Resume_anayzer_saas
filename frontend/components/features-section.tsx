'use client'

import { motion } from 'framer-motion'
import { Bot, Search, Users, BarChart3, Zap, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Screening',
    description: 'Autonomous agents read, score, and rank resumes against your job requirements in seconds.',
    accent: '#F97316',
  },
  {
    icon: Search,
    title: 'Intelligent Sourcing',
    description: 'Surface passive candidates from 50+ channels using semantic AI matching — not just keywords.',
    accent: '#F8E6D0',
  },
  {
    icon: Users,
    title: 'Candidate Intelligence',
    description: 'Deep AI summaries, skill extraction, and culture-fit scoring for every applicant.',
    accent: '#10B981',
  },
  {
    icon: BarChart3,
    title: 'Hiring Analytics',
    description: 'Real-time pipeline metrics, funnel analysis, and recruiter performance dashboards.',
    accent: '#F97316',
  },
  {
    icon: Zap,
    title: 'Automated Workflows',
    description: 'From first contact to offer letter — intelligent automations handle the busywork.',
    accent: '#F8E6D0',
  },
  {
    icon: ShieldCheck,
    title: 'Bias-Free Hiring',
    description: 'Structured AI evaluation ensures fair, consistent, and compliant hiring decisions.',
    accent: '#10B981',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] },
  }),
}

export function FeaturesSection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}>
            <span className="tracking-[0.15em] uppercase">Platform Features</span>
          </div>
          <h2
            className="font-heading text-center mb-5"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '-0.03em', color: '#fff' }}
          >
            Everything you need to hire
            <br />
            <span className="text-gradient-orange">at the speed of AI</span>
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Synapse replaces your entire recruiting stack with a single, intelligent platform that learns and improves.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } }}
              className="glass-card p-6 cursor-default group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${feature.accent}15`, border: `1px solid ${feature.accent}25` }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.accent }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
