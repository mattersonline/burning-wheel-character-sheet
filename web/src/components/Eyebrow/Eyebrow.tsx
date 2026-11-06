import type { ReactNode } from 'react'
import styles from './styles.module.css'

type EyebrowProps = {
  children: ReactNode
  htmlFor?: string
}

const Eyebrow = ({ children, htmlFor }: EyebrowProps) =>
  htmlFor ? (
    <label className={styles.eyebrow} htmlFor={htmlFor}>
      {children}
    </label>
  ) : (
    <p className={styles.eyebrow}>{children}</p>
  )

export default Eyebrow
