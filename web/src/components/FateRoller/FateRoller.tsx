import { useState } from 'react'
import { rollDie } from '@/components/AbilityRecord/CheckModal/rules'
import styles from './styles.module.css'

const CrystalBallIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="26"
    height="26"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="10" r="7" />
    <path d="M8.5 7.5a4.5 4.5 0 0 1 3-1.8" />
    <path d="M6 18.5h12l1.5 3h-15z" />
  </svg>
)

// A single straight die of fate; a six gets a celebratory animation.
const FateRoller = () => {
  // The roll count restarts the animations even when the same number comes up twice.
  const [roll, setRoll] = useState<{ value: number; count: number } | null>(null)
  const isSix = roll?.value === 6

  return (
    <span className={styles.roller}>
      <button
        className={styles.button}
        type="button"
        aria-label="Roll a die of fate"
        title="Roll a die of fate"
        onClick={() =>
          setRoll((previous) => ({ value: rollDie(), count: (previous?.count ?? 0) + 1 }))
        }
      >
        <span className={`${styles.ball}${isSix ? ` ${styles.six}` : ''}`} key={roll?.count ?? 0}>
          <CrystalBallIcon />
        </span>
        {isSix && <span className={styles.burst} key={`burst-${roll.count}`} aria-hidden="true" />}
      </button>
      <output
        className={`${styles.result}${isSix ? ` ${styles.sixResult}` : ''}`}
        aria-live="polite"
      >
        {roll && (
          <span key={roll.count}>
            <span className={styles.visuallyHidden}>Die of fate: </span>
            {roll.value}
            {isSix && <span className={styles.visuallyHidden}> — a six!</span>}
          </span>
        )}
      </output>
    </span>
  )
}

export default FateRoller
