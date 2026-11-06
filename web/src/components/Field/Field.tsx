import styles from './styles.module.css'

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
}

const Field = ({ label, value, onChange, placeholder, type, className }: FieldProps) => (
  <label className={className ? `${styles.field} ${className}` : styles.field}>
    <span>{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </label>
)

export default Field
