import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse
from app.services.job_service import JobService
from app.dependencies.auth import get_current_active_user, require_role
from app.models.user import User, UserRole
from app.utils.pagination import PaginationParams
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])


@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Job",
    description="Create a new job posting for the authenticated user's company.",
)
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new job posting."""
    service = JobService(db)
    try:
        job = await service.create_job(
            company_id=current_user.company_id,
            user_id=current_user.id,
            job_data=job_data.model_dump(),
        )
        return job
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "",
    response_model=JobListResponse,
    summary="List Jobs",
    description="Get all jobs for the authenticated user's company with search, filter, and pagination.",
)
async def get_jobs(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None, description="Search in title and description"),
    job_status: str | None = Query(None, alias="status", description="Filter by status"),
    employment_type: str | None = Query(None, description="Filter by employment type"),
    location: str | None = Query(None, description="Filter by location"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all jobs with search, filter, and pagination."""
    service = JobService(db)
    result = await service.get_jobs(
        company_id=current_user.company_id,
        page=pagination.page,
        size=pagination.size,
        search=search,
        status=job_status,
        employment_type=employment_type,
        location=location,
    )
    return result


@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Get Job",
    description="Get a specific job by its ID.",
)
async def get_job(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific job by ID."""
    service = JobService(db)
    try:
        return await service.get_job(job_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/{job_id}",
    response_model=JobResponse,
    summary="Update Job",
    description="Update a job posting.",
)
async def update_job(
    job_id: uuid.UUID,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a job posting."""
    service = JobService(db)
    try:
        return await service.update_job(
            job_id=job_id,
            user_id=current_user.id,
            update_data=job_data.model_dump(exclude_unset=True),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Job",
    description="Delete a job posting. Requires Admin or Recruiter role.",
)
async def delete_job(
    job_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.RECRUITER)),
    db: AsyncSession = Depends(get_db),
):
    """Delete a job posting."""
    service = JobService(db)
    try:
        await service.delete_job(job_id=job_id, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
