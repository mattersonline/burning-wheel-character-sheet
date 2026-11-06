import styles from './styles.module.css'

type SectionHeadingProps = {
  number: string
  title: string
  first?: boolean
  // Reduces the space above, for headings that follow a small summary block.
  snug?: boolean
}

const SectionHeading = ({ number, title, first = false, snug = false }: SectionHeadingProps) => (
  <div
    className={[styles.heading, first && styles.first, snug && styles.snug]
      .filter(Boolean)
      .join(' ')}
  >
    <span>{number}</span>
    <h2>{title}</h2>
    <i />
  </div>
)

export default SectionHeading
