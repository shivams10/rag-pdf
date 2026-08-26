const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024

export class ApiError extends Error {}

export function validatePdfFile(file: File): string | null {
  const hasPdfMimeType = file.type === 'application/pdf'
  const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf')
  if (!hasPdfMimeType || !hasPdfExtension) {
    return 'Only PDF files are allowed.'
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    return 'PDF must be 10MB or smaller.'
  }
  return null
}

export async function askQuestionAboutPdf(file: File, question: string): Promise<string> {
  const formData = new FormData()
  formData.append('pdf', file)
  formData.append('question', question)

  const response = await fetch('/lc/upload', {
    method: 'POST',
    body: formData,
  })

  const raw = await response.text()

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(raw, response.status))
  }

  return raw
}

function extractErrorMessage(raw: string, status: number): string {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.message === 'string') {
      return parsed.message
    }
  } catch {
    // response body wasn't JSON, fall back to the raw text below
  }
  return raw.trim() || `Request failed with status ${status}`
}
