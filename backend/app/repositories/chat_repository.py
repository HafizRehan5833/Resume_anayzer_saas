import uuid
from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat_history import ChatHistory
from app.core.logging import get_logger

logger = get_logger(__name__)


class ChatHistoryRepository:
    """Repository for ChatHistory database operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, chat: ChatHistory) -> ChatHistory:
        """Create a new chat history entry."""
        self.db.add(chat)
        await self.db.flush()
        await self.db.refresh(chat)
        return chat

    async def get_by_user(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> tuple[Sequence[ChatHistory], int]:
        """Get chat history for a user with pagination."""
        query = select(ChatHistory).where(ChatHistory.user_id == user_id)
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        result = await self.db.execute(
            query.order_by(ChatHistory.created_at.desc()).offset(skip).limit(limit)
        )
        return result.scalars().all(), total
