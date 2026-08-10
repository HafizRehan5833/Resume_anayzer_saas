'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, User, ArrowUp } from 'lucide-react'
import { AppLayout } from '@/components/app-layout'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  typing?: boolean
}

const SUGGESTIONS = [
  'Find senior React engineers with 5+ years experience',
  'Summarize top candidates for the ML role',
  'Which candidates have strong leadership skills?',
  'Draft an outreach email for Sarah Chen',
  'What is the average time-to-hire this quarter?',
  'Score all pending applications for the DevOps role',
]

const AI_RESPONSES: Record<string, string> = {
  default: "I've analyzed your request using the Synapse intelligence layer. Based on your current pipeline data, here's what I found:\n\nYou have 2,847 candidates across 34 open roles. Your top-performing pipeline is Engineering with a 94% screen-to-interview conversion rate.\n\nWould you like me to dive deeper into any specific role or candidate pool?",
  react: "I found **8 Senior React Engineers** matching your criteria:\n\n1. **Sarah Chen** — Score 94/100. 6 years React, TypeScript expert, strong system design. Currently in Technical Interview stage.\n\n2. **Alex Torres** — Score 89/100. 7 years, built design systems at 2 unicorns. Available immediately.\n\n3. **Kim Park** — Score 86/100. 5 years, open-source contributor, performance optimization focus.\n\nShall I draft outreach messages for the top 3?",
  ml: "Here's a summary of your top candidates for the **ML Engineer** role:\n\n**Emily Zhao** (Score 91) — PhD in ML, strong NLP background, published 4 papers. Currently in Technical stage.\n\n**Priya Patel** (Score 85) — 4 years industry experience, TensorFlow & PyTorch expertise, interested in LLM applications.\n\n**Raj Kumar** (Score 89) — Platform focus, excellent MLOps knowledge.\n\nRecommendation: Move Emily and Raj to final interview. Schedule Priya for a technical screen.",
  sarah: "Here's a draft outreach email for **Sarah Chen**:\n\n---\nSubject: Your interview with Synapse — Thursday 2:00 PM\n\nHi Sarah,\n\nThank you for taking the time to interview for the Senior Frontend Engineer role. We've been impressed by your background in React architecture and your work on large-scale design systems.\n\nYour technical interview is confirmed for Thursday at 2:00 PM PT via video call. You'll meet with Jamie T. (VP Engineering) and Alex R. (Staff Engineer).\n\nLooking forward to connecting!\n---\n\nWould you like me to adjust the tone or add any specifics?",
}

function getAIResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('react') || lower.includes('frontend') || lower.includes('senior')) return AI_RESPONSES.react
  if (lower.includes('ml') || lower.includes('machine') || lower.includes('data')) return AI_RESPONSES.ml
  if (lower.includes('sarah') || lower.includes('outreach') || lower.includes('email')) return AI_RESPONSES.sarah
  return AI_RESPONSES.default
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export default function AIRecruiterPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0, role: 'assistant',
      content: "Hello! I'm your AI Recruiter assistant. I have full context on your pipeline — 2,847 candidates, 34 open roles, and all historical hiring data.\n\nWhat would you like to know?",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return
    const userMsg: Message = { id: Date.now(), role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate streaming response
    setTimeout(() => {
      const response = getAIResponse(text)
      const aiMsg: Message = { id: Date.now() + 1, role: 'assistant', content: '', typing: true }
      setMessages((prev) => [...prev, aiMsg])

      let i = 0
      const interval = setInterval(() => {
        i += 4
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsg.id ? { ...m, content: response.slice(0, i), typing: i < response.length } : m)),
        )
        if (i >= response.length) {
          clearInterval(interval)
          setIsTyping(false)
          setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, typing: false } : m)))
        }
      }, 18)
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center justify-between px-8 py-5 border-b shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}
            >
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-sm">Synapse AI Recruiter</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400/70">Online · Full context loaded</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>GPT-4o powered</span>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={`flex items-start gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={
                    msg.role === 'assistant'
                      ? { background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 12px rgba(249,115,22,0.3)' }
                      : { background: 'rgba(255,255,255,0.08)' }
                  }
                >
                  {msg.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-foreground/70" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-xl"
                  style={
                    msg.role === 'assistant'
                      ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }
                      : { background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(248,160,80,0.15))', border: '1px solid rgba(249,115,22,0.25)', color: '#fff' }
                  }
                >
                  {msg.typing && msg.content === '' ? (
                    <TypingDots />
                  ) : (
                    <div className="whitespace-pre-line">
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i} className={line.startsWith('**') && line.endsWith('**') ? 'font-semibold text-white' : ''}>
                          {line.replace(/\*\*/g, '')}
                        </p>
                      ))}
                      {msg.typing && <span className="inline-block w-1 h-3.5 bg-primary/70 ml-0.5 animate-pulse" />}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-8 pb-4">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-2 rounded-xl text-foreground/60 hover:text-foreground/85 transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-8 pb-6 shrink-0">
          <div
            className="flex items-end gap-3 rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Synapse anything about your pipeline..."
              className="flex-1 bg-transparent text-sm text-foreground/85 placeholder:text-foreground/30 focus:outline-none resize-none leading-relaxed"
              style={{ maxHeight: '120px' }}
            />
            <motion.button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #F97316, #F8A050)' : 'rgba(255,255,255,0.08)',
                boxShadow: input.trim() ? '0 0 15px rgba(249,115,22,0.3)' : 'none',
              }}
            >
              {isTyping ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 text-white" />
              )}
            </motion.button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-foreground/25">Synapse AI · Press Enter to send · Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
