from flask import Blueprint, request, jsonify
from .predict_pest import identify_pest
import tempfile

pest_bp = Blueprint("pestidentify", __name__)

@pest_bp.route("/api/pest/identify", methods=["POST"])
def pest_identify():
    """
    Endpoint to identify pest from uploaded image.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        file.save(tmp.name)
        predictions = identify_pest(tmp.name)
    
    return jsonify({
        "success": True,
        "predictions": predictions
    })
