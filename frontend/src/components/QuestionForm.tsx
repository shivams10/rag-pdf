import { useState, type FormEvent, type KeyboardEvent } from 'react'
import './QuestionForm.css'

interface QuestionFormProps {
  onSubmit: (question: string) => void
  disabled: boolean
  isLoading: boolean
}

export function QuestionForm({ onSubmit, disabled, isLoading }: QuestionFormProps) {
  const [question, setQuestion] = useState('')

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

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <textarea
        className="question-form__input"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Upload a PDF to start asking questions' : 'Ask a question about this PDF…'}
        disabled={disabled || isLoading}
        rows={2}
      />
      <button type="submit" className="question-form__submit" disabled={disabled || isLoading || !question.trim()}>
        {isLoading ? 'Thinking…' : 'Ask'}
      </button>
    </form>
  )
}
