import type { QaTurn } from '../types'
import './AnswerHistory.css'

interface AnswerHistoryProps {
  history: QaTurn[]
  isLoading: boolean
}

export function AnswerHistory({ history, isLoading }: AnswerHistoryProps) {
  if (history?.length === 0 && !isLoading) {
    return (
      <div className="answer-history answer-history--empty">
        <p>Your questions and answers will show up here.</p>
      </div>
    )
  }

  return (
    <div className="answer-history">
      {history.map((turn) => (
        <article key={turn.id} className="qa-turn">
          <p className="qa-turn__question">{turn.question}</p>
          <p className="qa-turn__answer">{turn.answer}</p>
        </article>
      ))}
      {isLoading && (
        <article className="qa-turn qa-turn--pending">
          <span className="spinner" aria-hidden="true" />
          <span>Reading the document and thinking…</span>
        </article>
      )}
    </div>
  )
}
