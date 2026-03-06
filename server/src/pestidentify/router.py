from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from core.auth_dependencies import get_current_user
from core.supabase_client import supabase
from .service import predict_pest
from .premium_service import predict_pest_premium
from .frequency_service import log_pest_detection, get_pest_frequency_stats

router = APIRouter(prefix="/api/pest", tags=["Pest Detection"])


def _has_active_subscription(user_id: str) -> bool:
    profile = (
        supabase.table("profiles")
        .select("is_paid_user, subscription_end_date")
        .eq("id", user_id)
        .single()
        .execute()
    )
    data = profile.data or {}
    if not data.get("is_paid_user"):
        return False

    end_raw = data.get("subscription_end_date")
    if not end_raw:
        return False

    try:
        end_date = datetime.fromisoformat(str(end_raw).replace("Z", "+00:00"))
    except ValueError:
        return False

    return end_date > datetime.now(timezone.utc)


@router.post("/identify")
async def identify_pest(
    file: UploadFile = File(...),
    conf: float = Query(0.4, ge=0.0, le=1.0),
    model: Literal["local", "premium"] = Query("local"),
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

        if model == "premium":
            user_id = current_user.get("id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Authentication required")
            if not _has_active_subscription(user_id):
                raise HTTPException(
                    status_code=403,
                    detail="Premium pest model requires an active subscription",
                )

        # Run selected pest model.
        if model == "premium":
            result = predict_pest_premium(content, conf=conf, return_image=return_image)
        else:
            result = predict_pest(content, conf=conf, return_image=return_image, model_name="local")

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

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except HTTPException:
        raise
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
