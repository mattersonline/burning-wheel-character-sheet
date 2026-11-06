export type Shade = 'black' | 'grey' | 'white'

// crypto.randomUUID only exists in secure contexts, so plain-HTTP LAN access needs a fallback.
export const newId = (): string =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
        (
          Number(c) ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
        ).toString(16),
      )

export type Advancement = {
  routine: number
  difficult: number
  challenging: number
}

export type Artha = {
  fate: number
  persona: number
  deed: number
}

// Stats, attributes, and skills all share this record shape.
export type Ability = {
  id: string
  name: string
  exponent: number
  shade: Shade
  skipRoutine: boolean
  open: boolean
  advancement: Advancement
  artha: Artha
}

export const newAbility = (): Ability => ({
  id: newId(),
  name: '',
  exponent: 1,
  shade: 'black',
  skipRoutine: false,
  open: false,
  advancement: { routine: 0, difficult: 0, challenging: 0 },
  artha: { fate: 0, persona: 0, deed: 0 },
})

export type AbilitySlot = { id: string; name: string }

// These must match the fixed slots enforced by the API (api/internal/characters/slots.go).
export const statSlots: AbilitySlot[] = [
  { id: 'will', name: 'Will' },
  { id: 'power', name: 'Power' },
  { id: 'agility', name: 'Agility' },
  { id: 'perception', name: 'Perception' },
  { id: 'forte', name: 'Forte' },
  { id: 'speed', name: 'Speed' },
]

export const fixedAttributeSlots: AbilitySlot[] = [
  { id: 'health', name: 'Health' },
  { id: 'steel', name: 'Steel' },
  { id: 'circles', name: 'Circles' },
  { id: 'resources', name: 'Resources' },
]

export const customAttributeSlots: AbilitySlot[] = [
  { id: 'custom-1', name: '' },
  { id: 'custom-2', name: '' },
]

const fixedAbility = (slot: AbilitySlot, skipRoutine: boolean): Ability => ({
  ...newAbility(),
  id: slot.id,
  name: slot.name,
  skipRoutine,
})

export type MeleeWeapon = {
  id: string
  name: string
  shade: Shade
  // Weapon power, added to the wielder's Power for the I/M/S values.
  power: number
  // Successes needed to step up from I to M, and again from M to S.
  add: number
  versusArmor: number
  // Weapon speed: strikes allowed in a script before another action.
  speed: number
  length: string
  // The skill record last chosen for attacking with this weapon.
  skillId: string
}

export const newMeleeWeapon = (): MeleeWeapon => ({
  id: newId(),
  name: '',
  shade: 'black',
  power: 0,
  add: 1,
  versusArmor: 0,
  speed: 1,
  length: '',
  skillId: '',
})

export type RangedKind = 'missile' | 'thrown'

export type RangedWeapon = {
  id: string
  name: string
  shade: Shade
  // Only thrown weapons have a power, which adds to the I/M/S damage.
  kind: RangedKind
  power: number
  versusArmor: number
  maxRange: string
  optimalDice: number
  extremeDice: number
  // The hit level for each face of the die, such as "IIMMSS"; never decreases.
  dof: string
  // A missile weapon's own I/M/S damage; thrown weapons derive theirs from Power.
  incidental: number
  mark: number
  superb: number
  skillId: string
}

export const defaultDof = 'IIMMSS'

export const newRangedWeapon = (kind: RangedKind = 'missile'): RangedWeapon => ({
  id: newId(),
  name: '',
  shade: 'black',
  kind,
  power: 0,
  versusArmor: 0,
  maxRange: '',
  optimalDice: 0,
  extremeDice: 0,
  dof: defaultDof,
  incidental: 0,
  mark: 0,
  superb: 0,
  skillId: '',
})

// Armor locations in sheet order, each with its number of bubbles.
export const armorLocations = [
  { id: 'head', label: 'Head', bubbles: 6 },
  { id: 'torso', label: 'Torso', bubbles: 7 },
  { id: 'rightArm', label: 'Right arm', bubbles: 6 },
  { id: 'leftArm', label: 'Left arm', bubbles: 6 },
  { id: 'rightLeg', label: 'Right leg', bubbles: 6 },
  { id: 'leftLeg', label: 'Left leg', bubbles: 6 },
  { id: 'shield', label: 'Shield', bubbles: 5 },
] as const

export type ArmorPiece = {
  id: (typeof armorLocations)[number]['id']
  type: string
  // Filled bubbles.
  marked: number
}

