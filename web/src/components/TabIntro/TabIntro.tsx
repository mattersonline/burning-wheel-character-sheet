import type { ReactNode } from 'react'
import styles from './styles.module.css'

const TabIntro = ({ children }: { children: ReactNode }) => (
  <p className={styles.intro}>{children}</p>
)

export default TabIntro
