from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime, timezone

from src.database.supabase_client import supabase

router = APIRouter(
    prefix="/pro-advisor",
    tags=["Pro Advisor"]
)

# ===============================
# HELPERS
# ===============================
def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ===============================
# BLOCK MODEL (NEWS STYLE)
# ===============================
class AdvisorBlock(BaseModel):
    subtitle: str
    content: str
    image_url: Optional[str] = None   # ✅ SAME AS NEWS

    @field_validator("image_url", mode="before")
    @classmethod
    def fix_image_url(cls, v):
        if v and isinstance(v, str) and not v.startswith(("http://", "https://")):
            return "https://" + v
        return v


# ===============================
# CREATE
# ===============================
class ProAdvisorCreate(BaseModel):
    title: str
    blocks: List[AdvisorBlock]
    tag: Optional[str] = None
    language: str = "si"


# ===============================
# UPDATE
# ===============================
class ProAdvisorUpdate(BaseModel):
    title: Optional[str] = None
    blocks: Optional[List[AdvisorBlock]] = None
    tag: Optional[str] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None


# ===============================
# ADD
# ===============================
@router.post("")
def add_pro_advisor(payload: ProAdvisorCreate):

    data = {
        "title": payload.title,
        "blocks": [b.model_dump() for b in payload.blocks],  # ✅ SAFE NOW
        "tag": payload.tag,
        "language": payload.language,
        "is_active": True,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }

    res = supabase.table("pro_advisor_content").insert(data).execute()

    if res.data is None:
        raise HTTPException(status_code=500, detail="Insert failed")

    return {"success": True, "data": res.data}


# ===============================
# UPDATE
# ===============================
@router.patch("/{advisor_id}")
def update_pro_advisor(advisor_id: str, payload: ProAdvisorUpdate):

    existing = (
        supabase
        .table("pro_advisor_content")
        .select("id")
        .eq("id", advisor_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Pro advisor content not found")

    update_data = {}
    dump = payload.model_dump(exclude_unset=True)

    for k, v in dump.items():
        update_data[k] = v

    if not update_data:
        raise HTTPException(status_code=400, detail="Nothing to update")

    update_data["updated_at"] = now_iso()

    res = (
        supabase
        .table("pro_advisor_content")
        .update(update_data)
        .eq("id", advisor_id)
        .execute()
    )

    return {"success": True, "data": res.data}


# ===============================
# DELETE (SOFT)
# ===============================
@router.delete("/{advisor_id}")
def delete_pro_advisor(advisor_id: str):

    existing = (
        supabase
        .table("pro_advisor_content")
        .select("id")
        .eq("id", advisor_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Pro advisor content not found")

    res = (
        supabase
        .table("pro_advisor_content")
        .update(
            {
                "is_active": False,
                "updated_at": now_iso()
            }
        )
        .eq("id", advisor_id)
        .execute()
    )

    # 🔴 IMPORTANT CHECK
    if res.data is None:
        raise HTTPException(
            status_code=403,
            detail="Delete failed (RLS / permission issue)"
        )

    return {"success": True, "message": "Deleted"}

# ===============================
# GET ALL (ACTIVE)
# ===============================
@router.get("")
def get_pro_advisor_content(
    tag: Optional[str] = None,
    language: Optional[str] = None
):

    query = (
        supabase
        .table("pro_advisor_content")
        .select("*")
        .eq("is_active", True)
        .order("updated_at", desc=True)
    )

    if tag:
        query = query.eq("tag", tag)

    if language:
        query = query.eq("language", language)

    return query.execute().data


# ===============================
# GET SINGLE
# ===============================
@router.get("/{advisor_id}")
def get_single_pro_advisor(advisor_id: str):

    res = (
        supabase
        .table("pro_advisor_content")
        .select("*")
        .eq("id", advisor_id)
        .eq("is_active", True)
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Not found")

    return res.data
