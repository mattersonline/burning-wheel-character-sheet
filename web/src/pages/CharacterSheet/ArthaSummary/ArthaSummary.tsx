import type { Artha } from '@/api/characters'
import { arthaKinds } from '@/pages/CharacterSheet/artha'
import styles from './styles.module.css'

const ArthaSummary = ({ pool }: { pool: Artha }) => (
  <section className={styles.block}>
    <h3 className={styles.heading}>Artha</h3>
    <dl className={styles.summary} aria-label="Available artha">
      {arthaKinds.map((kind) => (
        <div className={styles.item} key={kind.key}>
          <dt>{kind.label}</dt>
          <dd>{pool[kind.key]}</dd>
        </div>
      ))}
    </dl>
  </section>
)

export default ArthaSummary
