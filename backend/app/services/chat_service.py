import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat_history import ChatHistory
from app.repositories.chat_repository import ChatHistoryRepository
from app.core.logging import get_logger

logger = get_logger(__name__)


class ChatService:
    """Service for chat history management."""

    def __init__(self, db: AsyncSession) -> None:
        self.chat_repo = ChatHistoryRepository(db)

    async def save_chat(
        self, user_id: uuid.UUID, message: str, response: str
    ) -> ChatHistory:
        """Save a chat message and response."""
        chat = ChatHistory(
            user_id=user_id,
            message=message,
            response=response,
        )
        chat = await self.chat_repo.create(chat)
        logger.info(f"Saved chat for user: {user_id}")
        return chat

    async def get_chat_history(
        self, user_id: uuid.UUID, page: int = 1, size: int = 50
    ) -> dict:
        """Get chat history for a user."""
        skip = (page - 1) * size
        history, total = await self.chat_repo.get_by_user(user_id, skip, size)
        return {"history": history, "total": total}
