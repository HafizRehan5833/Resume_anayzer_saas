import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.core.logging import get_logger

logger = get_logger(__name__)


class CompanyRepository:
    """Repository for Company database operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, company: Company) -> Company:
        """Create a new company."""
        self.db.add(company)
        await self.db.flush()
        await self.db.refresh(company)
        logger.info(f"Created company: {company.company_name}")
        return company

    async def get_by_id(self, company_id: uuid.UUID) -> Company | None:
        """Get a company by ID."""
        result = await self.db.execute(select(Company).where(Company.id == company_id))
        return result.scalars().first()

    async def get_by_name(self, company_name: str) -> Company | None:
        """Get a company by name."""
        result = await self.db.execute(
            select(Company).where(Company.company_name == company_name)
        )
        return result.scalars().first()

    async def update(self, company: Company, update_data: dict) -> Company:
        """Update a company."""
        for key, value in update_data.items():
            if value is not None:
                setattr(company, key, value)
        await self.db.flush()
        await self.db.refresh(company)
        logger.info(f"Updated company: {company.company_name}")
        return company
