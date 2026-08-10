import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.repositories.application_repository import ApplicationRepository
from app.repositories.activity_log_repository import ActivityLogRepository
from app.core.logging import get_logger

logger = get_logger(__name__)


class ApplicationService:
    """Service for application management business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self.app_repo = ApplicationRepository(db)
        self.activity_repo = ActivityLogRepository(db)

    async def apply(
        self,
        candidate_id: uuid.UUID,
        job_id: uuid.UUID,
        user_id: uuid.UUID,
        ai_score: float | None = None,
    ) -> Application:
        """Apply a candidate to a job."""
        existing = await self.app_repo.get_by_candidate_and_job(candidate_id, job_id)
        if existing:
            raise ValueError("Candidate has already applied for this job.")

        application = Application(
            candidate_id=candidate_id,
            job_id=job_id,
            status=ApplicationStatus.APPLIED,
            ai_score=ai_score,
        )
        application = await self.app_repo.create(application)
        await self.activity_repo.create(
            user_id, f"Applied candidate {candidate_id} to job {job_id}"
        )
        return application

    async def update_status(
        self,
        application_id: uuid.UUID,
        status: str,
        user_id: uuid.UUID,
    ) -> Application:
        """Update application status."""
        application = await self.app_repo.get_by_id(application_id)
        if not application:
            raise ValueError("Application not found.")

        application = await self.app_repo.update(
            application, {"status": ApplicationStatus(status)}
        )
        await self.activity_repo.create(
            user_id, f"Updated application {application_id} status to {status}"
        )
        return application

    async def reject(self, application_id: uuid.UUID, user_id: uuid.UUID) -> Application:
        """Reject an application."""
        return await self.update_status(application_id, "rejected", user_id)

    async def hire(self, application_id: uuid.UUID, user_id: uuid.UUID) -> Application:
        """Hire a candidate."""
        return await self.update_status(application_id, "hired", user_id)

    async def get_applications(
        self,
        job_id: uuid.UUID | None = None,
        candidate_id: uuid.UUID | None = None,
        status: str | None = None,
        page: int = 1,
        size: int = 20,
    ) -> dict:
        """Get all applications with optional filters and pagination."""
        skip = (page - 1) * size
        applications, total = await self.app_repo.get_all(
            job_id=job_id,
            candidate_id=candidate_id,
            status=status,
            skip=skip,
            limit=size,
        )
        return {"applications": applications, "total": total, "page": page, "size": size}
