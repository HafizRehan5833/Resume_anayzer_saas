'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Star, ChevronDown, ChevronLeft, ChevronRight,
  Mail, Phone, MapPin, Briefcase, Clock, X, Bot,
  CheckCircle, XCircle, Calendar, Upload, Loader2,
} from 'lucide-react'
import { AppLayout } from '@/components/app-layout'
import { candidates as candidatesApi, applications as applicationsApi, type Candidate } from '@/lib/api'

const stageColors: Record<string, string> = {
  applied: 'rgba(255,255,255,0.5)',
  screening: '#F8E6D0',
  interview: '#F97316',
  technical: '#F97316',
  offer: '#10B981',
  hired: '#10B981',
  rejected: '#EF4444',
}

const stageLabel: Record<string, string> = {
  applied: 'text-white/50',
  screening: 'text-[#F8E6D0]',
  interview: 'text-primary',
  technical: 'text-primary',
  offer: 'text-emerald-400',
  hired: 'text-emerald-400',
  rejected: 'text-red-400',
}

function getInitials(name?: string) {
  if (!name) return ''
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function CandidatesPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [page, setPage] = useState(1)
  const perPage = 10

  const [data, setData] = useState<Candidate[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reject / hire loading state per row
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // Resume upload
  const [uploading, setUploading] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await candidatesApi.list({
        search: debouncedSearch || undefined,
        page,
        per_page: perPage,
      })
      setData(res.data ?? [])
      setTotal(res.total ?? 0)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const candidate = await candidatesApi.uploadResume(file)
      setData((prev) => [candidate, ...prev])
      setTotal((t) => t + 1)
    } catch (e: any) {
      setError(e.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleAction = async (candidateId: string, action: 'hire' | 'reject') => {
    // Find an application for this candidate if available, otherwise skip
    setActionLoading((s) => ({ ...s, [candidateId + action]: true }))
    try {
      const appsRes = await applicationsApi.list({ candidate_id: candidateId })
      const app = appsRes.data?.[0]
      if (app) {
        if (action === 'hire') await applicationsApi.hire(app.id)
        else await applicationsApi.reject(app.id)
      }
      // Update local status
      setData((prev) =>
        prev.map((c) => c.id === candidateId ? { ...c, status: action === 'hire' ? 'hired' : 'rejected' } : c)
      )
      if (selected?.id === candidateId) {
        setSelected((s) => s ? { ...s, status: action === 'hire' ? 'hired' : 'rejected' } : s)
      }
    } catch (e: any) {
      setError(e.message ?? 'Action failed')
    } finally {
      setActionLoading((s) => ({ ...s, [candidateId + action]: false }))
    }
  }

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mb-7"
        >
          <div className="text-xs text-foreground/40 uppercase tracking-[0.15em] mb-1.5">Candidates</div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-3xl text-white" style={{ letterSpacing: '-0.02em' }}>
              Candidate Pipeline
            </h1>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all cursor-pointer ${uploading ? 'opacity-60' : 'hover:scale-105'}`}
              style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing Resume...</>
                : <><Upload className="w-4 h-4" /> Upload Resume</>}
              <input type="file" accept=".pdf" className="sr-only" onChange={handleResumeUpload} disabled={uploading} />
            </label>
          </div>
        </motion.div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-4">
          {/* Main table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 min-w-0 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/35" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white/4 border border-white/8 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground/60 hover:text-foreground/90 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Filter className="w-3.5 h-3.5" /> Filter <ChevronDown className="w-3 h-3" />
              </button>
              <span className="ml-auto text-xs text-foreground/35">{total} candidates</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Candidate', 'Role', 'Stage', 'AI Score', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-foreground/35">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary/60 mx-auto" />
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-foreground/35">
                        No candidates found
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {data.map((c, i) => {
                        const stage = (c.status ?? 'applied').toLowerCase()
                        const score = c.ai_score ?? 0
                        return (
                          <motion.tr
                            key={c.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ delay: i * 0.03, ease: [0.23, 1, 0.32, 1] }}
                            onClick={() => setSelected(c)}
                            className="border-b cursor-pointer hover:bg-white/2 transition-colors"
                            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                                  style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(248,160,80,0.15))', color: '#F97316' }}
                                >
                                  {getInitials(c.full_name)}
                                </div>
                                <div>
                                  <div className="font-medium text-white text-sm">{c.full_name}</div>
                                  {c.location && (
                                    <div className="text-xs text-foreground/40 flex items-center gap-1">
                                      <MapPin className="w-2.5 h-2.5" />{c.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-sm text-foreground/75">{c.experience ?? '—'}</div>
                              {c.experience_years != null && (
                                <div className="text-xs text-foreground/35 flex items-center gap-1 mt-0.5">
                                  <Briefcase className="w-2.5 h-2.5" />{c.experience_years}y exp
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${stageLabel[stage] ?? 'text-white/50'}`}
                                style={{ background: `${stageColors[stage] ?? '#fff'}15` }}
                              >
                                {stage}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${score}%`, background: 'linear-gradient(90deg, #F97316, #F8E6D0)' }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-white">{score > 0 ? score : '—'}</span>
                                {score > 0 && <Star className="w-3 h-3 text-primary/60" />}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAction(c.id, 'hire') }}
                                  disabled={!!actionLoading[c.id + 'hire']}
                                  className="p-1.5 rounded-lg hover:bg-white/6 text-foreground/40 hover:text-emerald-400 transition-colors disabled:opacity-40"
                                  title="Hire"
                                >
                                  {actionLoading[c.id + 'hire']
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAction(c.id, 'reject') }}
                                  disabled={!!actionLoading[c.id + 'reject']}
                                  className="p-1.5 rounded-lg hover:bg-white/6 text-foreground/40 hover:text-destructive transition-colors disabled:opacity-40"
                                  title="Reject"
                                >
                                  {actionLoading[c.id + 'reject']
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <XCircle className="w-4 h-4" />}
                                </button>
                                <button className="p-1.5 rounded-lg hover:bg-white/6 text-foreground/40 hover:text-primary transition-colors" title="Schedule interview">
                                  <Calendar className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-xs text-foreground/35">
                {total > 0
                  ? `Showing ${Math.min((page - 1) * perPage + 1, total)}–${Math.min(page * perPage, total)} of ${total}`
                  : 'No results'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/6 text-foreground/50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i
                  return p <= totalPages ? (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === page ? 'text-white' : 'text-foreground/40 hover:bg-white/6'}`}
                      style={p === page ? { background: 'rgba(249,115,22,0.2)', color: '#F97316' } : {}}
                    >
                      {p}
                    </button>
                  ) : null
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/6 text-foreground/50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Candidate Detail Panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="w-80 shrink-0 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em]">Profile</span>
                  <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/6 text-foreground/40 hover:text-foreground/80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-hide">
                  <div className="flex flex-col items-center text-center mb-5">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold mb-3"
                      style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(248,160,80,0.2))', color: '#F97316' }}
                    >
                      {getInitials(selected.full_name)}
                    </div>
                    <h2 className="text-base font-semibold text-white">{selected.full_name}</h2>
                    <p className="text-xs text-foreground/50 mt-0.5">{selected.experience ?? 'No role listed'}</p>
                    {selected.ai_score != null && selected.ai_score > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Star className="w-3.5 h-3.5 text-primary" />
                        <span className="text-lg font-semibold text-white">{selected.ai_score}</span>
                        <span className="text-xs text-foreground/40">/ 100 AI Score</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-5">
                    {[
                      { icon: Mail, value: selected.email },
                      selected.phone ? { icon: Phone, value: selected.phone } : null,
                      selected.location ? { icon: MapPin, value: selected.location } : null,
                      selected.experience_years != null ? { icon: Clock, value: `${selected.experience_years} years experience` } : null,
                    ].filter(Boolean).map(({ icon: Icon, value }: any) => (
                      <div key={value} className="flex items-center gap-2 text-xs text-foreground/55">
                        <Icon className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
                        <span className="truncate">{value}</span>
                      </div>
                    ))}
                  </div>

                  {selected.summary && (
                    <div className="rounded-xl p-3 mb-5" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">AI Summary</span>
                      </div>
                      <p className="text-xs leading-relaxed text-foreground/65">{selected.summary}</p>
                    </div>
                  )}

                  {selected.skills && selected.skills.length > 0 && (
                    <div className="mb-5">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-foreground/35 mb-2">Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-full text-xs font-medium text-foreground/65"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAction(selected.id, 'hire')}
                      disabled={!!actionLoading[selected.id + 'hire']}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.2)' }}
                    >
                      {actionLoading[selected.id + 'hire'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Hire Candidate
                    </button>
                    <button
                      onClick={() => handleAction(selected.id, 'reject')}
                      disabled={!!actionLoading[selected.id + 'reject']}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-white/6 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                    >
                      {actionLoading[selected.id + 'reject'] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  )
}
