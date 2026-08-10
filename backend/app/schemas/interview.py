import uuid
from datetime import date, time
from pydantic import BaseModel, Field


class InterviewCreate(BaseModel):
    application_id: uuid.UUID
    interview_date: date
    interview_time: time
    interview_type: str = Field(default="technical", examples=["technical", "hr", "behavioral", "cultural", "final"])
    interviewer: str | None = Field(None, examples=["John Doe"])
    meeting_link: str | None = Field(None, examples=["https://meet.google.com/abc-defg-hij"])


class InterviewUpdate(BaseModel):
    interview_date: date | None = None
    interview_time: time | None = None
    interview_type: str | None = None
    interviewer: str | None = None
    meeting_link: str | None = None
    status: str | None = Field(None, examples=["scheduled", "completed", "cancelled", "rescheduled"])


class InterviewResponse(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    interview_date: date
    interview_time: time
    interview_type: str
    interviewer: str | None
    meeting_link: str | None
    status: str

    model_config = {"from_attributes": True}


class InterviewListResponse(BaseModel):
    interviews: list[InterviewResponse]
    total: int
    page: int
    size: int
