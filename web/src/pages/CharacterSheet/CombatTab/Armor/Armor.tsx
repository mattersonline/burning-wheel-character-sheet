import type { Armor as ArmorData } from '../../../../api/characters'
import { armorLocations, clumsyWeightSkills } from '../../../../api/characters'
import BubbleTrack from '../../../../components/AbilityRecord/BubbleTrack/BubbleTrack'
import Stepper from '../../../../components/AbilityRecord/Stepper/Stepper'
import styles from './styles.module.css'

type ArmorProps = {
  armor: ArmorData
  onChange: (armor: ArmorData) => void
}

const Armor = ({ armor, onChange }: ArmorProps) => (
  <div className={styles.section}>
    <h3 className={styles.heading}>Armor</h3>
    <div className={styles.list}>
      {armorLocations.map((location) => {
        const piece = armor.pieces.find((item) => item.id === location.id)
        if (!piece) {
          return null
        }
        const update = (next: typeof piece) =>
          onChange({
            ...armor,
            pieces: armor.pieces.map((item) => (item.id === next.id ? next : item)),
          })

        return (
          <div className={styles.piece} key={location.id}>
            <BubbleTrack
              label={location.label}
              count={location.bubbles}
              value={piece.marked}
              onChange={(marked) => update({ ...piece, marked })}
            />
            <label className={styles.type}>
              <span className={styles.label}>Type</span>
              <input
                className={styles.input}
                aria-label={`${location.label} armor type`}
                value={piece.type}
                onChange={(event) => update({ ...piece, type: event.target.value })}
              />
            </label>
          </div>
        )
      })}
    </div>

    <h4 className={styles.subheading}>Clumsy weight</h4>
    <p className={styles.note}>Extra obstacle the armor adds to these skills.</p>
    <div className={styles.clumsy}>
      {clumsyWeightSkills.map((skill) => (
        <div className={styles.field} key={skill.key}>
          <span className={styles.label}>{skill.label}</span>
          <Stepper
            compact
            label={`${skill.label} clumsy weight`}
            max={20}
            value={armor.clumsy[skill.key]}
            onChange={(value) =>
              onChange({ ...armor, clumsy: { ...armor.clumsy, [skill.key]: value } })
            }
          />
        </div>
      ))}
    </div>
  </div>
)

export default Armor
