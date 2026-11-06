import axios from 'axios'

export const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? fallback
  }
  return error instanceof Error ? error.message : fallback
}
