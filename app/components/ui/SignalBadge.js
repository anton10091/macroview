'use client'
import { SIGNAL_CONFIG } from '../../lib/types'

const sizeStyles = {
  sm: { fontSize: 11, padding: '2px 8px' },
  md: { fontSize: 13, padding: '4px 12px' },
  lg: { fontSize: 15, padding: '6px 16px' },
}

export function SignalBadge({ signal, index, size = 'md', style: extraStyle }) {
  const cfg = SIGNAL_CONFIG[signal]
  const sz = sizeStyles[size]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'monospace', fontWeight: 600, borderRadius: 6,
      border: `1px solid ${cfg.border}`, color: cfg.color, background: cfg.bg,
      ...sz, ...extraStyle,
    }}>
      {cfg.label}
      {index !== undefined && <span style={{ opacity: 0.7 }}>· {index}/100</span>}
    </span>
  )
}
