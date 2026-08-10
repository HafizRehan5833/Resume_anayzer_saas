import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview import Interview, InterviewStatus, InterviewType
from app.repositories.interview_repository import InterviewRepository
from app.repositories.activity_log_repository import ActivityLogRepository
from app.core.logging import get_logger

logger = get_logger(__name__)


class InterviewService:
    """Service for interview management business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self.interview_repo = InterviewRepository(db)
        self.activity_repo = ActivityLogRepository(db)

    async def create_interview(
        self, user_id: uuid.UUID, interview_data: dict
    ) -> Interview:
        """Create a new interview."""
        interview = Interview(
            application_id=interview_data["application_id"],
            interview_date=interview_data["interview_date"],
            interview_time=interview_data["interview_time"],
            interview_type=InterviewType(
                interview_data.get("interview_type", "technical")
            ),
            interviewer=interview_data.get("interviewer"),
            meeting_link=interview_data.get("meeting_link"),
            status=InterviewStatus.SCHEDULED,
        )
        interview = await self.interview_repo.create(interview)
        await self.activity_repo.create(
            user_id, f"Scheduled interview {interview.id}"
        )
        return interview

    async def get_interview(self, interview_id: uuid.UUID) -> Interview:
        """Get a specific interview by ID."""
        interview = await self.interview_repo.get_by_id(interview_id)
        if not interview:
            raise ValueError("Interview not found.")
        return interview

    async def get_interviews(
        self,
        application_id: uuid.UUID | None = None,
        status: str | None = None,
        page: int = 1,
        size: int = 20,
    ) -> dict:
        """Get all interviews with optional filters and pagination."""
        skip = (page - 1) * size
        interviews, total = await self.interview_repo.get_all(
            application_id=application_id,
            status=status,
            skip=skip,
            limit=size,
        )
        return {"interviews": interviews, "total": total, "page": page, "size": size}

    async def update_interview(
        self, interview_id: uuid.UUID, user_id: uuid.UUID, update_data: dict
    ) -> Interview:
        """Update an interview."""
        interview = await self.interview_repo.get_by_id(interview_id)
        if not interview:
            raise ValueError("Interview not found.")

        interview = await self.interview_repo.update(interview, update_data)
        await self.activity_repo.create(
            user_id, f"Updated interview {interview.id}"
        )
        return interview

    async def delete_interview(
        self, interview_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        """Delete an interview."""
        interview = await self.interview_repo.get_by_id(interview_id)
        if not interview:
            raise ValueError("Interview not found.")

        await self.activity_repo.create(
            user_id, f"Deleted interview {interview.id}"
        )
        await self.interview_repo.delete(interview)
