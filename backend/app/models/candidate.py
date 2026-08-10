import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    skills: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    education: Mapped[str] = mapped_column(Text, nullable=True)
    experience: Mapped[str] = mapped_column(Text, nullable=True)
    certifications: Mapped[str] = mapped_column(Text, nullable=True)
    languages: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    linkedin: Mapped[str] = mapped_column(String(500), nullable=True)
    github: Mapped[str] = mapped_column(String(500), nullable=True)
    portfolio: Mapped[str] = mapped_column(String(500), nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    resume_path: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    company = relationship("Company", back_populates="candidates", lazy="selectin")
    applications = relationship("Application", back_populates="candidate", lazy="selectin", order_by="desc(Application.created_at)")

    @property
    def status(self) -> str | None:
        if self.applications:
            return self.applications[0].status
        return None

    @property
    def ai_score(self) -> float | None:
        if self.applications:
            return self.applications[0].ai_score
        return None

    def __repr__(self) -> str:
        return f"<Candidate(id={self.id}, name={self.full_name})>"
