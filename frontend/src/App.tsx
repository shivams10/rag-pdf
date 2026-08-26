import { useCallback, useState } from 'react'
import { AnswerHistory } from './components/AnswerHistory'
import { PdfUploader } from './components/PdfUploader'
import { QuestionForm } from './components/QuestionForm'
import { useAskQuestion } from './hooks/useAskQuestion'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { history, isLoading, error, askQuestion } = useAskQuestion()

  const handleAsk = useCallback(
    (question: string) => {
      if (!selectedFile) return
      askQuestion(selectedFile, question)
    },
    [selectedFile, askQuestion],
  )

  return (
    <div className="app">
      <header className="app__header">
        <h1>PDF Q&amp;A</h1>
        <p>Upload a PDF and ask questions about what's inside it.</p>
      </header>

      <main className="app__main">
        <PdfUploader
          selectedFile={selectedFile}
          onFileSelected={setSelectedFile}
          onClear={() => setSelectedFile(null)}
          disabled={isLoading}
        />

        <AnswerHistory history={history} isLoading={isLoading} />

        {error && (
          <p className="app__error" role="alert">
            {error}
          </p>
        )}

        <QuestionForm onSubmit={handleAsk} disabled={!selectedFile} isLoading={isLoading} />
      </main>
    </div>
  )
}

export default App
