from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl, field_validator
from src.database.supabase_client import supabase
import uuid

router = APIRouter(
    prefix="/official-news",
    tags=["Official News"]
)

# ===============================
# REQUEST MODEL
# ===============================
class OfficialNewsCreate(BaseModel):
    title: str
    summary: str | None = None
    category: str                 # price | weather | policy | alert
    source: str                   # HARTI / Met Dept / DMC / Gazette
    url: HttpUrl | None = None
    image_url: HttpUrl | None = None
    district: str | None = None
    language: str = "si"

    # 🔒 Auto-fix URLs like "www.abs.lk" → "https://www.abs.lk"
    @field_validator("url", "image_url", mode="before")
    @classmethod
    def fix_urls(cls, v):
        if v and isinstance(v, str):
            if not v.startswith(("http://", "https://")):
                return "https://" + v
        return v


# ===============================
# ADMIN – ADD NEWS
# ===============================
@router.post("/admin")
def add_official_news(payload: OfficialNewsCreate):

    if payload.category not in ["price", "weather", "policy", "alert"]:
        raise HTTPException(status_code=400, detail="Invalid category")

    data = {
        "title": payload.title,
        "summary": payload.summary,
        "category": payload.category,
        "source": payload.source,
        "url": str(payload.url) if payload.url else None,
        "image_url": str(payload.image_url) if payload.image_url else None,
        "district": payload.district,
        "language": payload.language,
        "created_by": str(uuid.uuid4()),
        "is_active": True
    }

    res = supabase.table("official_news").insert(data).execute()

    return {
        "success": True,
        "data": res.data
    }


# ===============================
# FARMER – GET ALL NEWS
# ===============================
@router.get("")
def get_official_news():
    res = (
        supabase
        .table("official_news")
        .select("*")
        .eq("is_active", True)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


# ===============================
# FARMER – GET SINGLE NEWS BY ID
# ===============================
@router.get("/{news_id}")
def get_single_official_news(news_id: str):
    res = (
        supabase
        .table("official_news")
        .select("*")
        .eq("id", news_id)
        .eq("is_active", True)
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="News not found")

    return res.data
