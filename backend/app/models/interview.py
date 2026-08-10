import uuid
from datetime import datetime, timezone, date, time
import enum

from sqlalchemy import String, DateTime, Date, Time, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"


class InterviewType(str, enum.Enum):
    TECHNICAL = "technical"
    HR = "hr"
    BEHAVIORAL = "behavioral"
    CULTURAL = "cultural"
    FINAL = "final"


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False
    )
    interview_date: Mapped[date] = mapped_column(Date, nullable=False)
    interview_time: Mapped[time] = mapped_column(Time, nullable=False)
    interview_type: Mapped[InterviewType] = mapped_column(
        Enum(InterviewType), default=InterviewType.TECHNICAL
    )
    interviewer: Mapped[str] = mapped_column(String(255), nullable=True)
    meeting_link: Mapped[str] = mapped_column(String(500), nullable=True)
    status: Mapped[InterviewStatus] = mapped_column(
        Enum(InterviewStatus), default=InterviewStatus.SCHEDULED
    )

    # Relationships
    application = relationship("Application", back_populates="interviews", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Interview(id={self.id}, type={self.interview_type}, status={self.status})>"
