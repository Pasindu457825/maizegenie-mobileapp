from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse

# FIXED: correct import path
from .service import predict_disease_enhanced

router = APIRouter(tags=["Disease Detection"])


@router.post("/identify")
async def identify_disease(
    file: UploadFile = File(...),
    conf: float = Query(0.5, ge=0.3, le=1.0),
    return_image: bool = Query(False),
):
    """Identify crop disease from image with enhanced validation."""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Please upload a valid image file (JPEG, PNG, etc.).",
            )

        # Read file
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")

        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB).")

        # YOLO prediction
        result = predict_disease_enhanced(
            image_bytes=content, conf=conf, return_image=return_image
        )

        return JSONResponse(content={"success": True, **result})

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Disease detection failed: {str(e)}"
        )
