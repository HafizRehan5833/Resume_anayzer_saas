'use client'

import { Sidebar } from './sidebar'
import { FloatingOrbs } from './ui/floating-orbs'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingOrbs />
      <Sidebar />
      <main className="pl-56 min-h-screen relative z-10">
        {children}
      </main>
    </div>
  )
}
