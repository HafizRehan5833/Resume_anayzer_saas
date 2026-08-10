import uuid
from typing import Sequence

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job
from app.core.logging import get_logger

logger = get_logger(__name__)


class JobRepository:
    """Repository for Job database operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, job: Job) -> Job:
        """Create a new job."""
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)
        logger.info(f"Created job: {job.title}")
        return job

    async def get_by_id(self, job_id: uuid.UUID) -> Job | None:
        """Get a job by ID."""
        result = await self.db.execute(select(Job).where(Job.id == job_id))
        return result.scalars().first()

    async def get_all(
        self,
        company_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        status: str | None = None,
        employment_type: str | None = None,
        location: str | None = None,
    ) -> tuple[Sequence[Job], int]:
        """Get all jobs with search, filter, and pagination."""
        query = select(Job).where(Job.company_id == company_id)

        if search:
            search_filter = f"%{search}%"
            query = query.where(
                or_(
                    Job.title.ilike(search_filter),
                    Job.description.ilike(search_filter),
                )
            )
        if status:
            query = query.where(Job.status == status)
        if employment_type:
            query = query.where(Job.employment_type == employment_type)
        if location:
            query = query.where(Job.location.ilike(f"%{location}%"))

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        result = await self.db.execute(
            query.order_by(Job.created_at.desc()).offset(skip).limit(limit)
        )
        return result.scalars().all(), total

    async def update(self, job: Job, update_data: dict) -> Job:
        """Update a job."""
        for key, value in update_data.items():
            if value is not None:
                setattr(job, key, value)
        await self.db.flush()
        await self.db.refresh(job)
        logger.info(f"Updated job: {job.title}")
        return job

    async def delete(self, job: Job) -> None:
        """Delete a job."""
        await self.db.delete(job)
        await self.db.flush()
        logger.info(f"Deleted job: {job.title}")

    async def search_by_skills(
        self, company_id: uuid.UUID, skills: list[str], limit: int = 20
    ) -> Sequence[Job]:
        """Search jobs by required skills."""
        query = select(Job).where(Job.company_id == company_id)
        query = query.where(Job.required_skills.overlap(skills))
        result = await self.db.execute(query.limit(limit))
        return result.scalars().all()
