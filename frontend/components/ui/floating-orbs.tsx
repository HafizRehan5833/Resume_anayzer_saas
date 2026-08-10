'use client'

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Primary large orange orb */}
      <div
        className="absolute animate-orb"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.06) 50%, transparent 70%)',
          top: '-200px',
          right: '-100px',
          filter: 'blur(40px)',
        }}
      />
      {/* Secondary warm skin orb */}
      <div
        className="absolute"
        style={{
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(248,230,208,0.12) 0%, rgba(248,230,208,0.04) 50%, transparent 70%)',
          bottom: '-100px',
          left: '-150px',
          filter: 'blur(60px)',
          animation: 'orb-move 15s cubic-bezier(0.23, 1, 0.32, 1) infinite reverse',
        }}
      />
      {/* Accent small orange orb */}
      <div
        className="absolute animate-pulse-glow"
        style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          top: '40%',
          left: '20%',
          filter: 'blur(80px)',
        }}
      />
      {/* Top-center subtle orb */}
      <div
        className="absolute"
        style={{
          width: '800px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}
