import type { Shade } from '../../../api/characters'
import styles from './styles.module.css'

const order: Shade[] = ['black', 'grey', 'white']

type ShadeButtonProps = {
  shade: Shade
  onChange: (shade: Shade) => void
}

const ShadeButton = ({ shade, onChange }: ShadeButtonProps) => (
  <button
    className={`${styles.shade} ${styles[shade]}`}
    type="button"
    aria-label={`Shade: ${shade}. Tap to change`}
    onClick={() => onChange(order[(order.indexOf(shade) + 1) % order.length])}
  >
    {shade[0].toUpperCase()}
  </button>
)

export default ShadeButton
