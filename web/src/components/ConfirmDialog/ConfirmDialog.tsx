import { useEffect, useId, useRef } from 'react'
import styles from './styles.module.css'

type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

// Mount it only while a confirmation is pending; it opens as a modal immediately.
const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const messageId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      className={styles.dialog}
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onClose={onCancel}
    >
      <div className={styles.eyebrow}>Confirm removal</div>
      <h2 className={styles.title} id={titleId}>
        {title}
      </h2>
      <p className={styles.message} id={messageId}>
        {message}
      </p>
      <div className={styles.actions}>
        <button className={styles.cancel} type="button" onClick={() => dialogRef.current?.close()}>
          Cancel
        </button>
        <button className={styles.confirm} type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