// Extra obstacle armor adds to each of these skills.
export const clumsyWeightSkills = [
  { key: 'stealthy', label: 'Stealthy' },
  { key: 'climbing', label: 'Climbing' },
  { key: 'perception', label: 'Perception' },
  { key: 'fatigue', label: 'Fatigue' },
  { key: 'speed', label: 'Speed' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'agility', label: 'Agility' },
  { key: 'swimming', label: 'Swimming' },
] as const

export type ClumsyWeight = Record<(typeof clumsyWeightSkills)[number]['key'], number>

export type Armor = {
  pieces: ArmorPiece[]
  clumsy: ClumsyWeight
}

export const newArmor = (): Armor => ({
  pieces: armorLocations.map((location) => ({ id: location.id, type: '', marked: 0 })),
  clumsy: {
    stealthy: 0,
    climbing: 0,
    perception: 0,
    fatigue: 0,
    speed: 0,
    shooting: 0,
    agility: 0,
    swimming: 0,
  },
})

export type LearningSkill = {
  id: string
  name: string
  // Stat ID (will, power, agility, perception, forte, speed); empty until chosen.
  stat: string
  // Tests needed to open the skill.
  aptitude: number
  // Tests recorded so far.
  checks: number
}

export type InventoryItem = {
  id: string
  name: string
  description: string
  quantity: number
}

export type NamedRecord = {
  id: string
  name: string
  description: string
}

export const newNamedRecord = (): NamedRecord => ({
  id: newId(),
  name: '',
  description: '',
})

export const relationshipTypes = [
  { value: 'relationship', label: 'Relationships' },
  { value: 'circles', label: 'Circles' },
  { value: 'namedCircles', label: 'Named Circles' },
  { value: 'enemyCircles', label: 'Enemy Circles' },
  { value: 'reputation', label: 'Reputations' },
  { value: 'affiliation', label: 'Affiliations' },
] as const

export type RelationshipType = (typeof relationshipTypes)[number]['value']
export type Relationship = NamedRecord & { type: RelationshipType }

export const newRelationship = (): Relationship => ({
  ...newNamedRecord(),
  type: 'relationship',
})

export const newInventoryItem = (): InventoryItem => ({
  id: newId(),
  name: '',
  description: '',
  quantity: 1,
})

export type SheetData = {
  beliefs: string[]
  specialBelief: string
  instincts: string[]
  characterTraits: NamedRecord[]
  dieTraits: NamedRecord[]
  callOnTraits: NamedRecord[]
  relationships: Relationship[]
  inventory: InventoryItem[]
  injuries: string
  // Wounds taken (0-3) at each B level, B1 first.
  injuryWounds: number[]
  stats: Ability[]
  attributes: Ability[]
  skillRecords: Ability[]
  learningSkills: LearningSkill[]
  meleeWeapons: MeleeWeapon[]
  rangedWeapons: RangedWeapon[]
  armor: Armor
  // Artha the character currently has available; Ability.artha records what was spent.
  arthaPool: Artha
  spells: string
  other: string
}

export type Character = {
  id: string
  name: string
  concept: string
  stock: string
  age: string
  homeland: string
  beliefs: string
  instincts: string
  traits: string
  skills: string
  notes: string
  sheetData: SheetData
  updatedAt: string
}

export type CharacterFields = Omit<Character, 'id' | 'updatedAt'>

export const emptyCharacter: CharacterFields = {
  name: '',
  concept: '',
  stock: '',
  age: '',
  homeland: '',
  beliefs: '',
  instincts: '',
  traits: '',
  skills: '',
  notes: '',
  sheetData: {
    beliefs: ['', '', ''],
    specialBelief: '',
    instincts: ['', '', ''],
    characterTraits: [],
    dieTraits: [],
    callOnTraits: [],
    relationships: [],
    inventory: [],
    injuries: '',
    injuryWounds: Array.from({ length: 16 }, () => 0),
    stats: statSlots.map((slot) => fixedAbility(slot, true)),
    attributes: [
      ...fixedAttributeSlots.map((slot) => fixedAbility(slot, false)),
      ...customAttributeSlots.map((slot) => fixedAbility(slot, false)),
    ],
    skillRecords: [],
    learningSkills: [],
    meleeWeapons: [],
    rangedWeapons: [],
    armor: newArmor(),
    arthaPool: { fate: 0, persona: 0, deed: 0 },
    spells: '',
    other: '',
  },
}
