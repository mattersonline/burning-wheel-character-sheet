import { useState } from 'react'
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog'
import styles from './styles.module.css'

type RemoveButtonProps = {
  onClick: () => void
  label?: string
  // What is being removed, used in the confirmation text.
  itemName?: string
  children: string
}

// Removal always asks for confirmation first.
const RemoveButton = ({ onClick, label, itemName, children }: RemoveButtonProps) => {
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <button
        className={styles.removeButton}
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={label}
      >
        {children}
      </button>
      {confirming && (
        <ConfirmDialog
          title={`${children} ${itemName || 'this item'}?`}
          message="This can't be undone."
          confirmLabel={children}
          onConfirm={() => {
            setConfirming(false)
            onClick()
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}

export default RemoveButton
