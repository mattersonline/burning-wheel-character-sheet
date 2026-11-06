import styles from './styles.module.css'

type BubbleTrackProps = {
  label: string
  count: number
  value: number
  onChange: (value: number) => void
}

const BubbleTrack = ({ label, count, value, onChange }: BubbleTrackProps) => (
  <fieldset className={styles.track}>
    <legend className={styles.label}>{label}</legend>
    <div className={styles.bubbles}>
      {Array.from({ length: count }, (_, position) => position + 1).map((slot) => (
        <button
          className={styles.bubble}
          type="button"
          key={slot}
          aria-pressed={slot <= value}
          aria-label={`${label} ${slot} of ${count}`}
          onClick={() => onChange(slot === value ? slot - 1 : slot)}
        />
      ))}
    </div>
  </fieldset>
)

export default BubbleTrack
