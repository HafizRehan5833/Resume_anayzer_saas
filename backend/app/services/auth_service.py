import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.company import Company
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.activity_log_repository import ActivityLogRepository
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    """Service for authentication and authorization logic."""

    def __init__(self, db: AsyncSession) -> None:
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)
        self.activity_repo = ActivityLogRepository(db)

    async def signup(
        self,
        full_name: str,
        email: str,
        password: str,
        company_name: str,
        role: str = "recruiter",
    ) -> dict:
        """Register a new user and create company if needed."""
        existing_user = await self.user_repo.get_by_email(email)
        if existing_user:
            raise ValueError("A user with this email already exists.")

        company = await self.company_repo.get_by_name(company_name)
        if not company:
            company = Company(company_name=company_name)
            company = await self.company_repo.create(company)

        user = User(
            company_id=company.id,
            full_name=full_name,
            email=email,
            hashed_password=hash_password(password),
            role=UserRole(role),
        )
        user = await self.user_repo.create(user)
        await self.activity_repo.create(user.id, "User signed up")

        tokens = self._generate_tokens(user)
        logger.info(f"User signed up: {email}")
        return {
            "user": user,
            **tokens,
        }

    async def login(self, email: str, password: str) -> dict:
        """Authenticate a user and return tokens."""
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise ValueError("Invalid email or password.")

        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password.")

        if not user.is_active:
            raise ValueError("This account has been deactivated.")

        await self.activity_repo.create(user.id, "User logged in")
        tokens = self._generate_tokens(user)
        logger.info(f"User logged in: {email}")
        return {
            "user": user,
            **tokens,
        }

    async def refresh_token(self, refresh_token: str) -> dict:
        """Generate new access token from a valid refresh token."""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid or expired refresh token.")

        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid token payload.")

        user = await self.user_repo.get_by_id(uuid.UUID(user_id))
        if not user or not user.is_active:
            raise ValueError("User not found or inactive.")

        tokens = self._generate_tokens(user)
        logger.info(f"Token refreshed for: {user.email}")
        return tokens

    async def get_current_user(self, token: str) -> User:
        """Get the current user from a JWT token."""
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            raise ValueError("Invalid or expired token.")

        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid token payload.")

        user = await self.user_repo.get_by_id(uuid.UUID(user_id))
        if not user or not user.is_active:
            raise ValueError("User not found or inactive.")

        return user

    def _generate_tokens(self, user: User) -> dict:
        """Generate access and refresh tokens for a user."""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value if isinstance(user.role, UserRole) else user.role,
        }
        return {
            "access_token": create_access_token(token_data),
            "refresh_token": create_refresh_token(token_data),
            "token_type": "bearer",
        }
