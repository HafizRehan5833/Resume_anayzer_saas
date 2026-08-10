import uuid
from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview import Interview
from app.core.logging import get_logger

logger = get_logger(__name__)


class InterviewRepository:
    """Repository for Interview database operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, interview: Interview) -> Interview:
        """Create a new interview."""
        self.db.add(interview)
        await self.db.flush()
        await self.db.refresh(interview)
        logger.info(f"Created interview: {interview.id}")
        return interview

    async def get_by_id(self, interview_id: uuid.UUID) -> Interview | None:
        """Get an interview by ID."""
        result = await self.db.execute(
            select(Interview).where(Interview.id == interview_id)
        )
        return result.scalars().first()

    async def get_all(
        self,
        application_id: uuid.UUID | None = None,
        status: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Interview], int]:
        """Get all interviews with optional filters and pagination."""
        query = select(Interview)

        if application_id:
            query = query.where(Interview.application_id == application_id)
        if status:
            query = query.where(Interview.status == status)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        result = await self.db.execute(
            query.order_by(Interview.interview_date.desc()).offset(skip).limit(limit)
        )
        return result.scalars().all(), total

    async def update(self, interview: Interview, update_data: dict) -> Interview:
        """Update an interview."""
        for key, value in update_data.items():
            if value is not None:
                setattr(interview, key, value)
        await self.db.flush()
        await self.db.refresh(interview)
        logger.info(f"Updated interview: {interview.id}")
        return interview

    async def delete(self, interview: Interview) -> None:
        """Delete an interview."""
        await self.db.delete(interview)
        await self.db.flush()
        logger.info(f"Deleted interview: {interview.id}")
