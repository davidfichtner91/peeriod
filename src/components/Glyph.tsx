interface GlyphProps {
  type: 'disc' | 'ring' | 'diamond' | 'half'
  color: string
  className?: string
}

export function Glyph({ type, color, className = '' }: GlyphProps) {
  const baseProps = {
    className: `w-3 h-3 ${className}`,
    viewBox: '0 0 12 12',
    'aria-hidden': true as const,
  }

  switch (type) {
    case 'disc':
      return (
        <svg {...baseProps}>
          <circle cx="6" cy="6" r="5" fill={color} stroke={color} />
        </svg>
      )
    case 'ring':
      return (
        <svg {...baseProps}>
          <circle
            cx="6"
            cy="6"
            r="4"
            fill="none"
            stroke={color}
            strokeWidth="2.4"
          />
        </svg>
      )
    case 'diamond':
      return (
        <svg {...baseProps}>
          <path d="M6 .8 11.2 6 6 11.2 .8 6Z" fill={color} stroke={color} />
        </svg>
      )
    case 'half':
      return (
        <svg {...baseProps}>
          <circle
            cx="6"
            cy="6"
            r="4"
            fill="none"
            stroke={color}
            strokeWidth="2.4"
          />
          <path
            d="M6 1.6A4.4 4.4 0 0 1 6 10.4Z"
            fill={color}
            stroke={color}
          />
        </svg>
      )
  }
}
