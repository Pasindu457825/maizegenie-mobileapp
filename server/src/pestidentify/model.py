from functools import lru_cache
from pathlib import Path
from ultralytics import YOLO

MODEL_FILENAME = "final_faw_model.pt"

@lru_cache(maxsize=1)
def get_model() -> YOLO:
    """
    Loads the YOLO model once and caches it for reuse.
    """
    model_path = Path(__file__).with_name(MODEL_FILENAME)
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}")
    return YOLO(str(model_path))
