import SectionHeading from '@/components/SectionHeading'
import TextField from '@/components/TextField'
import Armor from '@/pages/CharacterSheet/CombatTab/Armor'
import InjuryGrid from '@/pages/CharacterSheet/CombatTab/InjuryGrid'
import { calculateWoundPenalty } from '@/pages/CharacterSheet/CombatTab/injuries'
import MeleeWeapons from '@/pages/CharacterSheet/CombatTab/MeleeWeapons'
import RangedWeapons from '@/pages/CharacterSheet/CombatTab/RangedWeapons'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'

const CombatTab = ({ character, updateSheetData }: SheetTabProps) => {
  const { sheetData } = character
  const woundPenalty = calculateWoundPenalty(sheetData.stats, sheetData.injuryWounds)
  return (
    <>
      <SectionHeading number="01" title="Injuries" first />
      <InjuryGrid
        stats={character.sheetData.stats}
        wounds={character.sheetData.injuryWounds}
        onChange={(wounds) => updateSheetData('injuryWounds', wounds)}
      />
      <TextField
        label="Injury record"
        value={character.sheetData.injuries}
        onChange={(value) => updateSheetData('injuries', value)}
        placeholder="Record wounds, severity, and recovery details"
      />
      <SectionHeading number="02" title="Weapons & armor" />
      <MeleeWeapons
        weapons={character.sheetData.meleeWeapons}
        attackerPower={character.sheetData.stats.find((stat) => stat.id === 'power')?.exponent ?? 0}
        skills={sheetData.skillRecords}
        arthaPool={sheetData.arthaPool}
        woundPenalty={woundPenalty}
        onSkillsChange={(skills) => updateSheetData('skillRecords', skills)}
        onArthaPoolChange={(pool) => updateSheetData('arthaPool', pool)}
        onChange={(weapons) => updateSheetData('meleeWeapons', weapons)}
      />
      <RangedWeapons
        weapons={character.sheetData.rangedWeapons}
        attackerPower={character.sheetData.stats.find((stat) => stat.id === 'power')?.exponent ?? 0}
        onChange={(weapons) => updateSheetData('rangedWeapons', weapons)}
        skills={sheetData.skillRecords}
        arthaPool={sheetData.arthaPool}
        woundPenalty={woundPenalty}
        onSkillsChange={(skills) => updateSheetData('skillRecords', skills)}
        onArthaPoolChange={(pool) => updateSheetData('arthaPool', pool)}
      />
      <Armor
        armor={character.sheetData.armor}
        onChange={(armor) => updateSheetData('armor', armor)}
      />
    </>
  )
}

export default CombatTab
