import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { validatePdfFile } from '../api/client'
import './PdfUploader.css'

interface PdfUploaderProps {
  selectedFile: File | null
  onFileSelected: (file: File) => void
  onClear: () => void
  disabled?: boolean
}

function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024)
  return `${megabytes.toFixed(megabytes < 10 ? 2 : 1)} MB`
}

export function PdfUploader({ selectedFile, onFileSelected, onClear, disabled = false }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return
      const error = validatePdfFile(file)
      if (error) {
        setValidationError(error)
        return
      }
      setValidationError(null)
      onFileSelected(file)
    },
    [onFileSelected],
  )

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
    if (disabled) return
    handleFile(event.dataTransfer.files?.[0])
  }

  if (selectedFile) {
    return (
      <div className="pdf-uploader pdf-uploader--selected">
        <div className="pdf-uploader__file-icon" aria-hidden="true">
          PDF
        </div>
        <div className="pdf-uploader__file-info">
          <span className="pdf-uploader__file-name">{selectedFile.name}</span>
          <span className="pdf-uploader__file-size">{formatFileSize(selectedFile.size)}</span>
        </div>
        <button
          type="button"
          className="pdf-uploader__clear-button"
          onClick={onClear}
          disabled={disabled}
          aria-label="Remove selected PDF"
        >
          &times;
        </button>
      </div>
    )
  }

  return (
    <div className="pdf-uploader-wrapper">
      <div
        className={`pdf-uploader ${isDraggingOver ? 'pdf-uploader--dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        <div className="pdf-uploader__icon" aria-hidden="true">
          &#8593;
        </div>
        <p className="pdf-uploader__title">Drop your PDF here, or click to browse</p>
        <p className="pdf-uploader__hint">PDF only, up to 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleInputChange}
          disabled={disabled}
          hidden
        />
      </div>
      {validationError && <p className="pdf-uploader__error">{validationError}</p>}
    </div>
  )
}
