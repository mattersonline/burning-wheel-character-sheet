import { useState } from 'react'
import type { Ability, Artha, RangedWeapon } from '../../../../api/characters'
import { newRangedWeapon } from '../../../../api/characters'
import type { WoundPenalty } from '../../../../components/AbilityRecord/CheckModal/rules'
import ShadeButton from '../../../../components/AbilityRecord/ShadeButton/ShadeButton'
import Stepper from '../../../../components/AbilityRecord/Stepper/Stepper'
import AddButton from '../../../../components/AddButton/AddButton'
import DiceButton from '../../../../components/DiceButton/DiceButton'
import RemoveButton from '../../../../components/RemoveButton/RemoveButton'
import AttackModal from '../MeleeWeapons/AttackModal/AttackModal'
import { cycleDof, dofRanges, rangedDamage } from '../weapons'
import styles from './styles.module.css'

type RangedWeaponsProps = {
  weapons: RangedWeapon[]
  // The wielder's Power exponent, which the I/M/S damage values are built from.
  attackerPower: number
  skills: Ability[]
  arthaPool: Artha
  woundPenalty: WoundPenalty
  onSkillsChange: (skills: Ability[]) => void
  onArthaPoolChange: (pool: Artha) => void
  onChange: (weapons: RangedWeapon[]) => void
}

type NumberField = {
  key: 'power' | 'versusArmor' | 'optimalDice' | 'extremeDice'
  label: string
  max: number
}

const numberFields: NumberField[] = [
  { key: 'power', label: 'Power', max: 20 },
  { key: 'versusArmor', label: 'VA', max: 20 },
  { key: 'optimalDice', label: 'Optimal dice', max: 20 },
  { key: 'extremeDice', label: 'Extreme dice', max: 20 },
]

const kindLabels: Record<RangedWeapon['kind'], string> = { missile: 'Missile', thrown: 'Thrown' }

const dieFaces = [1, 2, 3, 4, 5, 6]

const levelNames: Record<string, string> = { I: 'Incidental', M: 'Mark', S: 'Superb' }

const RangedWeapons = ({
  weapons,
  attackerPower,
  skills,
  arthaPool,
  woundPenalty,
  onSkillsChange,
  onArthaPoolChange,
  onChange,
}: RangedWeaponsProps) => {
  const [attackingId, setAttackingId] = useState<string | null>(null)
  const attacking = weapons.find((weapon) => weapon.id === attackingId)
  const update = (next: RangedWeapon) =>
    onChange(weapons.map((weapon) => (weapon.id === next.id ? next : weapon)))

  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>Ranged weapons</h3>
      {weapons.length === 0 && <p className={styles.empty}>No ranged weapons yet.</p>}
      <div className={styles.list}>
        {weapons.map((weapon) => {
          const name = weapon.name || 'weapon'
          const damage = rangedDamage(weapon, attackerPower)
          const ranges = dofRanges(weapon.dof)
          const fields = weapon.kind === 'thrown' ? numberFields : numberFields.slice(1)

          return (
            <article
              className={styles.weapon}
              key={weapon.id}
              aria-label={weapon.name || 'Unnamed ranged weapon'}
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
                  aria-label="Ranged weapon name"
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
                      ['I', 'Incidental', 'incidental', damage.incidental, ranges.incidental],
                      ['M', 'Mark', 'mark', damage.mark, ranges.mark],
                      ['S', 'Superb', 'superb', damage.superb, ranges.superb],
                    ] as const
                  ).map(([label, title, key, value, range]) => (
                    <div className={styles.damageItem} key={label}>
                      <dt title={title}>{label}</dt>
                      {weapon.kind === 'missile' ? (
                        <dd>
                          <input
                            className={styles.damageInput}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={99}
                            aria-label={`${name} ${title} damage`}
                            value={value}
                            onChange={(event) =>
                              update({
                                ...weapon,
                                [key]: Math.min(99, Math.max(0, Number(event.target.value) || 0)),
                              })
                            }
                          />
                        </dd>
                      ) : (
                        <dd>{value}</dd>
                      )}
                      <span className={styles.dof} title={`${title} on a die roll of ${range}`}>
                        {range}
                      </span>
                    </div>
                  ))}
                </dl>
              </div>
              <div className={styles.bottom}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <span className={styles.label}>Type</span>
                    <span className={styles.kindName}>{kindLabels[weapon.kind]}</span>
                  </div>
                  {fields.map((field) => (
                    <div className={styles.field} key={field.key}>
                      <span className={styles.label}>{field.label}</span>
                      <Stepper
                        compact
                        label={`${name} ${field.label}`}
                        max={field.max}
                        value={weapon[field.key]}
                        onChange={(value) => update({ ...weapon, [field.key]: value })}
                      />
                    </div>
                  ))}
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <span className={styles.label}>DoF (die faces)</span>
                    <div className={styles.faces}>
                      {dieFaces.map((face) => {
                        const level = weapon.dof[face - 1]
                        return (
                          <button
                            className={styles.face}
                            type="button"
                            key={face}
                            data-level={level}
                            aria-label={`${name} die face ${face}: ${levelNames[level]}. Tap to change`}
                            onClick={() =>
                              update({ ...weapon, dof: cycleDof(weapon.dof, face - 1) })
                            }
                          >
                            <span>{face}</span>
                            {level}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <label className={`${styles.field} ${styles.lengthField}`}>
                    <span className={styles.label}>Max range</span>
                    <input
                      className={styles.length}
                      aria-label={`${name} max range`}
                      value={weapon.maxRange}
                      onChange={(event) => update({ ...weapon, maxRange: event.target.value })}
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
      <div className={styles.adds}>
        <AddButton onClick={() => onChange([...weapons, newRangedWeapon('missile')])}>
          Add missile weapon
        </AddButton>
        <AddButton onClick={() => onChange([...weapons, newRangedWeapon('thrown')])}>
          Add thrown weapon
        </AddButton>
      </div>
      {attacking && (
        <AttackModal
          weapon={attacking}
          rules={{ kind: 'ranged', dof: attacking.dof }}
          damage={rangedDamage(attacking, attackerPower)}
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

export default RangedWeapons
