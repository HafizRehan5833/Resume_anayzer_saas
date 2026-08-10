import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.interview import (
    InterviewCreate,
    InterviewUpdate,
    InterviewResponse,
    InterviewListResponse,
)
from app.services.interview_service import InterviewService
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.utils.pagination import PaginationParams
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/interviews", tags=["Interviews"])


@router.post(
    "",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Interview",
    description="Schedule a new interview for an application.",
)
async def create_interview(
    interview_data: InterviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new interview."""
    service = InterviewService(db)
    try:
        interview = await service.create_interview(
            user_id=current_user.id,
            interview_data=interview_data.model_dump(),
        )
        return interview
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "",
    response_model=InterviewListResponse,
    summary="List Interviews",
    description="Get all interviews with optional application and status filters.",
)
async def get_interviews(
    pagination: PaginationParams = Depends(),
    application_id: uuid.UUID | None = Query(None, description="Filter by application"),
    interview_status: str | None = Query(None, alias="status", description="Filter by status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all interviews with filters and pagination."""
    service = InterviewService(db)
    result = await service.get_interviews(
        application_id=application_id,
        status=interview_status,
        page=pagination.page,
        size=pagination.size,
    )
    return result


@router.get(
    "/{interview_id}",
    response_model=InterviewResponse,
    summary="Get Interview",
    description="Get a specific interview by ID.",
)
async def get_interview(
    interview_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific interview."""
    service = InterviewService(db)
    try:
        return await service.get_interview(interview_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/{interview_id}",
    response_model=InterviewResponse,
    summary="Update Interview",
    description="Update interview details.",
)
async def update_interview(
    interview_id: uuid.UUID,
    interview_data: InterviewUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an interview."""
    service = InterviewService(db)
    try:
        return await service.update_interview(
            interview_id=interview_id,
            user_id=current_user.id,
            update_data=interview_data.model_dump(exclude_unset=True),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{interview_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Interview",
    description="Delete an interview.",
)
async def delete_interview(
    interview_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an interview."""
    service = InterviewService(db)
    try:
        await service.delete_interview(
            interview_id=interview_id,
            user_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
