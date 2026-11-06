import Button from '@/components/Button'
import Eyebrow from '@/components/Eyebrow'
import styles from './styles.module.css'

type EmptySheetProps = {
  busy: boolean
  onCreate: () => void
}

const EmptySheet = ({ busy, onCreate }: EmptySheetProps) => (
  <div className={styles.emptySheet}>
    <div className={styles.mark} aria-hidden="true">
      BW
    </div>
    <Eyebrow>The campaign archive</Eyebrow>
    <h2>
      Every story begins
      <br />
      with someone.
    </h2>
    <p className={styles.lead}>Create a character to begin a new record.</p>
    <Button onClick={onCreate} disabled={busy}>
      Create a character
    </Button>
  </div>
)

export default EmptySheet
