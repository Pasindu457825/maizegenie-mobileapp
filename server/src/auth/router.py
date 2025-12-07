from fastapi import APIRouter
from .schema import SignupRequest, LoginRequest
from .service import signup_user, login_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
async def register_user(data: SignupRequest):
    return await signup_user(data)

@router.post("/login")
async def login(data: LoginRequest):
    return await login_user(data)
