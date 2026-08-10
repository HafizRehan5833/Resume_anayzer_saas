import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job, JobStatus, EmploymentType
from app.repositories.job_repository import JobRepository
from app.repositories.activity_log_repository import ActivityLogRepository
from app.core.logging import get_logger

logger = get_logger(__name__)


class JobService:
    """Service for job management business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self.job_repo = JobRepository(db)
        self.activity_repo = ActivityLogRepository(db)

    async def create_job(
        self, company_id: uuid.UUID, user_id: uuid.UUID, job_data: dict
    ) -> Job:
        """Create a new job posting."""
        job = Job(
            company_id=company_id,
            title=job_data["title"],
            description=job_data["description"],
            required_skills=job_data.get("required_skills", []),
            experience=job_data.get("experience"),
            salary=job_data.get("salary"),
            location=job_data.get("location"),
            employment_type=EmploymentType(job_data.get("employment_type", "full_time")),
            status=JobStatus(job_data.get("status", "open")),
        )
        job = await self.job_repo.create(job)
        await self.activity_repo.create(user_id, f"Created job: {job.title}")
        return job

    async def get_job(self, job_id: uuid.UUID) -> Job:
        """Get a specific job by ID."""
        job = await self.job_repo.get_by_id(job_id)
        if not job:
            raise ValueError("Job not found.")
        return job

    async def get_jobs(
        self,
        company_id: uuid.UUID,
        page: int = 1,
        size: int = 20,
        search: str | None = None,
        status: str | None = None,
        employment_type: str | None = None,
        location: str | None = None,
    ) -> dict:
        """Get all jobs with search, filter, and pagination."""
        skip = (page - 1) * size
        jobs, total = await self.job_repo.get_all(
            company_id=company_id,
            skip=skip,
            limit=size,
            search=search,
            status=status,
            employment_type=employment_type,
            location=location,
        )
        return {"jobs": jobs, "total": total, "page": page, "size": size}

    async def update_job(
        self, job_id: uuid.UUID, user_id: uuid.UUID, update_data: dict
    ) -> Job:
        """Update a job posting."""
        job = await self.job_repo.get_by_id(job_id)
        if not job:
            raise ValueError("Job not found.")

        job = await self.job_repo.update(job, update_data)
        await self.activity_repo.create(user_id, f"Updated job: {job.title}")
        return job

    async def delete_job(self, job_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Delete a job posting."""
        job = await self.job_repo.get_by_id(job_id)
        if not job:
            raise ValueError("Job not found.")

        await self.activity_repo.create(user_id, f"Deleted job: {job.title}")
        await self.job_repo.delete(job)
