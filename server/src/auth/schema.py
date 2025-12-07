from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str
    district: str
    role: str  # farmer | officer | admin

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
