"""
Advice Request Router
API endpoints for farmer advice requests
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from core.auth_dependencies import get_current_user
import math

from .models import (
    AdviceRequestCreate,
    AdviceRequestUpdate,
    AdviceRequestCancel,
    AdviceRequestResponse,
    AdviceRequestListResponse,
    AdviceRequestStats
)
from .service import (
    create_advice_request,
    get_advice_request,
    get_advice_request_with_details,
    list_advice_requests,
    get_farmer_advice_requests,
    get_advice_request_stats,
    update_advice_request,
    assign_officer_to_request,
    complete_advice_request,
    delete_advice_request
)

# Create router
router = APIRouter(prefix="/api/v1/advice-requests", tags=["Advice Requests"])


# ============================================================
# CREATE ENDPOINTS
# ============================================================

@router.post("", response_model=AdviceRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request: AdviceRequestCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new advice request (Farmer only)
    
    - Farmers can request advice on yield enhancement and seed variety selection
    - Request is linked to their yield prediction
    - Officers will be notified and can respond
    """
    try:
        # Get user info - any authenticated user can create advice requests
        # (In practice, only farmers will access this from the results screen)
        user_role = (current_user.get("role") or "").lower()
        farmer_id = current_user.get("id")
        
        print(f"🔍 Create advice request - User ID: {farmer_id}, Role: '{current_user.get('role')}'")
        
        # Officers should not create advice requests (they respond to them)
        if user_role == "officer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Officers cannot create advice requests. Use the Farmer Requests screen to respond to requests."
            )
        if not farmer_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found"
            )
        
        # Create the request
        result = await create_advice_request(
            farmer_id=farmer_id,
            data=request.model_dump()
        )
        
        return AdviceRequestResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating advice request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create advice request: {str(e)}"
        )


# ============================================================
# READ ENDPOINTS
# ============================================================

@router.get("", response_model=AdviceRequestListResponse)
async def list_requests(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    request_type: Optional[str] = Query(None, description="Filter by request type"),
    district: Optional[str] = Query(None, description="Filter by district"),
    assigned_officer_id: Optional[str] = Query(None, description="Filter by assigned officer"),
    farmer_id: Optional[str] = Query(None, description="Filter by farmer (officers only)"),
    date_from: Optional[str] = Query(None, description="Filter from date (ISO format)"),
    date_to: Optional[str] = Query(None, description="Filter to date (ISO format)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(get_current_user)
):
    """
    List advice requests with filters and pagination
    
    - Officers: Can see all requests
    - Farmers: Can only see their own requests
    """
    try:
        user_role = current_user.get("role", "farmer")
        user_id = current_user.get("id")
        
        # Build filters
        filters = {
            "status": status_filter,
            "priority": priority,
            "request_type": request_type,
            "district": district,
            "assigned_officer_id": assigned_officer_id,
            "date_from": date_from,
            "date_to": date_to,
        }
        
        # Officers can filter by farmer_id, farmers cannot
        if user_role == "officer" and farmer_id:
            filters["farmer_id"] = farmer_id
        
        # Get requests
        requests, total = await list_advice_requests(
            filters=filters,
            page=page,
            page_size=page_size,
            user_role=user_role,
            user_id=user_id
        )
        
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        
        return AdviceRequestListResponse(
            requests=[AdviceRequestResponse(**r) for r in requests],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        print(f"Error listing advice requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list advice requests: {str(e)}"
        )


@router.get("/stats", response_model=AdviceRequestStats)
async def get_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Get advice request statistics
    
    - Officers: Stats for all requests
    - Farmers: Stats for their own requests
    """
    try:
        user_role = current_user.get("role", "farmer")
        user_id = current_user.get("id")
        
        stats = await get_advice_request_stats(
            user_role=user_role,
            user_id=user_id
        )
        
        return AdviceRequestStats(**stats)
        
    except Exception as e:
        print(f"Error getting stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )


@router.get("/my-requests", response_model=List[AdviceRequestResponse])
async def get_my_requests(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of requests"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get current farmer's advice requests
    
    Shortcut endpoint for farmers to get their own requests
    """
    try:
        farmer_id = current_user.get("id")
        if not farmer_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found"
            )
        
        requests = await get_farmer_advice_requests(
            farmer_id=farmer_id,
            status=status_filter,
            limit=limit
        )
        
        return [AdviceRequestResponse(**r) for r in requests]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting my requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get requests: {str(e)}"
        )


