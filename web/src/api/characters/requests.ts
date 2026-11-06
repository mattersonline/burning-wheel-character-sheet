import type { Character, CharacterFields } from '@/api/characters/types'
import { apiClient } from '@/api/client'

export const fetchCharacters = async () =>
  (await apiClient.get<Character[]>('/api/characters')).data

export const createCharacter = async (fields: CharacterFields) =>
  (await apiClient.post<Character>('/api/characters', fields)).data

export const updateCharacter = async (character: Character) =>
  (await apiClient.put<Character>(`/api/characters/${character.id}`, character)).data

export const deleteCharacter = async (id: string) =>
  (await apiClient.delete<{ deleted: boolean }>(`/api/characters/${id}`)).data
