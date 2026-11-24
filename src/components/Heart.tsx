export type IntimacyKind = 'sex' | 'cuddle'

export const INTIMACY_LABEL: Record<IntimacyKind, string> = {
  sex: 'Sex',
  cuddle: 'Mazlení',
}

const RED = '#E5484D'

interface HeartProps {
  kind: IntimacyKind
  className?: string
}

/** Plné srdíčko = sex, bílé s červeným obrysem = mazlení. */
export function Heart({ kind, className = '' }: HeartProps) {
  const sex = kind === 'sex'
  return (
    <svg className={className} viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M6 10.4C2.4 7.9 1 6.2 1 4.3 1 2.9 2.1 1.8 3.5 1.8c1 0 1.9.6 2.5 1.4.6-.8 1.5-1.4 2.5-1.4C9.9 1.8 11 2.9 11 4.3c0 1.9-1.4 3.6-5 6.1z"
        // Plné srdíčko dostane obrys v barvě karty, ať nesplyne s červeným
        // políčkem začátku menstruace.
        fill={sex ? RED : 'var(--card)'}
        stroke={sex ? 'var(--card)' : RED}
        strokeWidth={sex ? 1 : 1.4}
        strokeLinejoin="round"
      />
    </svg>
  )
}
