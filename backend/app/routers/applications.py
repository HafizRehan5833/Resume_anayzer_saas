import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdateStatus,
    ApplicationResponse,
    ApplicationListResponse,
)
from app.services.application_service import ApplicationService
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.utils.pagination import PaginationParams
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/applications", tags=["Applications"])


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply Candidate",
    description="Apply a candidate to a job opening.",
)
async def apply_candidate(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Apply a candidate to a job."""
    service = ApplicationService(db)
    try:
        application = await service.apply(
            candidate_id=application_data.candidate_id,
            job_id=application_data.job_id,
            user_id=current_user.id,
        )
        return application
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "",
    response_model=ApplicationListResponse,
    summary="List Applications",
    description="Get all applications with optional job, candidate, and status filters.",
)
async def get_applications(
    pagination: PaginationParams = Depends(),
    job_id: uuid.UUID | None = Query(None, description="Filter by job"),
    candidate_id: uuid.UUID | None = Query(None, description="Filter by candidate"),
    application_status: str | None = Query(None, alias="status", description="Filter by status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all applications with filters and pagination."""
    service = ApplicationService(db)
    result = await service.get_applications(
        job_id=job_id,
        candidate_id=candidate_id,
        status=application_status,
        page=pagination.page,
        size=pagination.size,
    )
    return result


@router.patch(
    "/{application_id}/status",
    response_model=ApplicationResponse,
    summary="Update Application Status",
    description="Update the status of an application.",
)
async def update_application_status(
    application_id: uuid.UUID,
    status_data: ApplicationUpdateStatus,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update application status."""
    service = ApplicationService(db)
    try:
        return await service.update_status(
            application_id=application_id,
            status=status_data.status,
            user_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch(
    "/{application_id}/reject",
    response_model=ApplicationResponse,
    summary="Reject Candidate",
    description="Reject a candidate's application.",
)
async def reject_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Reject an application."""
    service = ApplicationService(db)
    try:
        return await service.reject(application_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch(
    "/{application_id}/hire",
    response_model=ApplicationResponse,
    summary="Hire Candidate",
    description="Mark a candidate as hired.",
)
async def hire_candidate(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Hire a candidate."""
    service = ApplicationService(db)
    try:
        return await service.hire(application_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
