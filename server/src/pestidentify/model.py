import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

from ultralytics import YOLO

PestModelName = Literal["local", "premium"]
LOCAL_MODEL_FILENAME = "final_faw_model.pt"
PREMIUM_MODEL_FILENAME = os.getenv("PEST_PREMIUM_MODEL_FILENAME", "premium_pest_model.pt")


def _resolve_model_path(filename: str) -> Path:
    return Path(__file__).with_name(filename)


@lru_cache(maxsize=1)
def get_local_model() -> YOLO:
    model_path = _resolve_model_path(LOCAL_MODEL_FILENAME)
    if not model_path.exists():
        raise FileNotFoundError(f"Local pest model not found at {model_path}")
    return YOLO(str(model_path))


@lru_cache(maxsize=1)
def get_premium_model() -> YOLO:
    model_path = _resolve_model_path(PREMIUM_MODEL_FILENAME)
    if not model_path.exists():
        raise FileNotFoundError(f"Premium pest model not found at {model_path}")
    return YOLO(str(model_path))


def get_model(model_name: PestModelName = "local") -> YOLO:
    if model_name == "premium":
        return get_premium_model()
    return get_local_model()
