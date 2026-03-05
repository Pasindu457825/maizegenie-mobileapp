"""
Advice Request Service
Database operations for farmer advice requests
"""

from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
import uuid
from core.supabase_client import supabase


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def generate_uuid() -> str:
    """Generate a new UUID string"""
    return str(uuid.uuid4())


def get_current_timestamp() -> str:
    """Get current timestamp in ISO format"""
    return datetime.utcnow().isoformat() + "Z"


# ============================================================
# NOTIFICATION HELPERS
# ============================================================

def send_notification_to_user(
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "message",
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Send a notification to a specific user.
    Uses direct REST API call with service key to bypass RLS.
    Falls back to inserting without metadata if column doesn't exist.
    """
    import requests as http_requests
    from core.config import settings
    
    try:
        if metadata is None:
            metadata = {}

        insert_data = {
            "id": generate_uuid(),
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notification_type,
            "read": False,
            "created_at": get_current_timestamp(),
        }

        # Direct REST API call with service key bypasses RLS
        url = f"{settings.SUPABASE_URL}/rest/v1/notifications"
        headers = {
            "apikey": settings.SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }

        # Try with metadata first
        data_with_meta = {**insert_data, "metadata": metadata} if metadata else insert_data
        
        print(f"📤 Sending notification to {user_id} via REST API...")
        print(f"   URL: {url}")
        print(f"   Type: {notification_type}")
        
        resp = http_requests.post(url, json=data_with_meta, headers=headers)
        
        if resp.status_code in (200, 201):
            print(f"✅ Notification sent to user {user_id}")
            return True
        
        # If failed with metadata, try without (metadata column might not exist)
        if metadata and resp.status_code in (400, 404):
            print(f"⚠️ Retrying without metadata field... ({resp.status_code}: {resp.text})")
            resp2 = http_requests.post(url, json=insert_data, headers=headers)
            if resp2.status_code in (200, 201):
                print(f"✅ Notification sent to user {user_id} (without metadata)")
                return True
            else:
                print(f"❌ Failed to send notification to {user_id}: {resp2.status_code} {resp2.text}")
                return False
        
        print(f"❌ Failed to send notification to {user_id}: {resp.status_code} {resp.text}")
        return False
    except Exception as e:
        print(f"❌ Exception sending notification to {user_id}: {e}")
        import traceback
        traceback.print_exc()
        return False


def notify_officers_new_request(
    request_id: str,
    request_type: str,
    district: Optional[str] = None
):
    """Send notification to all officers about a new advice request"""
    try:
        result = supabase.table("profiles").select("id").eq("role", "officer").execute()
        officers = result.data or []

        type_label = {
            "yield_enhancement": "Yield Enhancement",
            "seed_variety": "Seed Variety Selection",
            "both": "Yield Enhancement & Seed Variety",
        }.get(request_type, request_type)

        title = "🌾 New Advice Request"
        message = f"A farmer has requested advice on {type_label}"
        if district:
            message += f" from {district}"
        message += ". Please review and respond."

        count = 0
        for officer in officers:
            if send_notification_to_user(
                officer["id"], title, message, "message",
                {"request_id": request_id, "request_type": request_type, "notification_category": "advice_request"}
            ):
                count += 1

        print(f"🔔 Notified {count}/{len(officers)} officers about request {request_id}")
    except Exception as e:
        print(f"⚠️ Failed to notify officers: {e}")


def notify_farmer_advice_completed(
    farmer_id: str,
    request_id: str,
    request_type: str
):
    """Send notification to farmer that advice has been provided"""
    try:
        type_label = {
            "yield_enhancement": "Yield Enhancement",
            "seed_variety": "Seed Variety Selection",
            "both": "Yield Enhancement & Seed Variety",
        }.get(request_type, request_type)

        send_notification_to_user(
            farmer_id,
            "✅ Advice Received",
            f"An agriculture officer has responded to your {type_label} advice request. Check the details now!",
            "message",
            {"request_id": request_id, "request_type": request_type, "notification_category": "advice_request"}
        )
        print(f"🔔 Notified farmer {farmer_id} about completed request {request_id}")
    except Exception as e:
        print(f"⚠️ Failed to notify farmer: {e}")


# ============================================================
# CREATE OPERATIONS
# ============================================================

def is_valid_uuid(val: str) -> bool:
    """Check if a string is a valid UUID"""
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, AttributeError):
        return False


async def create_advice_request(
    farmer_id: str,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a new advice request
    Returns: Created advice request record
    """
    try:
        # NOTE: yield_prediction_id is excluded because the foreign key constraint
        # references yield_predictions table which may have different IDs than what
        # the frontend sends. The prediction data is denormalized in this table anyway.
        
        request_data = {
            "id": generate_uuid(),
            "farmer_id": farmer_id,
            # "yield_prediction_id" excluded - FK constraint issue
            "request_type": data.get("request_type", "both"),
            "status": "pending",
            "priority": "normal",
            "farmer_message": data.get("farmer_message"),
            "predicted_yield_kg_ha": data.get("predicted_yield_kg_ha"),
            "district": data.get("district"),
            "location": data.get("location"),
            "variety": data.get("variety"),
            "land_size_ha": data.get("land_size_ha"),
            "irrigation_type": data.get("irrigation_type"),
            "rainfall_condition": data.get("rainfall_condition"),
            "planting_date": data.get("planting_date"),
            "created_at": get_current_timestamp(),
        }
        
        # Remove None values for optional fields
        required_fields = {"id", "farmer_id", "request_type", "status", "priority", "created_at"}
        request_data = {k: v for k, v in request_data.items() if v is not None or k in required_fields}
        
        print(f"📝 Creating advice request with data: {list(request_data.keys())}")

        result = supabase.table("farmer_advice_requests").insert(request_data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        print(f"Error creating advice request: {e}")
        raise


# ============================================================
# READ OPERATIONS
# ============================================================

async def get_advice_request(request_id: str) -> Optional[Dict[str, Any]]:
    """Get a single advice request by ID"""
    try:
        result = (
            supabase.table("farmer_advice_requests")
            .select("*")
            .eq("id", request_id)
            .single()
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"Error fetching advice request: {e}")
        return None


async def get_advice_request_with_details(request_id: str) -> Optional[Dict[str, Any]]:
    """Get advice request with farmer and prediction details"""
    try:
        result = (
            supabase.table("farmer_advice_requests")
            .select("*, profiles!farmer_advice_requests_farmer_id_fkey(id, full_name, phone, district)")
            .eq("id", request_id)
            .single()
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"Error fetching advice request with details: {e}")
        return None


async def list_advice_requests(
    filters: Dict[str, Any],
    page: int = 1,
    page_size: int = 20,
    user_role: str = "officer",
    user_id: Optional[str] = None
) -> Tuple[List[Dict[str, Any]], int]:
    """
    List advice requests with filters and pagination
    Returns: (list of requests, total count)
    """
    try:
        # Build base query
        query = supabase.table("farmer_advice_requests").select("*", count="exact")
        
        # Role-based filtering
        if user_role == "farmer" and user_id:
            query = query.eq("farmer_id", user_id)
        
        # Apply filters
        if filters.get("status"):
            query = query.eq("status", filters["status"])
        
        if filters.get("priority"):
            query = query.eq("priority", filters["priority"])
        
        if filters.get("request_type"):
            query = query.eq("request_type", filters["request_type"])
        
        if filters.get("district"):
            query = query.eq("district", filters["district"])
        
        if filters.get("assigned_officer_id"):
            query = query.eq("assigned_officer_id", filters["assigned_officer_id"])
        
        if filters.get("farmer_id"):
            query = query.eq("farmer_id", filters["farmer_id"])
        
        if filters.get("date_from"):
            query = query.gte("created_at", filters["date_from"])
        
        if filters.get("date_to"):
            query = query.lte("created_at", filters["date_to"])
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.order("created_at", desc=True).range(offset, offset + page_size - 1)
        
        result = query.execute()
        
        total = result.count if result.count is not None else 0
        return result.data or [], total
        
    except Exception as e:
        print(f"Error listing advice requests: {e}")
        return [], 0


async def get_farmer_advice_requests(
    farmer_id: str,
    status: Optional[str] = None,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """Get advice requests for a specific farmer"""
    try:
        query = (
            supabase.table("farmer_advice_requests")
            .select("*")
            .eq("farmer_id", farmer_id)
        )
        
        if status:
            query = query.eq("status", status)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        return result.data or []
        
    except Exception as e:
        print(f"Error fetching farmer advice requests: {e}")
        return []


async def get_advice_request_stats(
    user_role: str = "officer",
    user_id: Optional[str] = None
) -> Dict[str, int]:
    """Get statistics for advice requests"""
    try:
        base_query = supabase.table("farmer_advice_requests").select("status", count="exact")
        
        if user_role == "farmer" and user_id:
            base_query = base_query.eq("farmer_id", user_id)
        
        # Get total count
        total_result = base_query.execute()
        total = total_result.count if total_result.count is not None else 0
        
        # Get counts by status
        stats = {"total": total, "pending": 0, "in_progress": 0, "completed": 0, "cancelled": 0}
        
        for status in ["pending", "in_progress", "completed", "cancelled"]:
            query = supabase.table("farmer_advice_requests").select("id", count="exact").eq("status", status)
            if user_role == "farmer" and user_id:
                query = query.eq("farmer_id", user_id)
            result = query.execute()
            stats[status] = result.count if result.count is not None else 0
        
        return stats
        
    except Exception as e:
        print(f"Error fetching advice request stats: {e}")
        return {"total": 0, "pending": 0, "in_progress": 0, "completed": 0, "cancelled": 0}


# ============================================================
# UPDATE OPERATIONS
# ============================================================

async def update_advice_request(
    request_id: str,
    update_data: Dict[str, Any],
    user_role: str = "officer"
) -> Optional[Dict[str, Any]]:
    """
    Update an advice request
    Officers can update status, response, notes, assignment
    Farmers can only cancel pending requests
    """
    try:
        # Build update payload
        payload = {"updated_at": get_current_timestamp()}
        
        if user_role == "officer":
            # Officers can update all fields
            if "status" in update_data:
                payload["status"] = update_data["status"]
                if update_data["status"] == "completed":
                    payload["completed_at"] = get_current_timestamp()
            
            if "priority" in update_data:
                payload["priority"] = update_data["priority"]
            
            if "assigned_officer_id" in update_data:
                payload["assigned_officer_id"] = update_data["assigned_officer_id"]
            
            if "officer_response" in update_data:
                payload["officer_response"] = update_data["officer_response"]
                payload["responded_at"] = get_current_timestamp()
            
            if "officer_notes" in update_data:
                payload["officer_notes"] = update_data["officer_notes"]
            
            if "fertilizer_plan" in update_data:
                payload["fertilizer_plan"] = update_data["fertilizer_plan"]
            
            if "cultivation_advice" in update_data:
                payload["cultivation_advice"] = update_data["cultivation_advice"]
            
            if "expected_yield_improvement" in update_data:
                payload["expected_yield_improvement"] = update_data["expected_yield_improvement"]
        
        else:
            # Farmers can only cancel
            if update_data.get("status") == "cancelled":
                payload["status"] = "cancelled"
        
        result = (
            supabase.table("farmer_advice_requests")
            .update(payload)
            .eq("id", request_id)
            .execute()
        )
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None
        
    except Exception as e:
        print(f"Error updating advice request: {e}")
        raise


async def assign_officer_to_request(
    request_id: str,
    officer_id: str
) -> Optional[Dict[str, Any]]:
    """Assign an officer to handle the request"""
    try:
        result = (
            supabase.table("farmer_advice_requests")
            .update({
                "assigned_officer_id": officer_id,
                "status": "in_progress",
                "updated_at": get_current_timestamp()
            })
            .eq("id", request_id)
            .execute()
        )
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None
        
    except Exception as e:
        print(f"Error assigning officer: {e}")
        raise


async def complete_advice_request(
    request_id: str,
    officer_response: str,
    officer_notes: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Complete an advice request with officer response"""
    try:
        now = get_current_timestamp()
        result = (
            supabase.table("farmer_advice_requests")
            .update({
                "status": "completed",
                "officer_response": officer_response,
                "officer_notes": officer_notes,
                "responded_at": now,
                "completed_at": now,
                "updated_at": now
            })
            .eq("id", request_id)
            .execute()
        )
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None
        
    except Exception as e:
        print(f"Error completing advice request: {e}")
        raise


# ============================================================
# DELETE OPERATIONS
# ============================================================

async def delete_advice_request(request_id: str, farmer_id: str) -> bool:
    """
    Delete an advice request (only pending requests by the farmer who created it)
    """
    try:
        result = (
            supabase.table("farmer_advice_requests")
            .delete()
            .eq("id", request_id)
            .eq("farmer_id", farmer_id)
            .eq("status", "pending")
            .execute()
        )
        return len(result.data) > 0 if result.data else False
        
    except Exception as e:
        print(f"Error deleting advice request: {e}")
        return False