@router.get("/{request_id}", response_model=AdviceRequestResponse)
async def get_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific advice request by ID
    
    - Officers: Can view any request
    - Farmers: Can only view their own requests
    """
    try:
        user_role = current_user.get("role", "farmer")
        user_id = current_user.get("id")
        
        request_data = await get_advice_request(request_id)
        
        if not request_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advice request not found"
            )
        
        # Check access permission
        if user_role == "farmer" and request_data.get("farmer_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own requests"
            )
        
        return AdviceRequestResponse(**request_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting advice request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get advice request: {str(e)}"
        )


# ============================================================
# UPDATE ENDPOINTS
# ============================================================

@router.patch("/{request_id}", response_model=AdviceRequestResponse)
async def update_request(
    request_id: str,
    update: AdviceRequestUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update an advice request (Officer only)
    
    Officers can:
    - Change status (pending → in_progress → completed)
    - Set priority
    - Assign to themselves or another officer
    - Add response and notes
    """
    try:
        user_role = current_user.get("role", "farmer")
        
        if user_role != "officer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only officers can update advice requests"
            )
        
        # Check if request exists
        existing = await get_advice_request(request_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advice request not found"
            )
        
        # Update the request
        result = await update_advice_request(
            request_id=request_id,
            update_data=update.model_dump(exclude_none=True),
            user_role=user_role
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update advice request"
            )
        
        return AdviceRequestResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating advice request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update advice request: {str(e)}"
        )


@router.post("/{request_id}/assign", response_model=AdviceRequestResponse)
async def assign_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Assign the request to the current officer
    
    Officer assigns themselves to handle the request
    Status changes to 'in_progress'
    """
    try:
        user_role = (current_user.get("role") or "").lower()
        officer_id = current_user.get("id")
        
        print(f"🔍 Assign request - User ID: {officer_id}, Role: '{current_user.get('role')}'")
        
        if user_role != "officer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Only officers can assign requests. Your role: {current_user.get('role')}"
            )
        
        # Check if request exists
        existing = await get_advice_request(request_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advice request not found"
            )
        
        # Assign officer
        result = await assign_officer_to_request(request_id, officer_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to assign request"
            )
        
        return AdviceRequestResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error assigning request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign request: {str(e)}"
        )


@router.post("/{request_id}/complete", response_model=AdviceRequestResponse)
async def complete_request(
    request_id: str,
    officer_response: str = Query(..., min_length=10, description="Officer's advice response"),
    officer_notes: Optional[str] = Query(None, description="Internal notes"),
    current_user: dict = Depends(get_current_user)
):
    """
    Complete the advice request with officer's response
    
    - Requires a response message (min 10 characters)
    - Status changes to 'completed'
    - Timestamps are recorded
    """
    try:
        user_role = current_user.get("role", "farmer")
        
        if user_role != "officer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only officers can complete requests"
            )
        
        # Check if request exists
        existing = await get_advice_request(request_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advice request not found"
            )
        
        # Complete the request
        result = await complete_advice_request(
            request_id=request_id,
            officer_response=officer_response,
            officer_notes=officer_notes
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to complete request"
            )
        
        return AdviceRequestResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error completing request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete request: {str(e)}"
        )


@router.post("/{request_id}/cancel", response_model=AdviceRequestResponse)
async def cancel_request(
    request_id: str,
    cancel_data: AdviceRequestCancel,
    current_user: dict = Depends(get_current_user)
):
    """
    Cancel an advice request (Farmer only)
    
    - Farmers can only cancel their own pending requests
    - Once in_progress or completed, cannot be cancelled
    """
    try:
        user_id = current_user.get("id")
        
        # Check if request exists and belongs to farmer
        existing = await get_advice_request(request_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advice request not found"
            )
        
        if existing.get("farmer_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only cancel your own requests"
            )
        
        if existing.get("status") != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only cancel pending requests"
            )
        
        # Cancel the request
        result = await update_advice_request(
            request_id=request_id,
            update_data={"status": "cancelled"},
            user_role="farmer"
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel request"
            )
        
        return AdviceRequestResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error cancelling request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel request: {str(e)}"
        )


# ============================================================
# DELETE ENDPOINTS
# ============================================================

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete an advice request (Farmer only)
    
    - Farmers can only delete their own pending requests
    - Once in_progress or completed, cannot be deleted
    """
    try:
        user_id = current_user.get("id")
        
        # Check if request exists and belongs to farmer
        existing = await get_advice_request(request_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Advice request not found"
            )
        
        if existing.get("farmer_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own requests"
            )
        
        if existing.get("status") != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only delete pending requests"
            )
        
        # Delete the request
        success = await delete_advice_request(request_id, user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete request"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete request: {str(e)}"
        )
