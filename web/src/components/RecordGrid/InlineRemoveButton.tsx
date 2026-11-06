import { useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'

const InlineRemoveButton = ({
  name,
  rowNumber,
  onConfirm,
}: {
  name: string
  rowNumber: number
  onConfirm: () => void
}) => {
  const [armed, setArmed] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!armed) return
    const dismissOutside = (event: Event) => {
      if (event.target !== ref.current) setArmed(false)
    }
    const dismissKey = (event: KeyboardEvent) => {
      if (event.target !== ref.current || !['Enter', ' '].includes(event.key)) setArmed(false)
    }
    const dismiss = () => setArmed(false)
    document.addEventListener('pointerdown', dismissOutside, true)
    document.addEventListener('focusin', dismissOutside, true)
    document.addEventListener('keydown', dismissKey, true)
    document.addEventListener('scroll', dismiss, true)
    window.addEventListener('blur', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true)
      document.removeEventListener('focusin', dismissOutside, true)
      document.removeEventListener('keydown', dismissKey, true)
      document.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('blur', dismiss)
    }
  }, [armed])

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.remove}${armed ? ` ${styles.confirm}` : ''}`}
      aria-label={`${armed ? 'Confirm removal of' : 'Remove'} ${name || 'item'}, row ${rowNumber}`}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else setArmed(true)
      }}
    >
      {armed ? 'Confirm' : 'Remove'}
    </button>
  )
}

export default InlineRemoveButton
