import { useMutation } from '@tanstack/react-query'
import { transcribeAudio } from '../api/client'

export function useTranscribeAudio() {
  const mutation = useMutation({ mutationFn: transcribeAudio })

  return {
    transcribe: mutation.mutateAsync,
    isTranscribing: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}
