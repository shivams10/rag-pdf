import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useTranscribeAudio } from '../hooks/useTranscribeAudio'
import { VoiceRecorderButton } from './VoiceRecorderButton'
import './QuestionForm.css'

interface QuestionFormProps {
  onSubmit: (question: string) => void
  disabled: boolean
  isLoading: boolean
}

export function QuestionForm({ onSubmit, disabled, isLoading }: QuestionFormProps) {
  const [question, setQuestion] = useState('')
  const { transcribe, isTranscribing, error: transcribeError } = useTranscribeAudio()

  const submit = () => {
    const trimmed = question.trim()
    if (!trimmed || disabled || isLoading) return
    onSubmit(trimmed)
    setQuestion('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    const transcript = await transcribe(audioBlob).catch(() => null)
    if (transcript) {
      setQuestion(transcript)
    }
  }

  const isBusy = disabled || isLoading || isTranscribing

  return (
    <div className="question-form-wrapper">
      <form className="question-form" onSubmit={handleSubmit}>
        <VoiceRecorderButton
          onRecordingComplete={(blob) => void handleRecordingComplete(blob)}
          disabled={disabled || isLoading}
          isBusy={isTranscribing}
        />
        <textarea
          className="question-form__input"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Upload a PDF to start asking questions'
              : isTranscribing
                ? 'Transcribing…'
                : 'Ask a question, or use the mic…'
          }
          disabled={isBusy}
          rows={2}
        />
        <button type="submit" className="question-form__submit" disabled={isBusy || !question.trim()}>
          {isLoading ? 'Thinking…' : 'Ask'}
        </button>
      </form>
      {transcribeError && (
        <p className="question-form__error" role="alert">
          {transcribeError}
        </p>
      )}
    </div>
  )
}
