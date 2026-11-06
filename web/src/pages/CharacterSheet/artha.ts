import type { Artha } from '@/api/characters'

export const arthaKinds: { key: keyof Artha; label: string; hint: string }[] = [
  { key: 'fate', label: 'Fate', hint: 'Reroll a six, or open-ended rolls.' },
  { key: 'persona', label: 'Persona', hint: 'Add one die, or tax a stat.' },
  { key: 'deed', label: 'Deeds', hint: 'Double the dice pool of a test.' },
]
