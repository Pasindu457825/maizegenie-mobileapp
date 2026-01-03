# router.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from .service import predict_disease_enhanced
from .disease_service import predict_disease_with_roboflow
 # NEW

router = APIRouter(prefix="/api/disease", tags=["Disease Detection"])


@router.post("/identify")
async def identify_disease(
    file: UploadFile = File(...),
    model: str = Query("local", enum=["local", "roboflow"])  # 🔁 SWITCH
):
    try:
        # 1️⃣ Validate input
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Please upload a valid image.")

        # 2️⃣ Read image bytes
        image_bytes = await file.read()

        # 3️⃣ Choose model
        if model == "roboflow":
            # 👉 Roboflow hosted model
            result = predict_disease_with_roboflow(image_bytes)
        else:
            # 👉 Local YOLO model (existing)
            result = predict_disease_enhanced(
                image_bytes,
                conf=0.4,
                return_image=False
            )

        # 4️⃣ Return unified response (NO frontend change needed)
        return {
            "success": result.get("success", True),
            "predictions": result.get("predictions", []),
            "severity_score": result.get("severity_score", 0.0),
            "severity_label": result.get("severity_label", "None"),
            "total_detections": result.get("total_detections", 0),
            "validation_passed": result.get("validation_passed", True),
            "annotated_image_b64": result.get("annotated_image_b64"),
            "message": result.get("message")  # for invalid image guidance
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Disease detection failed: {str(e)}"
        )
