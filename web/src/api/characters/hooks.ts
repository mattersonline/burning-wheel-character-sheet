import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCharacter,
  deleteCharacter,
  fetchCharacters,
  updateCharacter,
} from '@/api/characters/requests'
import { type Character, emptyCharacter } from '@/api/characters/types'

export const charactersQueryKey = ['characters'] as const

export const useCharacters = () =>
  useQuery({ queryKey: charactersQueryKey, queryFn: fetchCharacters, retry: false })

export const useCreateCharacter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => createCharacter(emptyCharacter),
    onSuccess: (created) =>
      queryClient.setQueryData<Character[]>(charactersQueryKey, (items = []) => [
        created,
        ...items,
      ]),
  })
}

export const useUpdateCharacter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCharacter,
    onSuccess: (saved) =>
      queryClient.setQueryData<Character[]>(charactersQueryKey, (items = []) =>
        items.map((item) => (item.id === saved.id ? saved : item)),
      ),
  })
}

export const useDeleteCharacter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCharacter,
    onSuccess: (_result, id) =>
      queryClient.setQueryData<Character[]>(charactersQueryKey, (items = []) =>
        items.filter((item) => item.id !== id),
      ),
  })
}
