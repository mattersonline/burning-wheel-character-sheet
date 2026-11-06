import SectionHeading from '../../../components/SectionHeading/SectionHeading'
import TextField from '../../../components/TextField/TextField'
import type { SheetTabProps } from '../types'
import Armor from './Armor/Armor'
import InjuryGrid from './InjuryGrid/InjuryGrid'
import { calculateWoundPenalty } from './injuries'
import MeleeWeapons from './MeleeWeapons/MeleeWeapons'
import RangedWeapons from './RangedWeapons/RangedWeapons'

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
