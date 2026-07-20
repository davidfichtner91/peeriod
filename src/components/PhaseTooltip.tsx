import styles from './PhaseTooltip.module.css'

interface PhaseTooltipProps {
  name: string
  description: string
  children: React.ReactNode
}

export function PhaseTooltip({ name, description, children }: PhaseTooltipProps) {
  return (
    <div className={styles.tooltip}>
      {children}
      <div className={styles.content}>
        <div className={styles.title}>{name}</div>
        <div className={styles.text}>{description}</div>
      </div>
    </div>
  )
}
