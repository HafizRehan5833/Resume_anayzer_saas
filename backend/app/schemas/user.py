import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, examples=["John Doe"])
    email: EmailStr = Field(..., examples=["john@example.com"])
    role: str = Field(default="recruiter", examples=["admin", "recruiter", "hr"])


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, examples=["strongpassword123"])
    company_name: str = Field(..., min_length=2, max_length=255, examples=["Acme Corp"])


class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=255)
    email: EmailStr | None = None
    role: str | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    size: int
