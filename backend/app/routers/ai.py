import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.database import get_db
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    ChatHistoryListResponse,
    ResumeParseResponse,
    JobMatchResponse,
    CandidateSummaryResponse,
    InterviewQuestionsResponse,
    JobDescriptionRequest,
    JobDescriptionResponse,
)
from app.services.chat_service import ChatService
from app.services.candidate_service import CandidateService
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.ai.agents import run_recruitment_agent
from app.ai.resume_parser import parse_resume
from app.ai.candidate_matcher import match_candidate_to_job
from app.ai.candidate_summary import generate_candidate_summary
from app.ai.interview_questions import generate_interview_questions
from app.ai.job_generator import generate_job_description
from app.utils.file_upload import save_upload_file
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="AI Chat",
    description="Send a message to the AI recruitment agent. The agent automatically selects the right tool based on your query.",
)
async def ai_chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Chat with the AI recruitment agent."""
    try:
        logger.info(f"AI chat request from {current_user.email}: {chat_request.message[:50]}")
        response_text = await run_recruitment_agent(chat_request.message)

        # Save chat history
        chat_service = ChatService(db)
        await chat_service.save_chat(
            user_id=current_user.id,
            message=chat_request.message,
            response=response_text,
        )

        return ChatResponse(
            message=chat_request.message,
            response=response_text,
        )
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI processing error: {str(e)}",
        )


@router.get(
    "/chat/history",
    response_model=ChatHistoryListResponse,
    summary="Chat History",
    description="Get the AI chat history for the current user.",
)
async def get_chat_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the chat history for the current user."""
    chat_service = ChatService(db)
    result = await chat_service.get_chat_history(current_user.id)
    return result


@router.post(
    "/parse-resume",
    response_model=ResumeParseResponse,
    summary="Parse Resume",
    description="Upload a PDF resume and extract structured data using AI.",
)
async def parse_resume_endpoint(
    file: UploadFile = File(..., description="PDF resume file"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Parse a resume and return structured data."""
    file_path = await save_upload_file(file, current_user.company_id)
    try:
        parsed_data = await parse_resume(file_path)
        return ResumeParseResponse(**parsed_data)
    except Exception as e:
        logger.error(f"Resume parse error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Resume parsing failed: {str(e)}",
        )


@router.post(
    "/match",
    response_model=JobMatchResponse,
    summary="Match Candidate to Job",
    description="Compare a candidate profile against a job description and get a match score.",
)
async def match_candidate(
    candidate_id: uuid.UUID,
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Match a candidate to a job using AI."""
    from app.services.job_service import JobService

    candidate_service = CandidateService(db)
    job_service = JobService(db)

    try:
        candidate = await candidate_service.get_candidate(candidate_id)
        job = await job_service.get_job(job_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    candidate_profile = (
        f"Name: {candidate.full_name}\n"
        f"Skills: {', '.join(candidate.skills or [])}\n"
        f"Experience: {candidate.experience or 'N/A'}\n"
        f"Education: {candidate.education or 'N/A'}\n"
        f"Summary: {candidate.summary or 'N/A'}"
    )
    job_description = (
        f"Title: {job.title}\n"
        f"Description: {job.description}\n"
        f"Required Skills: {', '.join(job.required_skills or [])}\n"
        f"Experience: {job.experience or 'N/A'}\n"
        f"Location: {job.location or 'N/A'}"
    )

    try:
        result = await match_candidate_to_job(candidate_profile, job_description)
        return JobMatchResponse(**result)
    except Exception as e:
        logger.error(f"Match error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Matching failed: {str(e)}",
        )


@router.post(
    "/summary/{candidate_id}",
    response_model=CandidateSummaryResponse,
    summary="Generate Candidate Summary",
    description="Generate an AI-powered professional summary for a candidate.",
)
async def generate_summary(
    candidate_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an AI summary for a candidate."""
    service = CandidateService(db)
    try:
        candidate = await service.get_candidate(candidate_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    candidate_info = (
        f"Name: {candidate.full_name}\n"
        f"Skills: {', '.join(candidate.skills or [])}\n"
        f"Experience: {candidate.experience or 'N/A'}\n"
        f"Education: {candidate.education or 'N/A'}\n"
        f"Certifications: {candidate.certifications or 'N/A'}\n"
        f"Languages: {', '.join(candidate.languages or [])}"
    )

    try:
        result = await generate_candidate_summary(candidate_info)
        return CandidateSummaryResponse(**result)
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summary generation failed: {str(e)}",
        )


@router.post(
    "/interview-questions",
    response_model=InterviewQuestionsResponse,
    summary="Generate Interview Questions",
    description="Generate tailored interview questions for a candidate and job combination.",
)
async def generate_questions(
    candidate_id: uuid.UUID,
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate interview questions using AI."""
    from app.services.job_service import JobService

    candidate_service = CandidateService(db)
    job_service = JobService(db)

    try:
        candidate = await candidate_service.get_candidate(candidate_id)
        job = await job_service.get_job(job_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    candidate_profile = (
        f"Name: {candidate.full_name}\n"
        f"Skills: {', '.join(candidate.skills or [])}\n"
        f"Experience: {candidate.experience or 'N/A'}\n"
        f"Education: {candidate.education or 'N/A'}"
    )
    job_requirements = (
        f"Title: {job.title}\n"
        f"Required Skills: {', '.join(job.required_skills or [])}\n"
        f"Experience: {job.experience or 'N/A'}\n"
        f"Description: {job.description}"
    )

    try:
        result = await generate_interview_questions(candidate_profile, job_requirements)
        return InterviewQuestionsResponse(**result)
    except Exception as e:
        logger.error(f"Question generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question generation failed: {str(e)}",
        )


@router.post(
    "/generate-job",
    response_model=JobDescriptionResponse,
    summary="Generate Job Description",
    description="Generate a professional job description using AI.",
)
async def generate_job(
    job_request: JobDescriptionRequest,
    current_user: User = Depends(get_current_active_user),
):
    """Generate a job description using AI."""
    try:
        result = await generate_job_description(
            title=job_request.title,
            experience=job_request.experience,
            skills=job_request.skills,
            location=job_request.location,
        )
        return JobDescriptionResponse(**result)
    except Exception as e:
        logger.error(f"Job generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job description generation failed: {str(e)}",
        )
