import Eyebrow from '@/components/Eyebrow'
import Field from '@/components/Field'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'
import styles from './styles.module.css'

const IdentitySection = ({ character, updateField }: SheetTabProps) => (
  <>
    <div className={styles.titleRow}>
      <div className={styles.titleBlock}>
        <Eyebrow htmlFor="character-name">Name</Eyebrow>
        <input
          id="character-name"
          className={styles.nameInput}
          value={character.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="Name this character"
        />
      </div>
      <div className={styles.stamp}>
        PLAYER
        <br />
        CHARACTER
      </div>
    </div>

    <div className={styles.identityGrid}>
      <Field
        label="Background"
        value={character.concept}
        onChange={(value) => updateField('concept', value)}
        placeholder="A sentence that captures their history"
      />
      <Field
        label="Stock"
        value={character.stock}
        onChange={(value) => updateField('stock', value)}
        placeholder="People or kind"
      />
      <Field
        label="Age"
        value={character.age}
        onChange={(value) => updateField('age', value)}
        placeholder="Years"
      />
      <Field
        label="Home"
        value={character.homeland}
        onChange={(value) => updateField('homeland', value)}
        placeholder="Where they come from"
      />
    </div>
  </>
)

export default IdentitySection
