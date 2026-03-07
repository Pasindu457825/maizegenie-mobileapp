"""
Notifications Router - Authenticated endpoints for user notifications
"""
from fastapi import APIRouter, HTTPException, Depends, status
from core.auth_dependencies import get_current_user
from core.supabase_client import supabase
from .schema import (
    NotificationResponse,
    NotificationsListResponse,
    MarkAsReadRequest,
    MarkAllAsReadResponse,
    DeleteNotificationRequest,
)
from typing import List

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/", response_model=NotificationsListResponse)
async def get_user_notifications(
    current_user: dict = Depends(get_current_user)
):
    """
    Get authenticated user's notifications
    
    Security:
    - Requires valid JWT token
    - Only returns notifications for the authenticated user
    - Server-side filtering ensures no data leakage
    
    Args:
        current_user: Authenticated user from JWT token
        
    Returns:
        List of notifications belonging to the user
    """
    user_id = current_user["id"]
    
    try:
        # Query notifications ONLY for this user
        response = (
            supabase
            .table("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        
        notifications = response.data or []
        
        return NotificationsListResponse(
            success=True,
            notifications=notifications,
            count=len(notifications)
        )
        
    except Exception as e:
        print(f"❌ Error fetching notifications for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notifications"
        )


@router.post("/mark-as-read")
async def mark_notification_as_read(
    request: MarkAsReadRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a notification as read
    
    Security:
    - Verifies user owns the notification before updating
    
    Args:
        request: Notification ID to mark as read
        current_user: Authenticated user
        
    Returns:
        Success status
    """
    user_id = current_user["id"]
    notification_id = request.notification_id
    
    try:
        # Verify this notification belongs to the current user
        notification = (
            supabase
            .table("notifications")
            .select("user_id")
            .eq("id", notification_id)
            .single()
            .execute()
        )
        
        if not notification.data or notification.data.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this notification"
            )
        
        # Mark as read
        supabase.table("notifications").update({"read": True}).eq("id", notification_id).execute()
        
        return {"success": True, "message": "Notification marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error marking notification as read: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )


@router.post("/mark-all-as-read", response_model=MarkAllAsReadResponse)
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user)
):
    """
    Mark all notifications as read for the user
    
    Security:
    - Only marks user's own notifications
    
    Args:
        current_user: Authenticated user
        
    Returns:
        Number of updated notifications
    """
    user_id = current_user["id"]
    
    try:
        # Get all unread notifications for this user
        unread = (
            supabase
            .table("notifications")
            .select("id")
            .eq("user_id", user_id)
            .eq("read", False)
            .execute()
        )
        
        count = len(unread.data) if unread.data else 0
        
        if count > 0:
            # Mark all as read
            supabase.table("notifications").update({"read": True}).eq("user_id", user_id).eq("read", False).execute()
        
        return MarkAllAsReadResponse(
            success=True,
            updated_count=count
        )
        
    except Exception as e:
        print(f"❌ Error marking all notifications as read: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark all notifications as read"
        )


@router.delete("/delete")
async def delete_notification(
    request: DeleteNotificationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a notification
    
    Security:
    - Verifies user owns the notification before deleting
    
    Args:
        request: Notification ID to delete
        current_user: Authenticated user
        
    Returns:
        Success status
    """
    user_id = current_user["id"]
    notification_id = request.notification_id
    
    try:
        # Verify this notification belongs to the current user
        notification = (
            supabase
            .table("notifications")
            .select("user_id")
            .eq("id", notification_id)
            .single()
            .execute()
        )
        
        if not notification.data or notification.data.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this notification"
            )
        
        # Delete the notification
        supabase.table("notifications").delete().eq("id", notification_id).execute()
        
        return {"success": True, "message": "Notification deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting notification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )


@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user)
):
    """
    Get count of unread notifications for user
    
    Security:
    - Only counts user's own unread notifications
    
    Args:
        current_user: Authenticated user
        
    Returns:
        Count of unread notifications
    """
    user_id = current_user["id"]
    
    try:
        response = (
            supabase
            .table("notifications")
            .select("id")
            .eq("user_id", user_id)
            .eq("read", False)
            .execute()
        )
        
        count = len(response.data) if response.data else 0
        
        return {"success": True, "unread_count": count}
        
    except Exception as e:
        print(f"❌ Error fetching unread count: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch unread count"
        )