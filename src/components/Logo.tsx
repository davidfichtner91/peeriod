import { useId } from 'react'

interface LogoProps {
  variant?: 'gradient' | 'mono' | 'lockup'
  size?: number
  className?: string
}

export function Logo({ variant = 'gradient', size = 40, className = '' }: LogoProps) {
  const gradientId = useId()

  const aspectRatio = 200 / 220

  return (
    <svg
      width={size}
      height={size / aspectRatio}
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      className={className}
    >
      <title>Peeriod</title>
      <defs>
        {variant === 'gradient' && (
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="38"
            y1="20"
            x2="162"
            y2="180"
          >
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        )}
      </defs>
      <g
        transform="translate(-20,-10)"
        fill="none"
        stroke={variant === 'gradient' ? `url(#${gradientId})` : 'currentColor'}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="100" cy="100" r="36" />
        <path d="M125.5 74.5 L162 38" />
        <path d="M140 38 H162 V60" />
        <path d="M100 136 V178" />
        <path d="M78 160 H122" />
      </g>
    </svg>
  )
}
