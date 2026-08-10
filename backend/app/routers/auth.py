from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import TokenResponse, RefreshTokenRequest, MessageResponse
from app.services.auth_service import AuthService
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account. Automatically creates a company if it doesn't exist.",
)
async def signup(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user and return JWT tokens."""
    auth_service = AuthService(db)
    try:
        result = await auth_service.signup(
            full_name=user_data.full_name,
            email=user_data.email,
            password=user_data.password,
            company_name=user_data.company_name,
            role=user_data.role,
        )
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login",
    description="Authenticate with email and password to receive JWT tokens.",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Authenticate a user and return JWT tokens."""
    auth_service = AuthService(db)
    try:
        result = await auth_service.login(
            email=form_data.username,
            password=form_data.password,
        )
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh Token",
    description="Get a new access token using a valid refresh token.",
)
async def refresh_token(
    token_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh an access token."""
    auth_service = AuthService(db)
    try:
        result = await auth_service.refresh_token(token_data.refresh_token)
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current User",
    description="Get the profile of the currently authenticated user.",
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    """Get the current authenticated user's profile."""
    return current_user


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout",
    description="Logout the current user. Client should discard the JWT token.",
)
async def logout(
    current_user: User = Depends(get_current_active_user),
):
    """Logout endpoint. The client should discard the token."""
    logger.info(f"User logged out: {current_user.email}")
    return MessageResponse(message="Successfully logged out.")
