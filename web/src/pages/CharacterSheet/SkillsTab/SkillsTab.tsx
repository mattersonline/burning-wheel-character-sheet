import { newAbility, newId } from '@/api/characters'
import AbilityRecord from '@/components/AbilityRecord'
import { recordAdvancement } from '@/components/AbilityRecord/CheckModal/rules'
import AddButton from '@/components/AddButton'
import SectionHeading from '@/components/SectionHeading'
import TabIntro from '@/components/TabIntro'
import TextField from '@/components/TextField'
import { calculateWoundPenalty } from '@/pages/CharacterSheet/CombatTab/injuries'
import LearningSkillRow from '@/pages/CharacterSheet/SkillsTab/LearningSkillRow'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'
import styles from './styles.module.css'

const SkillsTab = ({ character, updateField, updateSheetData }: SheetTabProps) => {
  const { skillRecords, learningSkills, arthaPool, stats, injuryWounds } = character.sheetData
  const woundPenalty = calculateWoundPenalty(stats, injuryWounds)

  return (
    <>
      <SectionHeading number="01" title="Skills" first />
      <TabIntro>Record each skill with its exponent, shade, advancement, and artha spent.</TabIntro>
      <div className={styles.abilities}>
        {skillRecords.map((skill) => (
          <AbilityRecord
            key={skill.id}
            ability={skill}
            showOpenToggle
            namePlaceholder="Skill name"
            arthaPool={arthaPool}
            woundPenalty={woundPenalty}
            onArthaPoolChange={(pool) => updateSheetData('arthaPool', pool)}
            onChange={(next) =>
              updateSheetData(
                'skillRecords',
                skillRecords.map((item) => (item.id === next.id ? next : item)),
              )
            }
            onRemove={() =>
              updateSheetData(
                'skillRecords',
                skillRecords.filter((item) => item.id !== skill.id),
              )
            }
          />
        ))}
      </div>
      <AddButton onClick={() => updateSheetData('skillRecords', [...skillRecords, newAbility()])}>
        Add skill
      </AddButton>

      <SectionHeading number="02" title="Skills being learned" />
      <div className={`${styles.abilities} ${styles.learningList}`}>
        {learningSkills.map((skill) => (
          <LearningSkillRow
            key={skill.id}
            skill={skill}
            stats={stats}
            arthaPool={arthaPool}
            woundPenalty={woundPenalty}
            onArthaPoolChange={(pool) => updateSheetData('arthaPool', pool)}
            onStatTest={(statId, kind) =>
              updateSheetData(
                'stats',
                stats.map((item) =>
                  item.id === statId
                    ? { ...item, advancement: recordAdvancement(item.advancement, kind) }
                    : item,
                ),
              )
            }
            onChange={(next) =>
              updateSheetData(
                'learningSkills',
                learningSkills.map((item) => (item.id === next.id ? next : item)),
              )
            }
            onRemove={() =>
              updateSheetData(
                'learningSkills',
                learningSkills.filter((item) => item.id !== skill.id),
              )
            }
            onOpen={(opened) => {
              updateSheetData('skillRecords', [...skillRecords, opened])
              updateSheetData(
                'learningSkills',
                learningSkills.filter((item) => item.id !== skill.id),
              )
            }}
          />
        ))}
      </div>
      <AddButton
        onClick={() =>
          updateSheetData('learningSkills', [
            ...learningSkills,
            { id: newId(), name: '', stat: '', aptitude: 5, checks: 0 },
          ])
        }
      >
        Add skill being learned
      </AddButton>
      {character.skills && (
        <div className={styles.legacy}>
          <TextField
            label="Additional skill notes"
            value={character.skills}
            onChange={(value) => updateField('skills', value)}
            placeholder="Additional skill details"
          />
        </div>
      )}
    </>
  )
}

export default SkillsTab
