import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, examples=["Find Python developers with FastAPI experience"])


class ChatResponse(BaseModel):
    message: str
    response: str


class ChatHistoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    message: str
    response: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatHistoryListResponse(BaseModel):
    history: list[ChatHistoryResponse]
    total: int


class ResumeParseResponse(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    skills: list[str] = []
    experience: str | None = None
    education: str | None = None
    projects: str | None = None
    certifications: str | None = None
    languages: list[str] = []
    linkedin: str | None = None
    github: str | None = None
    portfolio: str | None = None


class JobMatchResponse(BaseModel):
    match_score: float
    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    recommendation: str


class CandidateSummaryResponse(BaseModel):
    professional_summary: str
    key_skills: list[str]
    experience_summary: str
    hiring_recommendation: str


class InterviewQuestionsResponse(BaseModel):
    technical_questions: list[str]
    hr_questions: list[str]
    behavioral_questions: list[str]


class JobDescriptionRequest(BaseModel):
    title: str = Field(..., examples=["Backend Developer"])
    experience: str = Field(..., examples=["3-5 years"])
    skills: list[str] = Field(..., examples=[["Python", "FastAPI", "PostgreSQL"]])
    location: str = Field(..., examples=["Remote"])


class JobDescriptionResponse(BaseModel):
    title: str
    description: str
    requirements: list[str]
    responsibilities: list[str]
    benefits: list[str]
