import { useState } from 'react'
import type { Ability, Artha, MeleeWeapon } from '@/api/characters'
import { newMeleeWeapon } from '@/api/characters'
import type { WoundPenalty } from '@/components/AbilityRecord/CheckModal/rules'
import ShadeButton from '@/components/AbilityRecord/ShadeButton'
import Stepper from '@/components/AbilityRecord/Stepper'
import AddButton from '@/components/AddButton'
import DiceButton from '@/components/DiceButton'
import RemoveButton from '@/components/RemoveButton'
import AttackModal from '@/pages/CharacterSheet/CombatTab/MeleeWeapons/AttackModal'
import { weaponDamage } from '@/pages/CharacterSheet/CombatTab/weapons'
import styles from './styles.module.css'

type MeleeWeaponsProps = {
  weapons: MeleeWeapon[]
  // The wielder's Power exponent, which the I/M/S damage values are built from.
  attackerPower: number
  skills: Ability[]
  arthaPool: Artha
  woundPenalty: WoundPenalty
  onSkillsChange: (skills: Ability[]) => void
  onArthaPoolChange: (pool: Artha) => void
  onChange: (weapons: MeleeWeapon[]) => void
}

const MeleeWeapons = ({
  weapons,
  attackerPower,
  skills,
  arthaPool,
  woundPenalty,
  onSkillsChange,
  onArthaPoolChange,
  onChange,
}: MeleeWeaponsProps) => {
  const [attackingId, setAttackingId] = useState<string | null>(null)
  const attacking = weapons.find((weapon) => weapon.id === attackingId)
  const update = (next: MeleeWeapon) =>
    onChange(weapons.map((weapon) => (weapon.id === next.id ? next : weapon)))

  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>Melee weapons</h3>
      {weapons.length === 0 && <p className={styles.empty}>No melee weapons yet.</p>}
      <div className={styles.list}>
        {weapons.map((weapon) => {
          const name = weapon.name || 'weapon'
          const damage = weaponDamage(weapon, attackerPower)
          const numeric = [
            { key: 'power', label: 'Power', min: 0, value: weapon.power },
            { key: 'add', label: 'Add', min: 0, value: weapon.add },
            { key: 'versusArmor', label: 'VA', min: 0, value: weapon.versusArmor },
            { key: 'speed', label: 'WS', min: 0, value: weapon.speed },
          ] as const

          return (
            <article
              className={styles.weapon}
              key={weapon.id}
              aria-label={weapon.name || 'Unnamed weapon'}
            >
              <div className={styles.top}>
                <DiceButton
                  label={`Attack with ${name}`}
                  title="Attack"
                  incapacitated={woundPenalty.incapacitated}
                  onOpen={() => setAttackingId(weapon.id)}
                />
                <input
                  className={styles.name}
                  aria-label="Weapon name"
                  placeholder="Weapon name"
                  value={weapon.name}
                  onChange={(event) => update({ ...weapon, name: event.target.value })}
                />
                <ShadeButton
                  shade={weapon.shade}
                  onChange={(shade) => update({ ...weapon, shade })}
                />
                <dl className={styles.damage}>
                  {(
                    [
                      ['I', damage.incidental],
                      ['M', damage.mark],
                      ['S', damage.superb],
                    ] as const
                  ).map(([label, value]) => (
                    <div className={styles.damageItem} key={label}>
                      <dt title={{ I: 'Incidental', M: 'Mark', S: 'Superb' }[label]}>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className={styles.bottom}>
                <div className={styles.row}>
                  {numeric.map((field) => (
                    <div className={styles.field} key={field.key}>
                      <span className={styles.label}>{field.label}</span>
                      <Stepper
                        compact
                        label={`${name} ${field.label}`}
                        min={field.min}
                        max={20}
                        value={field.value}
                        onChange={(value) => update({ ...weapon, [field.key]: value })}
                      />
                    </div>
                  ))}
                </div>
                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.lengthField}`}>
                    <span className={styles.label}>Length</span>
                    <input
                      className={styles.length}
                      aria-label={`${name} length`}
                      value={weapon.length}
                      onChange={(event) => update({ ...weapon, length: event.target.value })}
                    />
                  </label>
                  <RemoveButton
                    onClick={() => onChange(weapons.filter((item) => item.id !== weapon.id))}
                    label={`Remove ${name}`}
                    itemName={weapon.name}
                  >
                    Remove
                  </RemoveButton>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      <AddButton onClick={() => onChange([...weapons, newMeleeWeapon()])}>
        Add melee weapon
      </AddButton>
      {attacking && (
        <AttackModal
          weapon={attacking}
          rules={{ kind: 'melee', add: attacking.add }}
          damage={weaponDamage(attacking, attackerPower)}
          skills={skills}
          arthaPool={arthaPool}
          woundPenalty={woundPenalty}
          onSkillChosen={(skillId) => update({ ...attacking, skillId })}
          onSkillChange={(skill) =>
            onSkillsChange(skills.map((item) => (item.id === skill.id ? skill : item)))
          }
          onArthaPoolChange={onArthaPoolChange}
          onClose={() => setAttackingId(null)}
        />
      )}
    </div>
  )
}

export default MeleeWeapons
