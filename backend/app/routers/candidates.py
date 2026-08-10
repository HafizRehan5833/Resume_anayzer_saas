import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.candidate import (
    CandidateCreate,
    CandidateUpdate,
    CandidateResponse,
    CandidateListResponse,
)
from app.services.candidate_service import CandidateService
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.utils.pagination import PaginationParams
from app.utils.file_upload import save_upload_file
from app.ai.resume_parser import parse_resume
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/candidates", tags=["Candidates"])


@router.post(
    "/upload",
    response_model=CandidateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Resume",
    description="Upload a PDF resume. Parses it with AI and creates a candidate record automatically.",
)
async def upload_resume(
    file: UploadFile = File(..., description="PDF resume file"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a resume PDF, parse it with AI, and create a candidate."""
    # Save the file
    file_path = await save_upload_file(file, current_user.company_id)

    # Parse resume with AI
    try:
        parsed_data = await parse_resume(file_path)
    except Exception as e:
        logger.error(f"Resume parsing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse resume: {str(e)}",
        )

    # Create candidate from parsed data
    service = CandidateService(db)
    candidate = await service.create_from_parsed_resume(
        company_id=current_user.company_id,
        user_id=current_user.id,
        parsed_data=parsed_data,
        resume_path=file_path,
    )
    return candidate


@router.post(
    "",
    response_model=CandidateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Candidate",
    description="Manually create a new candidate record.",
)
async def create_candidate(
    candidate_data: CandidateCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new candidate manually."""
    service = CandidateService(db)
    try:
        candidate = await service.create_candidate(
            company_id=current_user.company_id,
            user_id=current_user.id,
            candidate_data=candidate_data.model_dump(),
        )
        return candidate
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "",
    response_model=CandidateListResponse,
    summary="List Candidates",
    description="Get all candidates with search, filter, and pagination.",
)
async def get_candidates(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None, description="Search by name, email, or summary"),
    skills: str | None = Query(None, description="Comma-separated skills to filter by"),
    location: str | None = Query(None, description="Filter by location"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all candidates with search, filter, and pagination."""
    service = CandidateService(db)
    skills_list = [s.strip() for s in skills.split(",")] if skills else None
    result = await service.get_candidates(
        company_id=current_user.company_id,
        page=pagination.page,
        size=pagination.size,
        search=search,
        skills=skills_list,
        location=location,
    )
    return result


@router.get(
    "/{candidate_id}",
    response_model=CandidateResponse,
    summary="Get Candidate",
    description="Get a specific candidate by ID.",
)
async def get_candidate(
    candidate_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific candidate by ID."""
    service = CandidateService(db)
    try:
        return await service.get_candidate(candidate_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/{candidate_id}",
    response_model=CandidateResponse,
    summary="Update Candidate",
    description="Update a candidate's information.",
)
async def update_candidate(
    candidate_id: uuid.UUID,
    candidate_data: CandidateUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a candidate."""
    service = CandidateService(db)
    try:
        return await service.update_candidate(
            candidate_id=candidate_id,
            user_id=current_user.id,
            update_data=candidate_data.model_dump(exclude_unset=True),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{candidate_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Candidate",
    description="Delete a candidate record.",
)
async def delete_candidate(
    candidate_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a candidate."""
    service = CandidateService(db)
    try:
        await service.delete_candidate(
            candidate_id=candidate_id,
            user_id=current_user.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
