from functools import lru_cache
from pathlib import Path
from ultralytics import YOLO
import os

MODEL_FILENAME = "best.pt"

@lru_cache(maxsize=1)
def get_model() -> YOLO:
    """
    Loads the YOLO model once and caches it for reuse.
    Handles model loading errors gracefully.
    """
    try:
        # Get the directory containing this file
        current_dir = Path(__file__).parent
        model_path = current_dir / MODEL_FILENAME
        
        # Alternative paths to check
        possible_paths = [
            model_path,
            current_dir.parent / MODEL_FILENAME,  # src/diseaseidentify/
            Path.cwd() / MODEL_FILENAME,  # Current working directory
            Path.cwd() / "models" / MODEL_FILENAME,  # models directory
        ]
        
        found_path = None
        for path in possible_paths:
            if path.exists():
                found_path = path
                break
        
        if not found_path:
            available_files = []
            for path in possible_paths:
                parent_dir = path.parent
                if parent_dir.exists():
                    available_files.extend([f.name for f in parent_dir.iterdir() if f.is_file()])
            
            raise FileNotFoundError(
                f"Model file '{MODEL_FILENAME}' not found.\n"
                f"Checked paths: {[str(p) for p in possible_paths]}\n"
                f"Available files: {available_files}"
            )
        
        print(f"Loading model from: {found_path}")
        model = YOLO(str(found_path))
        
        # Verify model loaded correctly
        if hasattr(model, 'names'):
            print(f"Model loaded successfully. Classes: {list(model.names.values())}")
        else:
            print("Model loaded but class names not available")
        
        return model
        
    except Exception as e:
        raise RuntimeError(f"Failed to load model: {str(e)}")