import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class CompanyBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255, examples=["Acme Corp"])
    subscription_plan: str = Field(default="free", examples=["free", "pro", "enterprise"])


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    company_name: str | None = Field(None, min_length=2, max_length=255)
    subscription_plan: str | None = None


class CompanyResponse(BaseModel):
    id: uuid.UUID
    company_name: str
    subscription_plan: str
    created_at: datetime

    model_config = {"from_attributes": True}
