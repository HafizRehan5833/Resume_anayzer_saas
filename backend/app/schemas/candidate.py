import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class CandidateBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, examples=["Jane Smith"])
    email: EmailStr | None = Field(None, examples=["jane@example.com"])
    phone: str | None = Field(None, examples=["+1-555-0100"])
    location: str | None = Field(None, examples=["New York, NY"])
    skills: list[str] = Field(default=[], examples=[["Python", "React", "SQL"]])
    education: str | None = Field(None, examples=["B.S. Computer Science, MIT"])
    experience: str | None = Field(None, examples=["5 years in backend development"])
    certifications: str | None = Field(None, examples=["AWS Certified Developer"])
    languages: list[str] = Field(default=[], examples=[["English", "Spanish"]])
    linkedin: str | None = Field(None, examples=["https://linkedin.com/in/janesmith"])
    github: str | None = Field(None, examples=["https://github.com/janesmith"])
    portfolio: str | None = Field(None, examples=["https://janesmith.dev"])
    summary: str | None = None


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=255)
    email: EmailStr | None = None
    phone: str | None = None
    location: str | None = None
    skills: list[str] | None = None
    education: str | None = None
    experience: str | None = None
    certifications: str | None = None
    languages: list[str] | None = None
    linkedin: str | None = None
    github: str | None = None
    portfolio: str | None = None
    summary: str | None = None


class CandidateResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    full_name: str
    email: str | None
    phone: str | None
    location: str | None
    skills: list[str]
    education: str | None
    experience: str | None
    certifications: str | None
    languages: list[str]
    linkedin: str | None
    github: str | None
    portfolio: str | None
    summary: str | None
    resume_path: str | None
    created_at: datetime
    status: str | None = None
    ai_score: float | None = None

    model_config = {"from_attributes": True}


class CandidateListResponse(BaseModel):
    candidates: list[CandidateResponse]
    total: int
    page: int
    size: int
