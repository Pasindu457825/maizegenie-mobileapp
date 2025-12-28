from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl, field_validator
from src.database.supabase_client import supabase
import uuid

router = APIRouter(
    prefix="/official-news",
    tags=["Official News"]
)

# ===============================
# CREATE MODEL (UNCHANGED)
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

    @field_validator("url", "image_url", mode="before")
    @classmethod
    def fix_urls(cls, v):
        if v and isinstance(v, str):
            if not v.startswith(("http://", "https://")):
                return "https://" + v
        return v


# ===============================
# UPDATE MODEL (NEW)
# ===============================
class OfficialNewsUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    category: str | None = None
    source: str | None = None
    url: HttpUrl | None = None
    image_url: HttpUrl | None = None
    district: str | None = None
    language: str | None = None
    is_visible_to_farmers: bool | None = None

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

    if payload.category not in [        "price",
        "weather",
        "policy",
        "alert",
        "pest",
        "disease",
        "fertilizer",
        "cultivation",
        'program']:
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
        "is_active": True,
        "is_visible_to_farmers": True
    }

    res = supabase.table("official_news").insert(data).execute()

    return {"success": True, "data": res.data}


# ===============================
# ADMIN – UPDATE NEWS
# ===============================
@router.patch("/admin/{news_id}")
def update_official_news(news_id: str, payload: OfficialNewsUpdate):

    existing = (
        supabase
        .table("official_news")
        .select("id")
        .eq("id", news_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="News not found")

    update_data = {}

    for k, v in payload.model_dump().items():
        if v is not None:
            update_data[k] = str(v) if isinstance(v, HttpUrl) else v

    if "category" in update_data:
        if update_data["category"] not in [        "price",
        "weather",
        "policy",
        "alert",
        "pest",
        "disease",
        "fertilizer",
        "cultivation",
        'program']:
            raise HTTPException(status_code=400, detail="Invalid category")

    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    

    update_data["updated_at"] = "now()"


    res = (
        supabase
        .table("official_news")
        .update(update_data)
        .eq("id", news_id)
        .execute()
    )

    return {"success": True, "data": res.data}

# ===============================
# ADMIN – DELETE NEWS (SOFT)
# ===============================
@router.delete("/admin/{news_id}")
def delete_official_news(news_id: str):

    existing = (
        supabase
        .table("official_news")
        .select("id")
        .eq("id", news_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="News not found")

    supabase.table("official_news").update(
        {"is_active": False}
    ).eq("id", news_id).execute()

    return {"success": True, "message": "News deleted"}

# ===============================
# ADMIN – GET ALL NEWS (VISIBLE + HIDDEN)
# ===============================
@router.get("/admin/all")
def get_all_news_admin():
    res = (
        supabase
        .table("official_news")
        .select("*")
        .order("updated_at", desc=True)
        .execute()
    )
    return res.data

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
        .eq("is_visible_to_farmers", True)
        .order("updated_at", desc=True)
        .execute()
    )
    return res.data


# ===============================
# FARMER – GET SINGLE NEWS
# ===============================
@router.get("/{news_id}")
def get_single_official_news(news_id: str):
    res = (
        supabase
        .table("official_news")
        .select("*")
        .eq("id", news_id)
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="News not found")

    return res.data

