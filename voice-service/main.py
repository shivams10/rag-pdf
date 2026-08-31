import tempfile

from fastapi import FastAPI, File, UploadFile
from faster_whisper import WhisperModel

app = FastAPI()

whisper_model = WhisperModel("base", device="cpu", compute_type="int8")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()

    with tempfile.NamedTemporaryFile(suffix=".wav") as temp_file:
        temp_file.write(audio_bytes)
        temp_file.flush()

        segments, _ = whisper_model.transcribe(temp_file.name)
        transcript = " ".join(segment.text.strip() for segment in segments)

    return {"transcript": transcript}
