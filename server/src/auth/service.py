from fastapi import HTTPException
from supabase import Client
from core.supabase_client import supabase
from .schema import SignupRequest, LoginRequest


# ==========================
# SIGNUP FUNCTION (FIXED)
# ==========================
async def signup_user(data: SignupRequest, supabase: Client = supabase):
    try:
        auth_res = supabase.auth.sign_up(
            {
                "email": data.email,
                "password": data.password
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Supabase v2 → user lives inside session.user when email confirmation is disabled
    session = auth_res.session
    user = auth_res.user or (session.user if session else None)

    if user is None:
        raise HTTPException(status_code=400, detail="Signup failed: No user returned")

    # Create user profile row
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
        raise HTTPException(status_code=500, detail=f"Profile insert failed: {e}")

    return {
        "message": "Signup successful",
        "user_id": user.id,
        "email": user.email,
        "token": session.access_token if session else None,
    }


# ==========================
# LOGIN FUNCTION (FIXED)
# ==========================
async def login_user(data: LoginRequest, supabase: Client = supabase):

    try:
        auth_res = supabase.auth.sign_in_with_password(
            {
                "email": data.email,
                "password": data.password
            }
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    session = auth_res.session
    if session is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = session.user
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Fetch profile
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
