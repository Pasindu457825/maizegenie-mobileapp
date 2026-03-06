"""
Notifications Router
Server-side API for notifications - bypasses Supabase RLS
"""

from fastapi import APIRouter, Depends, HTTPException, status
from core.auth_dependencies import get_current_user
from core.supabase_client import supabase

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


@router.get("/my")
async def get_my_notifications(
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
):
    """
    Get all notifications for the current authenticated user.
    Uses service key to bypass RLS.
    """
    user_id = current_user["id"]

    try:
        result = (
            supabase.table("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []
    except Exception as e:
        print(f"❌ Error fetching notifications for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notifications"
        )


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark a notification as read"""
    user_id = current_user["id"]

    try:
        result = (
            supabase.table("notifications")
            .update({"read": True})
            .eq("id", notification_id)
            .eq("user_id", user_id)
            .execute()
        )
        return {"success": True}
    except Exception as e:
        print(f"❌ Error marking notification read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )


@router.patch("/read-all")
async def mark_all_read(
    current_user: dict = Depends(get_current_user),
):
    """Mark all notifications as read for the current user"""
    user_id = current_user["id"]

    try:
        supabase.table("notifications").update({"read": True}).eq("user_id", user_id).eq("read", False).execute()
        return {"success": True}
    except Exception as e:
        print(f"❌ Error marking all read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark all notifications as read"
        )


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a notification"""
    user_id = current_user["id"]

    try:
        supabase.table("notifications").delete().eq("id", notification_id).eq("user_id", user_id).execute()
        return {"success": True}
    except Exception as e:
        print(f"❌ Error deleting notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )
