import styles from './styles.module.css'

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  rows?: number
}

const TextField = ({ label, value, onChange, placeholder, rows = 3 }: TextFieldProps) => (
  <label className={styles.field}>
    <span>{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  </label>
)

export default TextField
