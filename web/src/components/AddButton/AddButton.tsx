import styles from './styles.module.css'

type AddButtonProps = {
  onClick: () => void
  children: string
}

const AddButton = ({ onClick, children }: AddButtonProps) => (
  <button className={styles.addButton} type="button" onClick={onClick}>
    <span aria-hidden="true">+</span> {children}
  </button>
)

export default AddButton
