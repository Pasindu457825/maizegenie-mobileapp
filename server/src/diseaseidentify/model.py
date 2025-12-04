from functools import lru_cache
from pathlib import Path
from ultralytics import YOLO

MODEL_FILENAME = "best.pt"


@lru_cache(maxsize=1)
def get_model() -> YOLO:
    """
    Loads the YOLO model once and caches it.
    Searches valid model locations inside the project.
    """
    try:
        # Directory of this file → src/diseaseidentify/
        current_dir = Path(__file__).parent

        # Main expected location
        model_path = current_dir / MODEL_FILENAME

        # Alternative valid locations
        possible_paths = [
            model_path,
            current_dir.parent / MODEL_FILENAME,         # src/
            Path.cwd() / MODEL_FILENAME,                 # project root
            Path.cwd() / "models" / MODEL_FILENAME,      # /models folder
        ]

        # Find first existing model file
        for p in possible_paths:
            if p.exists():
                print(f"[YOLO] Loading model from: {p}")
                model = YOLO(str(p))

                if hasattr(model, "names"):
                    print(f"[YOLO] Model loaded. Classes: {list(model.names.values())}")
                else:
                    print("[YOLO] Model loaded but classes not found")

                return model

        # Model NOT found → create error with details
        searched = [str(p) for p in possible_paths]
        raise FileNotFoundError(
            f"YOLO model '{MODEL_FILENAME}' not found.\n"
            f"Searched paths:\n" + "\n".join(searched)
        )

    except Exception as e:
        raise RuntimeError(f"Failed to load YOLO model: {str(e)}")
