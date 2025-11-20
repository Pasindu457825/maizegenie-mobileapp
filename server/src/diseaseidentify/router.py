from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from .service import predict_disease

router = APIRouter(prefix="/api/disease", tags=["Disease Detection"])

@router.post("/identify")
async def identify_disease(
    file: UploadFile = File(...),
    conf: float = Query(0.4, ge=0.0, le=1.0),
    return_image: bool = Query(False)
):
    """Identify crop disease from image"""
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty upload")
        result = predict_disease(content, conf=conf, return_image=return_image)
        return JSONResponse(content={"success": True, **result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
