from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import oauth2_scheme
from app.database.database import get_db
from app.models.user import User, UserRole
from app.services.auth_service import AuthService
from app.core.logging import get_logger

logger = get_logger(__name__)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency to get the current authenticated user from JWT."""
    auth_service = AuthService(db)
    try:
        user = await auth_service.get_current_user(token)
        return user
    except ValueError as e:
        logger.warning(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency to ensure the current user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )
    return current_user


def require_role(*roles: UserRole):
    """Factory for role-based access control dependency."""

    async def role_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        user_role = current_user.role
        if isinstance(user_role, str):
            user_role = UserRole(user_role)
        if user_role not in roles:
            logger.warning(
                f"Access denied for user {current_user.email}: "
                f"role {user_role} not in {roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in roles]}",
            )
        return current_user

    return role_checker
