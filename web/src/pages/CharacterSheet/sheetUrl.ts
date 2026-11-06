import { type TabId, tabs } from './tabs'

export const readSheetUrl = (params: URLSearchParams, characterIds: readonly string[]) => {
  const requestedCharacter = params.get('character')
  const requestedTab = params.get('tab')
  const tab = tabs.find((item) => item.id === requestedTab)?.id ?? 'information'
  const characterId =
    requestedCharacter && characterIds.includes(requestedCharacter)
      ? requestedCharacter
      : (characterIds[0] ?? null)
  return {
    characterId,
    tab,
    invalidCharacter: requestedCharacter !== null && !characterIds.includes(requestedCharacter),
    invalidTab: requestedTab !== null && !tabs.some((item) => item.id === requestedTab),
  }
}

export const writeSheetUrl = (params: URLSearchParams, characterId: string | null, tab: TabId) => {
  const next = new URLSearchParams(params)
  if (characterId) next.set('character', characterId)
  else next.delete('character')
  next.set('tab', tab)
  return next
}
