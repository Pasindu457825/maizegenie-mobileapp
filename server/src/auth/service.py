from fastapi import HTTPException
from supabase import Client
from core.supabase_client import supabase
from .schema import SignupRequest, LoginRequest


# ======================================================
# SIGNUP HANDLER
# ======================================================
async def signup_user(data: SignupRequest, supabase: Client = supabase):
    """
    Creates Supabase auth user + matching profile entry.
    """

    # 1. Create user in supabase auth
    try:
        auth_res = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Extract created user
    session = auth_res.session
    user = auth_res.user or (session.user if session else None)

    if not user:
        raise HTTPException(status_code=400, detail="Signup failed: no user returned from Supabase")

    # 3. Insert into profiles table
    profile_data = {
        "id": user.id,
        "full_name": data.full_name,
        "phone": data.phone,
        "district": data.district,
        "role": data.role,
    }

    try:
        supabase.table("profiles").insert(profile_data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user profile: {e}")

    return {
        "message": "Signup successful",
        "user_id": user.id,
        "email": user.email,
        "token": session.access_token if session else None,
    }


# ======================================================
# LOGIN HANDLER
# ======================================================
async def login_user(data: LoginRequest, supabase: Client = supabase):
    """
    Authenticates user and returns profile + tokens.
    """
    try:
        auth_res = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    session = auth_res.session
    if not session:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = session.user
    if not user:
        raise HTTPException(status_code=401, detail="No user available")

    # Fetch profile data
    profile = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .execute()
    )

    return {
        "token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
        },
        "profile": profile.data
    }
