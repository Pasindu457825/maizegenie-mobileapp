from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image
from io import BytesIO
from .service import MultiTaskModel  # your shared/single model

router = APIRouter()

def _read_image(file: UploadFile) -> Image.Image:
    try:
        return Image.open(BytesIO(file.file.read()))
    except Exception:
        raise HTTPException(400, "Invalid image")

@router.post("/predict")
def predict(file: UploadFile = File(...), crop: str | None = Form(None)):
    img = _read_image(file)
    model = MultiTaskModel()
    pred = model.run("disease", img)
    return {
        "task": "disease",
        "crop": crop,
        "label": pred.label,
        "confidence": pred.confidence,
        "boxes": pred.boxes or [],
    }
