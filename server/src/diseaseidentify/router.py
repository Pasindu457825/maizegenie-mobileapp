# router.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from .service import predict_disease_enhanced


router = APIRouter(prefix="/api/disease", tags=["Disease Detection"])

@router.post("/identify")
async def identify_disease(file: UploadFile = File(...)):
    try:
        # Validate input
        if not file.content_type.startswith("image/"):
            raise HTTPException(400, "Please upload a valid image.")

        # Read image bytes
        image_bytes = await file.read()

        # Run prediction
        result = predict_disease_enhanced(image_bytes, conf=0.4, return_image=False)


        # API final response
        return {
            "success": True,
            "predictions": result["predictions"],
            "severity_score": result.get("severity_score", 0.0),
            "severity_label": result.get("severity_label", "None"),
            "total_detections": result.get("total_detections", 0),
            "validation_passed": result.get("validation_passed", True),
            "annotated_image_b64": result.get("annotated_image_b64")
            }


    except Exception as e:
        raise HTTPException(500, f"Disease detection failed: {str(e)}")
