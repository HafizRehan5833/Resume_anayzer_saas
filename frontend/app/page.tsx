'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { FloatingOrbs } from '@/components/ui/floating-orbs'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <FloatingOrbs />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />

        {/* CTA Section */}
        <section className="relative py-28 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <div
              className="relative rounded-3xl p-12 overflow-hidden"
              style={{
                background: 'rgba(249,115,22,0.05)',
                border: '1px solid rgba(249,115,22,0.2)',
                boxShadow: '0 0 60px rgba(249,115,22,0.08)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgba(249,115,22,0.08) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <div className="relative z-10">
                <h2
                  className="font-heading mb-4"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', color: '#fff' }}
                >
                  Ready to transform your hiring?
                </h2>
                <p className="text-base mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Join 2,000+ forward-thinking companies using Synapse to build world-class teams.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="group flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #F8A050)',
                      boxShadow: '0 0 30px rgba(249,115,22,0.4)',
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <span className="text-xs text-foreground/40">No credit card required</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="py-8 px-6 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-foreground/30">© 2026 Synapse AI. Built for the future of hiring.</p>
        </footer>
      </main>
    </div>
  )
}
