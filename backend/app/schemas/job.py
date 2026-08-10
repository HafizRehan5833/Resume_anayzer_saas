import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, examples=["Senior Python Developer"])
    description: str = Field(..., min_length=10, examples=["We are looking for a skilled developer..."])
    required_skills: list[str] = Field(default=[], examples=[["Python", "FastAPI", "PostgreSQL"]])
    experience: str | None = Field(None, examples=["3-5 years"])
    salary: str | None = Field(None, examples=["$80,000 - $120,000"])
    location: str | None = Field(None, examples=["San Francisco, CA"])
    employment_type: str = Field(default="full_time", examples=["full_time", "part_time", "contract", "internship", "remote"])
    status: str = Field(default="open", examples=["open", "closed", "paused", "draft"])


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: str | None = Field(None, min_length=2, max_length=255)
    description: str | None = None
    required_skills: list[str] | None = None
    experience: str | None = None
    salary: str | None = None
    location: str | None = None
    employment_type: str | None = None
    status: str | None = None


class JobResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    title: str
    description: str
    required_skills: list[str]
    experience: str | None
    salary: str | None
    location: str | None
    employment_type: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
    page: int
    size: int
