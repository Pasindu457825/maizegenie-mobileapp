from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from core.auth_dependencies import get_current_user
from .service import predict_pest
from .frequency_service import log_pest_detection, get_pest_frequency_stats

router = APIRouter(prefix="/api/pest", tags=["Pest Detection"])

@router.post("/identify")
async def identify_pest(
    file: UploadFile = File(...),
    conf: float = Query(0.4, ge=0.0, le=1.0),
    return_image: bool = Query(False, description="Return annotated image as base64"),
    current_user: dict = Depends(get_current_user),
):
    """
    Endpoint to identify pest from uploaded image.
    """
    try:
        # Read the uploaded image bytes
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty upload")

        # Call the pest prediction service
        result = predict_pest(content, conf=conf, return_image=return_image)

        # Log detection for frequency analytics (best-effort, non-blocking)
        try:
            log_pest_detection(
                result.get("predictions", []),
                source="identify_api",
                user_id=current_user.get("id"),
                user_role=current_user.get("role"),
            )
        except Exception as log_error:
            print(f"[WARN] Pest frequency logging failed: {log_error}")

        # Return JSON response
        return JSONResponse(content={"success": True, **result})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/frequency")
async def get_pest_frequency(
    days: int = Query(30, ge=1, le=365),
    top_n: int = Query(5, ge=1, le=20),
    farmer_id: str | None = Query(None, description="Optional farmer id (officer/admin only)"),
    current_user: dict = Depends(get_current_user),
):
    """
    Get pest frequency statistics from detection logs.
    """
    try:
        user_role = (current_user.get("role") or "").lower()
        current_user_id = current_user.get("id")
        target_farmer_id = current_user_id

        # Officers/admin can request global or specific farmer analytics.
        if user_role in {"officer", "admin"}:
            target_farmer_id = farmer_id

        stats = get_pest_frequency_stats(days=days, top_n=top_n, user_id=target_farmer_id)
        return JSONResponse(content={"success": True, **stats})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load pest frequency stats: {str(e)}")
