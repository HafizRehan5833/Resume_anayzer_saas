import uuid
from typing import Sequence

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
from app.core.logging import get_logger

logger = get_logger(__name__)


class CandidateRepository:
    """Repository for Candidate database operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, candidate: Candidate) -> Candidate:
        """Create a new candidate."""
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)
        logger.info(f"Created candidate: {candidate.full_name}")
        return candidate

    async def get_by_id(self, candidate_id: uuid.UUID) -> Candidate | None:
        """Get a candidate by ID."""
        result = await self.db.execute(
            select(Candidate).where(Candidate.id == candidate_id)
        )
        return result.scalars().first()

    async def get_by_email(self, email: str, company_id: uuid.UUID) -> Candidate | None:
        """Get a candidate by email within a company."""
        result = await self.db.execute(
            select(Candidate).where(
                Candidate.email == email, Candidate.company_id == company_id
            )
        )
        return result.scalars().first()

    async def get_all(
        self,
        company_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        skills: list[str] | None = None,
        location: str | None = None,
    ) -> tuple[Sequence[Candidate], int]:
        """Get all candidates with search, filter, and pagination."""
        query = select(Candidate).where(Candidate.company_id == company_id)

        if search:
            search_filter = f"%{search}%"
            query = query.where(
                or_(
                    Candidate.full_name.ilike(search_filter),
                    Candidate.email.ilike(search_filter),
                    Candidate.summary.ilike(search_filter),
                )
            )
        if skills:
            query = query.where(Candidate.skills.overlap(skills))
        if location:
            query = query.where(Candidate.location.ilike(f"%{location}%"))

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        result = await self.db.execute(
            query.order_by(Candidate.created_at.desc()).offset(skip).limit(limit)
        )
        return result.scalars().all(), total

    async def update(self, candidate: Candidate, update_data: dict) -> Candidate:
        """Update a candidate."""
        for key, value in update_data.items():
            if value is not None:
                setattr(candidate, key, value)
        await self.db.flush()
        await self.db.refresh(candidate)
        logger.info(f"Updated candidate: {candidate.full_name}")
        return candidate

    async def delete(self, candidate: Candidate) -> None:
        """Delete a candidate."""
        await self.db.delete(candidate)
        await self.db.flush()
        logger.info(f"Deleted candidate: {candidate.full_name}")

    async def search_by_skills(
        self, company_id: uuid.UUID, skills: list[str], limit: int = 20
    ) -> Sequence[Candidate]:
        """Search candidates by skills."""
        query = select(Candidate).where(Candidate.company_id == company_id)
        query = query.where(Candidate.skills.overlap(skills))
        result = await self.db.execute(query.limit(limit))
        return result.scalars().all()
