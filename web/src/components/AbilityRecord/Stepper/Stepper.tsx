import styles from './styles.module.css'

type StepperProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  compact?: boolean
}

const Stepper = ({ label, value, onChange, min = 0, max = 99, compact = false }: StepperProps) => (
  <div className={compact ? `${styles.stepper} ${styles.compact}` : styles.stepper}>
    <button
      className={styles.step}
      type="button"
      aria-label={`Decrease ${label}`}
      disabled={value <= min}
      onClick={() => onChange(Math.max(min, value - 1))}
    >
      −
    </button>
    <span className={styles.value} role="status" aria-label={label}>
      {value}
    </span>
    <button
      className={styles.step}
      type="button"
      aria-label={`Increase ${label}`}
      disabled={value >= max}
      onClick={() => onChange(Math.min(max, value + 1))}
    >
      +
    </button>
  </div>
)

export default Stepper
