import { useRef, useState } from 'react'
import './VoiceRecorderButton.css'

interface VoiceRecorderButtonProps {
  onRecordingComplete: (audioBlob: Blob) => void
  disabled?: boolean
  isBusy?: boolean
}

export function VoiceRecorderButton({ onRecordingComplete, disabled, isBusy }: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    setPermissionError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(audioBlob)
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch {
      setPermissionError('Microphone access was denied or is unavailable.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      void startRecording()
    }
  }

  const label = isRecording ? 'Stop recording' : isBusy ? 'Transcribing…' : 'Record a question'

  return (
    <div className="voice-recorder">
      <button
        type="button"
        className={`voice-recorder__button ${isRecording ? 'voice-recorder__button--recording' : ''}`}
        onClick={handleClick}
        disabled={disabled || isBusy}
        aria-label={label}
        title={label}
      >
        {isRecording ? '⏹' : isBusy ? '…' : '🎙️'}
      </button>
      {permissionError && <p className="voice-recorder__error">{permissionError}</p>}
    </div>
  )
}
