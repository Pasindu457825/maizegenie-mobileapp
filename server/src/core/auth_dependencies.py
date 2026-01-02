"""
Authentication Dependencies for FastAPI
Provides JWT token verification using Supabase
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from core.supabase_client import supabase

# Security scheme for JWT Bearer tokens
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify JWT token and return user information
    
    Args:
        credentials: Bearer token from Authorization header
        supabase_client: Supabase client instance
        
    Returns:
        dict: User information from token
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = user_response.user
        
        # Fetch role from profiles table
        role = None
        try:
            profile_response = supabase.table("profiles").select("role").eq("id", user.id).single().execute()
            if profile_response.data:
                role = profile_response.data.get("role")
        except Exception as profile_error:
            print(f"Warning: Could not fetch profile role: {profile_error}")
            # Fallback to user_metadata if profiles table query fails
            role = user.user_metadata.get("role")
        
        return {
            "id": user.id,
            "email": user.email,
            "role": role,
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_farmer(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Ensure current user is a farmer
    
    Args:
        current_user: User from get_current_user dependency
        
    Returns:
        dict: Farmer user information
        
    Raises:
        HTTPException: If user is not a farmer
    """
    if current_user.get("role") != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Farmer role required.",
        )
    
    return current_user
