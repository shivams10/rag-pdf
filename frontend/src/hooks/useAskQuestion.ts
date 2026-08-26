import { useMutation } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { askQuestionAboutPdf } from '../api/client'
import type { QaTurn } from '../types'

interface AskQuestionVariables {
  file: File
  question: string
}

export function useAskQuestion() {
  const [history, setHistory] = useState<QaTurn[]>([])

  const mutation = useMutation({
    mutationFn: ({ file, question }: AskQuestionVariables) => askQuestionAboutPdf(file, question),
    onSuccess: (answer, { question }) => {
      setHistory((prev) => [
        ...prev,
        { id: crypto.randomUUID(), question, answer, askedAt: Date.now() },
      ])
    },
  })

  const askQuestion = useCallback(
    (file: File, question: string) => {
      mutation.mutate({ file, question })
    },
    [mutation],
  )

  return {
    history,
    isLoading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    askQuestion,
  }
}
