import uuid
from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_log import ActivityLog
from app.core.logging import get_logger

logger = get_logger(__name__)


class ActivityLogRepository:
    """Repository for ActivityLog database operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, user_id: uuid.UUID, activity: str) -> ActivityLog:
        """Create a new activity log entry."""
        log = ActivityLog(user_id=user_id, activity=activity)
        self.db.add(log)
        await self.db.flush()
        await self.db.refresh(log)
        return log

    async def get_by_user(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> tuple[Sequence[ActivityLog], int]:
        """Get activity logs for a user with pagination."""
        query = select(ActivityLog).where(ActivityLog.user_id == user_id)
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        result = await self.db.execute(
            query.order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit)
        )
        return result.scalars().all(), total
