from dataclasses import dataclass
from PIL import Image

@dataclass
class Prediction:
    label: str
    confidence: float
    boxes: list[list[float]] | None = None

class MultiTaskModel:
    _instance = None
    def __new__(cls):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            # TODO: load weights once here
        return cls._instance

    def run(self, task: str, img: Image.Image) -> Prediction:
        # TODO: real inference
        return Prediction(label="leaf_blight", confidence=0.92)
