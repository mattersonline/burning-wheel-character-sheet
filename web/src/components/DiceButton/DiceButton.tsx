import { useState } from 'react'
import DiceIcon from '../DiceIcon/DiceIcon'
import styles from './styles.module.css'

type DiceButtonProps = {
  label: string
  onOpen: () => void
  // Shakes instead of opening when the character cannot make checks.
  incapacitated?: boolean
  disabled?: boolean
  title?: string
  small?: boolean
}

const DiceButton = ({
  label,
  onOpen,
  incapacitated = false,
  disabled = false,
  title,
  small = false,
}: DiceButtonProps) => {
  const [blocked, setBlocked] = useState(false)
  const open = () => {
    if (incapacitated) {
      setBlocked(true)
      window.setTimeout(() => setBlocked(false), 500)
      return
    }
    onOpen()
  }

  return (
    <button
      className={[styles.button, small && styles.small, blocked && styles.blocked]
        .filter(Boolean)
        .join(' ')}
      type="button"
      aria-label={label}
      title={incapacitated ? 'Incapacitated by a mortal wound' : title}
      disabled={disabled}
      onClick={open}
    >
      <DiceIcon size={small ? 16 : 26} />
    </button>
  )
}

export default DiceButton
