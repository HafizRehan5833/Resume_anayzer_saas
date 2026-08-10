import uuid
from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.logging import get_logger

logger = get_logger(__name__)


class UserRepository:
    """Repository for User database operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, user: User) -> User:
        """Create a new user."""
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        logger.info(f"Created user: {user.email}")
        return user

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Get a user by their ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> User | None:
        """Get a user by their email address."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_all(
        self, company_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> tuple[Sequence[User], int]:
        """Get all users for a company with pagination."""
        query = select(User).where(User.company_id == company_id)
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0
        result = await self.db.execute(query.offset(skip).limit(limit))
        return result.scalars().all(), total

    async def update(self, user: User, update_data: dict) -> User:
        """Update a user with the given data."""
        for key, value in update_data.items():
            if value is not None:
                setattr(user, key, value)
        await self.db.flush()
        await self.db.refresh(user)
        logger.info(f"Updated user: {user.email}")
        return user

    async def delete(self, user: User) -> None:
        """Delete a user."""
        await self.db.delete(user)
        await self.db.flush()
        logger.info(f"Deleted user: {user.email}")
