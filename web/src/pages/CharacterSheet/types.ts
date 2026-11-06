import type { Character, CharacterFields, SheetData } from '@/api/characters'

export type SheetTabProps = {
  character: Character
  updateField: (field: keyof CharacterFields, value: string) => void
  updateSheetData: <K extends keyof SheetData>(key: K, value: SheetData[K]) => void
}
