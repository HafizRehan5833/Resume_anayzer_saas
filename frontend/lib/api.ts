const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    // Try to refresh
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        localStorage.setItem('access_token', data.access_token)
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
        // Retry original request with new token
        const retryRes = await fetch(`${BASE_URL}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.access_token}`,
            ...options.headers,
          },
        })
        if (!retryRes.ok) throw new ApiError(retryRes.status, await retryRes.text())
        return retryRes.json() as Promise<T>
      }
    }
    // Refresh failed — clear tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
    throw new ApiError(401, 'Unauthorized')
  }

  if (!res.ok) {
    let message = res.statusText
    try { message = (await res.json()).message ?? message } catch {}
    throw new ApiError(res.status, message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface User {
  id: string
  company_id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const auth = {
  signup: (body: { email: string; password: string; full_name: string; company_name: string }) =>
    request<AuthTokens>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

  login: async (body: { email: string; password: string }): Promise<AuthTokens> => {
    const formData = new URLSearchParams()
    formData.append('username', body.email)
    formData.append('password', body.password)
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })
    if (!res.ok) {
      let message = res.statusText
      try { message = (await res.json()).detail ?? message } catch {}
      throw new ApiError(res.status, message)
    }
    return res.json() as Promise<AuthTokens>
  },

  me: () => request<User>('/auth/me'),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  refresh: (refresh_token: string) =>
    request<AuthTokens>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),
}

// ── Candidates ────────────────────────────────────────────────────────────────

export interface Candidate {
  id: string
  company_id: string
  full_name: string
  email?: string
  phone?: string
  location?: string
  skills: string[]
  education?: string
  experience?: string
  certifications?: string
  languages: string[]
  linkedin?: string
  github?: string
  portfolio?: string
  summary?: string
  resume_path?: string
  created_at: string
  // Enhanced fields from application status join
  status?: string
  ai_score?: number
}

export interface CandidatesListResponse {
  candidates: Candidate[]
  total: number
  page: number
  size: number
}

export const candidates = {
  list: (params?: { search?: string; skill?: string; location?: string; page?: number; per_page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.skill) qs.set('skill', params.skill)
    if (params?.location) qs.set('location', params.location)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.per_page) qs.set('per_page', String(params.per_page))
    return request<CandidatesListResponse>(`/candidates${qs.toString() ? `?${qs}` : ''}`)
  },

  get: (id: string) => request<Candidate>(`/candidates/${id}`),

  create: (body: Partial<Candidate>) =>
    request<Candidate>('/candidates', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<Candidate>) =>
    request<Candidate>(`/candidates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (id: string) => request<void>(`/candidates/${id}`, { method: 'DELETE' }),

  uploadResume: (file: File) => {
    const form = new FormData()
    form.append('resume', file)
    const token = getToken()
    return fetch(`${BASE_URL}/candidates/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then((r) => r.json() as Promise<Candidate>)
  },
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export interface Job {
  id: string
  company_id?: string
  title: string
  description: string
  required_skills: string[]
  experience?: string
  salary?: string
  location?: string
  employment_type: string
  status: string
  created_at?: string
}

export interface JobsListResponse {
  jobs: Job[]
  total: number
  page: number
  size: number
}

export const jobs = {
  list: (params?: { search?: string; status?: string; employment_type?: string; location?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.employment_type) qs.set('employment_type', params.employment_type)
    if (params?.location) qs.set('location', params.location)
    if (params?.page) qs.set('page', String(params.page))
    return request<JobsListResponse>(`/jobs${qs.toString() ? `?${qs}` : ''}`)
  },

  get: (id: string) => request<Job>(`/jobs/${id}`),

  create: (body: Partial<Job>) =>
    request<Job>('/jobs', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<Job>) =>
    request<Job>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (id: string) => request<void>(`/jobs/${id}`, { method: 'DELETE' }),
}

// ── Applications ──────────────────────────────────────────────────────────────

export interface Application {
  id: string
  candidate_id: string
  job_id: string
  status: string
  ai_score?: number
  created_at: string
  // Enhanced fields for Kanban
  candidate_name?: string
  candidate_avatar?: string
  job_title?: string
}

export interface ApplicationsListResponse {
  applications: Application[]
  total: number
  page: number
  size: number
}

export const applications = {
  list: (params?: { job_id?: string; candidate_id?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.job_id) qs.set('job_id', params.job_id)
    if (params?.candidate_id) qs.set('candidate_id', params.candidate_id)
    if (params?.status) qs.set('status', params.status)
    return request<ApplicationsListResponse>(`/applications${qs.toString() ? `?${qs}` : ''}`)
  },

  create: (body: { candidate_id: string; job_id: string }) =>
    request<Application>('/applications', { method: 'POST', body: JSON.stringify(body) }),

  updateStatus: (id: string, status: string) =>
    request<Application>(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  reject: (id: string) =>
    request<Application>(`/applications/${id}/reject`, { method: 'PATCH' }),

  hire: (id: string) =>
    request<Application>(`/applications/${id}/hire`, { method: 'PATCH' }),
}

// ── Interviews ────────────────────────────────────────────────────────────────

export interface Interview {
  id: string
  application_id: string
  interview_date: string
  interview_time: string
  interview_type: string
  interviewer?: string
  meeting_link?: string
  status: string
}

export interface InterviewsListResponse {
  interviews: Interview[]
  total: number
  page: number
  size: number
}

export const interviews = {
  list: (params?: { status?: string; candidate_id?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.candidate_id) qs.set('candidate_id', params.candidate_id)
    return request<InterviewsListResponse>(`/interviews${qs.toString() ? `?${qs}` : ''}`)
  },

  create: (body: Partial<Interview>) =>
    request<Interview>('/interviews', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<Interview>) =>
    request<Interview>(`/interviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (id: string) => request<void>(`/interviews/${id}`, { method: 'DELETE' }),
}
