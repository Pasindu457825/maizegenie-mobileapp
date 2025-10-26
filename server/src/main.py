from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional

from src.pestidentify.service import predict_pest

app = FastAPI(title="Maize Pest Identify API", version="1.0")

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/pest/identify")
async def identify_pest(
    file: UploadFile = File(...),
    conf: float = Query(0.4, ge=0.0, le=1.0),
    return_image: bool = Query(False, description="Return annotated image as base64")
):
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty upload")
        result = predict_pest(content, conf=conf, return_image=return_image)
        return JSONResponse(content={"success": True, **result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
