import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    candidate_id: uuid.UUID
    job_id: uuid.UUID


class ApplicationUpdateStatus(BaseModel):
    status: str = Field(..., examples=["screening", "interview", "offered", "hired", "rejected"])


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    job_id: uuid.UUID
    status: str
    ai_score: float | None
    created_at: datetime
    candidate_name: str | None = None
    candidate_avatar: str | None = None
    job_title: str | None = None

    model_config = {"from_attributes": True}


class ApplicationListResponse(BaseModel):
    applications: list[ApplicationResponse]
    total: int
    page: int
    size: int
