import type { ButtonHTMLAttributes } from 'react'
import styles from './styles.module.css'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  variant?: 'primary' | 'danger'
  block?: boolean
}

const Button = ({ variant = 'primary', block = false, type = 'button', ...props }: ButtonProps) => (
  <button
    type={type}
    className={[styles.button, styles[variant], block && styles.block].filter(Boolean).join(' ')}
    {...props}
  />
)

export default Button
