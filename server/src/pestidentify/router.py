from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from .service import predict_pest

router = APIRouter(prefix="/api/pest", tags=["Pest Detection"])

@router.post("/identify")
async def identify_pest(
    file: UploadFile = File(...),
    conf: float = Query(0.4, ge=0.0, le=1.0),
    return_image: bool = Query(False, description="Return annotated image as base64")
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

        # Return JSON response
        return JSONResponse(content={"success": True, **result})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
