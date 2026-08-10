'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, MapPin, Users, Clock, Zap, Briefcase, X,
  Building2, DollarSign, Loader2, Trash2,
} from 'lucide-react'
import { AppLayout } from '@/components/app-layout'
import { jobs as jobsApi, type Job } from '@/lib/api'

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'rgba(16,185,129,0.1)', text: '#10B981', dot: '#10B981' },
  paused: { bg: 'rgba(249,115,22,0.1)', text: '#F97316', dot: '#F97316' },
  closed: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', dot: '#EF4444' },
}

const emptyForm = {
  title: '',
  department: '',
  location: '',
  employment_type: 'Full-time',
  salary_range: '',
  description: '',
}

export default function JobsPage() {
  const [data, setData] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Job | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await jobsApi.list()
      setData(res.data ?? [])
    } catch (e: any) {
      setError(e.message ?? 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const job = await jobsApi.create({ ...form, status: 'active' })
      setData((prev) => [job, ...prev])
      setShowCreate(false)
      setForm(emptyForm)
    } catch (e: any) {
      setError(e.message ?? 'Failed to create job')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteLoading(id)
    try {
      await jobsApi.delete(id)
      setData((prev) => prev.filter((j) => j.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete job')
    } finally {
      setDeleteLoading(null)
    }
  }

  const setField = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

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
          <div className="text-xs text-foreground/40 uppercase tracking-[0.15em] mb-1.5">Jobs</div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-3xl text-white" style={{ letterSpacing: '-0.02em' }}>Open Positions</h1>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}
            >
              <Plus className="w-4 h-4" /> Post New Job
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-4">
          {/* Job Cards */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-foreground/35 text-sm">
                <Briefcase className="w-8 h-8 mb-3 text-foreground/20" />
                No jobs posted yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 self-start">
                {data.map((job, i) => {
                  const s = statusStyle[job.status ?? 'active'] ?? statusStyle.active
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: i * 0.06, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                      whileHover={{ y: -3, transition: { duration: 0.25 } }}
                      onClick={() => setSelected(job)}
                      className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: selected?.id === job.id ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle at top left, rgba(249,115,22,0.07), transparent 70%)' }}
                        aria-hidden="true"
                      />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
                          >
                            <Briefcase className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                            {job.ai_generated && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-primary"
                                style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                                <Zap className="w-2.5 h-2.5" /> AI
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                              style={{ background: s.bg, color: s.text }}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                              {job.status ?? 'active'}
                            </div>
                            <button
                              onClick={(e) => handleDelete(job.id, e)}
                              disabled={deleteLoading === job.id}
                              className="p-1 rounded-lg text-foreground/25 hover:text-red-400 hover:bg-red-400/8 transition-colors disabled:opacity-40"
                              title="Delete job"
                            >
                              {deleteLoading === job.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-white mb-1">{job.title}</h3>
                        {job.department && (
                          <div className="text-xs text-foreground/45 mb-3 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {job.department}
                          </div>
                        )}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {job.skills.slice(0, 3).map((sk) => (
                              <span key={sk} className="px-2 py-0.5 rounded-md text-[10px] text-foreground/55"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                {sk}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-[10px] text-foreground/35">+{job.skills.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-foreground/40">
                          <div className="flex items-center gap-3">
                            {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                            {job.salary_range && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary_range}</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            {job.applicants_count != null && (
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicants_count}</span>
                            )}
                            {job.created_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(job.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Job Detail */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="w-80 shrink-0 rounded-2xl overflow-hidden self-start"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em]">Job Details</span>
                  <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/6 text-foreground/40">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 overflow-y-auto max-h-[70vh] scrollbar-hide">
                  <h2 className="font-semibold text-white text-base mb-1">{selected.title}</h2>
                  <div className="text-xs text-foreground/45 mb-4">
                    {[selected.department, selected.employment_type].filter(Boolean).join(' · ')}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5 text-xs text-foreground/55">
                    {selected.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.location}</span>}
                    {selected.salary_range && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{selected.salary_range}</span>}
                    {selected.applicants_count != null && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{selected.applicants_count} applicants</span>}
                  </div>
                  {selected.description && (
                    <div className="mb-5">
                      {selected.description.split('\n').map((line, i) => (
                        <p key={i} className={`text-xs leading-relaxed mb-2 ${line.startsWith('**') ? 'font-semibold text-white/75' : 'text-foreground/55'}`}>
                          {line.replace(/\*\*/g, '')}
                        </p>
                      ))}
                    </div>
                  )}
                  {selected.skills && selected.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {selected.skills.map((sk) => (
                        <span key={sk} className="px-2.5 py-1 rounded-full text-xs text-foreground/65"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 15px rgba(249,115,22,0.25)' }}
                  >
                    View Applicants
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create Job Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, filter: 'blur(8px)' }}
                animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-lg rounded-3xl p-7"
                style={{ background: 'rgba(12,12,12,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-heading text-xl text-white">Post New Job</h2>
                    <p className="text-xs mt-1 text-foreground/45">Fill in the details to create a new posting</p>
                  </div>
                  <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-white/6 text-foreground/40">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">Job Title *</label>
                    <input required type="text" value={form.title} onChange={setField('title')} placeholder="e.g. Senior Product Manager"
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/40 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">Department</label>
                      <input type="text" value={form.department} onChange={setField('department')} placeholder="e.g. Engineering"
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/40 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">Location</label>
                      <input type="text" value={form.location} onChange={setField('location')} placeholder="e.g. Remote"
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/40 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">Employment Type</label>
                      <select value={form.employment_type} onChange={setField('employment_type')}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white focus:outline-none focus:border-primary/40 transition-colors">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">Salary Range</label>
                      <input type="text" value={form.salary_range} onChange={setField('salary_range')} placeholder="e.g. $120k–$160k"
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/40 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-[0.12em] block mb-1.5">Description</label>
                    <textarea rows={4} value={form.description} onChange={setField('description')} placeholder="Describe the role, responsibilities, and requirements..."
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/4 border border-white/8 text-white placeholder:text-foreground/25 focus:outline-none focus:border-primary/40 transition-colors resize-none" />
                  </div>
                  {error && (
                    <div className="px-4 py-2.5 rounded-xl text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {error}
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                      style={{ background: 'linear-gradient(135deg, #F97316, #F8A050)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Post Job</>}
                    </button>
                    <button type="button" onClick={() => setShowCreate(false)}
                      className="px-5 py-3 rounded-xl text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
