import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    subscription_plan: Mapped[str] = mapped_column(String(50), default="free")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    users = relationship("User", back_populates="company", lazy="selectin")
    jobs = relationship("Job", back_populates="company", lazy="selectin")
    candidates = relationship("Candidate", back_populates="company", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Company(id={self.id}, name={self.company_name})>"
