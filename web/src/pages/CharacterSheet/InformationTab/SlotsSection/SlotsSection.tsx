import SectionHeading from '../../../../components/SectionHeading/SectionHeading'
import TextField from '../../../../components/TextField/TextField'
import styles from './styles.module.css'

type Slot = { id: string; label: string }

type SlotsSectionProps = {
  number: string
  title: string
  slots: Slot[]
  values: string[]
  placeholder: string
  onChange: (index: number, value: string) => void
  extra?: { label: string; value: string; placeholder: string; onChange: (value: string) => void }
}

const SlotsSection = ({
  number,
  title,
  slots,
  values,
  placeholder,
  onChange,
  extra,
}: SlotsSectionProps) => (
  <>
    <SectionHeading number={number} title={title} />
    <div className={styles.grid}>
      {slots.map((slot, index) => (
        <TextField
          key={slot.id}
          label={slot.label}
          value={values[index]}
          onChange={(value) => onChange(index, value)}
          placeholder={placeholder}
        />
      ))}
      {extra && <TextField {...extra} />}
    </div>
  </>
)

export default SlotsSection
