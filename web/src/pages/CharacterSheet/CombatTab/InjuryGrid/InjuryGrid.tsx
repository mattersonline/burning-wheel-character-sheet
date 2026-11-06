import type { Ability } from '../../../../api/characters'
import {
  calculateInjuryThresholds,
  injuryColumnFor,
  injuryColumns,
  injuryRows,
  maxWoundsPerLevel,
  setWounds,
} from '../injuries'
import styles from './styles.module.css'

type InjuryGridProps = {
  stats: Ability[]
  wounds: number[]
  onChange: (wounds: number[]) => void
}

const levels = Array.from({ length: injuryRows }, (_, index) => index + 1)
const bubbles = Array.from({ length: maxWoundsPerLevel }, (_, index) => index + 1)

const InjuryGrid = ({ stats, wounds, onChange }: InjuryGridProps) => {
  const thresholds = calculateInjuryThresholds(stats)

  return (
    <table className={styles.grid} aria-label="Injury grid">
      <thead>
        <tr>
          {levels.map((level) => (
            <th key={level} scope="col">
              B{level}
            </th>
          ))}
        </tr>
        <tr>
          {levels.map((level) => {
            const column = injuryColumns.find((item) => thresholds[item.id] === level)
            const band = injuryColumnFor(level, thresholds)
            return (
              <td
                key={level}
                className={`${styles.tolerance} ${band ? styles.inBand : ''} ${column ? styles.start : ''}`}
                title={column?.name}
              >
                {column?.label}
              </td>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {bubbles.map((bubble) => (
          <tr key={bubble}>
            {levels.map((level) => {
              const filled = (wounds[level - 1] ?? 0) >= bubble
              return (
                <td key={level}>
                  <button
                    type="button"
                    className={`${styles.bubble} ${filled ? styles.filled : ''}`}
                    aria-pressed={filled}
                    aria-label={`B${level} wound ${bubble}`}
                    onClick={() => onChange(setWounds(wounds, level, bubble))}
                  />
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default InjuryGrid
