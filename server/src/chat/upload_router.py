from fastapi import APIRouter, File, UploadFile, HTTPException
from core.supabase_client import supabase
import uuid

router = APIRouter(prefix="/chat", tags=["Chat Uploads"])

@router.post("/upload-image")
async def upload_chat_image(file: UploadFile = File(...)):
    try:
        ext = file.filename.split(".")[-1]
        file_id = f"{uuid.uuid4()}.{ext}"

        file_bytes = await file.read()

        # Upload to Supabase — no error checking needed
        supabase.storage.from_("chat-images").upload(
            file_id,
            file_bytes,
            {
                "content-type": file.content_type,
                "upsert": False
            }
        )

        # Public URL
        public_url = supabase.storage.from_("chat-images").get_public_url(file_id)

        return {"image_url": public_url}

    except Exception as e:
        raise HTTPException(500, str(e))
