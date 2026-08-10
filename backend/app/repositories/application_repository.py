import uuid
from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.core.logging import get_logger

logger = get_logger(__name__)


class ApplicationRepository:
    """Repository for Application database operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, application: Application) -> Application:
        """Create a new application."""
        self.db.add(application)
        await self.db.flush()
        await self.db.refresh(application)
        logger.info(f"Created application: {application.id}")
        return application

    async def get_by_id(self, application_id: uuid.UUID) -> Application | None:
        """Get an application by ID."""
        result = await self.db.execute(
            select(Application).where(Application.id == application_id)
        )
        return result.scalars().first()

    async def get_by_candidate_and_job(
        self, candidate_id: uuid.UUID, job_id: uuid.UUID
    ) -> Application | None:
        """Check if a candidate already applied to a job."""
        result = await self.db.execute(
            select(Application).where(
                Application.candidate_id == candidate_id,
                Application.job_id == job_id,
            )
        )
        return result.scalars().first()

    async def get_all(
        self,
        job_id: uuid.UUID | None = None,
        candidate_id: uuid.UUID | None = None,
        status: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Application], int]:
        """Get all applications with optional filters and pagination."""
        query = select(Application)

        if job_id:
            query = query.where(Application.job_id == job_id)
        if candidate_id:
            query = query.where(Application.candidate_id == candidate_id)
        if status:
            query = query.where(Application.status == status)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        result = await self.db.execute(
            query.order_by(Application.created_at.desc()).offset(skip).limit(limit)
        )
        return result.scalars().all(), total

    async def update(self, application: Application, update_data: dict) -> Application:
        """Update an application."""
        for key, value in update_data.items():
            if value is not None:
                setattr(application, key, value)
        await self.db.flush()
        await self.db.refresh(application)
        logger.info(f"Updated application: {application.id} -> {application.status}")
        return application
