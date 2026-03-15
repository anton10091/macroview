'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()
  const links = [
    { href: '/macro-indicators', label: 'Индикаторы' },
    { href: '/diary',            label: 'Аналитика' },
    { href: '/profile',          label: 'Профиль' },
    { href: '/advisor',          label: 'Советник ↗', accent: true },
  ]
  return (
    <nav style={{
      background: '#1a1612', height: 48, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1a3a6a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Georgia, serif', color: '#fff', fontWeight: 900, fontSize: 14 }}>M</span>
          </div>
          <span style={{ fontFamily: 'Georgia, serif', color: '#fff', fontWeight: 700, fontSize: 15 }}>MacroView</span>
        </Link>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6a6460' }}>Глобальные инвестиции</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {links.map(({ href, label, accent }) => (
          <Link key={href} href={href} style={{
            fontFamily: 'monospace', fontSize: 11, textDecoration: 'none',
            color: accent ? '#22c55e' : pathname === href ? '#fff' : '#9a948e',
            border: accent ? '1px solid rgba(34,197,94,0.3)' : 'none',
            borderRadius: accent ? 4 : 0,
            padding: accent ? '2px 8px' : 0,
          }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
