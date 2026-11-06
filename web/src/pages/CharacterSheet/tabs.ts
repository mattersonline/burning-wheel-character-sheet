export const tabs = [
  { id: 'information', label: 'Character information' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'inventory', label: 'Inventory / Gear' },
  { id: 'combat', label: 'Combat' },
  { id: 'attributes', label: 'Stats / Attributes' },
  { id: 'skills', label: 'Skills' },
  { id: 'artha', label: 'Artha' },
  { id: 'notes', label: 'Notes / Spells / Other' },
] as const

export type TabId = (typeof tabs)[number]['id']
