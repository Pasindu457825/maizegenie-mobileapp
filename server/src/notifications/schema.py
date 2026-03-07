"""
Notification request/response schemas
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    created_at: str
    read: bool


class NotificationsListResponse(BaseModel):
    success: bool
    notifications: List[NotificationResponse]
    count: int


class MarkAsReadRequest(BaseModel):
    notification_id: str


class MarkAllAsReadResponse(BaseModel):
    success: bool
    updated_count: int


class DeleteNotificationRequest(BaseModel):
    notification_id: str