// Конфиг сигналов CHI
export const SIGNAL_CONFIG = {
  green:  { label: '🟢 Стабильно', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  yellow: { label: '🟡 Следи',     color: '#854d0e', bg: '#fefce8', border: '#fde047' },
  red:    { label: '🔴 Осторожно', color: '#991b1b', bg: '#fef2f2', border: '#fecaca' },
}

export const DIRECTIONS = [
  { id: 'real-estate',  label: 'Недвижимость',      icon: '🏠', path: 'real-estate' },
  { id: 'stock-market', label: 'Фондовый рынок',     icon: '📈', path: 'stock-market' },
  { id: 'visa',         label: 'Переезд и ВНЖ',      icon: '✈️',  path: 'visa' },
  { id: 'business',     label: 'Бизнес и стартапы',  icon: '💼', path: 'business' },
]
