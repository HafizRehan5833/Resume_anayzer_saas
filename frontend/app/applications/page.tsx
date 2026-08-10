'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MoreHorizontal, Bot } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'

type Stage = 'Applied' | 'Screening' | 'Interview' | 'Technical' | 'Offer' | 'Hired'

interface Card {
  id: number
  name: string
  role: string
  score: number
  avatar: string
  stage: Stage
  time: string
  aiNote?: string
}

const INITIAL_CARDS: Card[] = [
  { id: 1, name: 'Sarah Chen', role: 'Sr. Frontend Eng', score: 94, avatar: 'SC', stage: 'Interview', time: '2h ago', aiNote: 'Strong technical background' },
  { id: 2, name: 'Marcus Lee', role: 'Product Designer', score: 88, avatar: 'ML', stage: 'Offer', time: '1d ago', aiNote: 'Excellent portfolio' },
  { id: 3, name: 'Priya Patel', role: 'Data Scientist', score: 85, avatar: 'PP', stage: 'Screening', time: '3h ago' },
  { id: 4, name: 'James Okafor', role: 'Growth Manager', score: 79, avatar: 'JO', stage: 'Applied', time: '5h ago' },
  { id: 5, name: 'Anika Rosen', role: 'Backend Eng', score: 97, avatar: 'AR', stage: 'Hired', time: '2d ago', aiNote: 'Top performer' },
  { id: 6, name: 'Tomás Rivera', role: 'DevOps Eng', score: 82, avatar: 'TR', stage: 'Screening', time: '1h ago' },
  { id: 7, name: 'Emily Zhao', role: 'ML Engineer', score: 91, avatar: 'EZ', stage: 'Technical', time: '4h ago', aiNote: 'Strong ML skills' },
  { id: 8, name: 'Liam Walsh', role: 'iOS Developer', score: 76, avatar: 'LW', stage: 'Applied', time: '6h ago' },
  { id: 9, name: 'Nina Sato', role: 'UX Researcher', score: 83, avatar: 'NS', stage: 'Interview', time: '1d ago' },
  { id: 10, name: 'Raj Kumar', role: 'Platform Eng', score: 89, avatar: 'RK', stage: 'Technical', time: '3h ago', aiNote: 'Infrastructure expert' },
]

const STAGES: Stage[] = ['Applied', 'Screening', 'Interview', 'Technical', 'Offer', 'Hired']

const stageAccent: Record<Stage, string> = {
  Applied: 'rgba(255,255,255,0.2)',
  Screening: '#F8E6D0',
  Interview: '#F97316',
  Technical: '#F97316',
  Offer: '#10B981',
  Hired: '#10B981',
}

const stageCount = (cards: Card[], stage: Stage) => cards.filter((c) => c.stage === stage).length

export default function ApplicationsPage() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS)
  const [dragging, setDragging] = useState<Card | null>(null)
  const [overStage, setOverStage] = useState<Stage | null>(null)

  const handleDragStart = (card: Card) => setDragging(card)
  const handleDragEnd = () => { setDragging(null); setOverStage(null) }

  const handleDrop = (stage: Stage) => {
    if (dragging && dragging.stage !== stage) {
      setCards((prev) => prev.map((c) => (c.id === dragging.id ? { ...c, stage } : c)))
    }
    setDragging(null)
    setOverStage(null)
  }

  return (
    <AppLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mb-7"
        >
          <div className="text-xs text-foreground/40 uppercase tracking-[0.15em] mb-1.5">Applications</div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-3xl text-white" style={{ letterSpacing: '-0.02em' }}>Kanban Pipeline</h1>
            <div className="text-xs text-foreground/40">Drag cards to move candidates between stages</div>
          </div>
        </motion.div>

        {/* Kanban Board */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {STAGES.map((stage, si) => (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: si * 0.07, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex-shrink-0 w-56 flex flex-col"
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage) }}
              onDrop={() => handleDrop(stage)}
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-2"
                style={{
                  background: overStage === stage ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)',
                  border: overStage === stage ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: stageAccent[stage] }} />
                  <span className="text-xs font-semibold text-white">{stage}</span>
                </div>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: `${stageAccent[stage]}18`, color: stageAccent[stage] }}
                >
                  {stageCount(cards, stage)}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 min-h-20">
                {cards.filter((c) => c.stage === stage).map((card, ci) => (
                  <motion.div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(card)}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: dragging?.id === card.id ? 0.5 : 1, y: 0 }}
                    transition={{ delay: si * 0.07 + ci * 0.04, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="rounded-xl p-3 cursor-grab active:cursor-grabbing group"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      userSelect: 'none',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
                          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(248,160,80,0.15))', color: '#F97316' }}
                        >
                          {card.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white leading-tight">{card.name}</div>
                          <div className="text-[10px] text-foreground/40 leading-tight">{card.role}</div>
                        </div>
                      </div>
                      <button className="p-0.5 rounded hover:bg-white/6 text-foreground/25 hover:text-foreground/60 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {card.aiNote && (
                      <div className="flex items-start gap-1.5 mb-2 px-2 py-1.5 rounded-lg"
                        style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.12)' }}>
                        <Bot className="w-3 h-3 text-primary/70 mt-0.5 shrink-0" />
                        <span className="text-[10px] text-foreground/60 leading-relaxed">{card.aiNote}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-10 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${card.score}%`, background: 'linear-gradient(90deg, #F97316, #F8E6D0)' }}
                          />
                        </div>
                        <Star className="w-2.5 h-2.5 text-primary/60" />
                        <span className="text-[10px] font-semibold text-white">{card.score}</span>
                      </div>
                      <span className="text-[10px] text-foreground/30">{card.time}</span>
                    </div>
                  </motion.div>
                ))}

                {/* Drop indicator */}
                {overStage === stage && dragging && dragging.stage !== stage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border-2 border-dashed h-16"
                    style={{ borderColor: 'rgba(249,115,22,0.35)', background: 'rgba(249,115,22,0.05)' }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
