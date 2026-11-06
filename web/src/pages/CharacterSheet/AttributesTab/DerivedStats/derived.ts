import type { Ability } from '@/api/characters'

export type DerivedStats = {
  reflexes: number
  mortalWound: number
  hesitation: number
}

const exponentOf = (stats: Ability[], id: string) =>
  stats.find((stat) => stat.id === id)?.exponent ?? 0

export const calculateDerivedStats = (stats: Ability[]): DerivedStats => {
  const exponent = (id: string) => exponentOf(stats, id)
  return {
    reflexes: Math.floor((exponent('perception') + exponent('agility') + exponent('speed')) / 3),
    mortalWound: Math.floor((exponent('power') + exponent('forte')) / 2) + 6,
    hesitation: 10 - exponent('will'),
  }
}
