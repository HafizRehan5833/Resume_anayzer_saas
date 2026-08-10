import uuid
from datetime import datetime, timezone
import enum

from sqlalchemy import String, DateTime, Float, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFERED = "offered"
    HIRED = "hired"
    REJECTED = "rejected"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus), default=ApplicationStatus.APPLIED
    )
    ai_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    candidate = relationship("Candidate", back_populates="applications", lazy="selectin")
    job = relationship("Job", back_populates="applications", lazy="selectin")
    interviews = relationship("Interview", back_populates="application", lazy="selectin")

    @property
    def candidate_name(self) -> str | None:
        return self.candidate.full_name if self.candidate else None

    @property
    def candidate_avatar(self) -> str | None:
        if self.candidate and self.candidate.full_name:
            parts = self.candidate.full_name.split()
            return "".join([p[0] for p in parts[:2]]).upper()
        return None

    @property
    def job_title(self) -> str | None:
        return self.job.title if self.job else None

    def __repr__(self) -> str:
        return f"<Application(id={self.id}, status={self.status})>"
