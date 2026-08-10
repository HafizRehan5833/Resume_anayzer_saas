import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
from app.repositories.candidate_repository import CandidateRepository
from app.repositories.activity_log_repository import ActivityLogRepository
from app.core.logging import get_logger

logger = get_logger(__name__)


class CandidateService:
    """Service for candidate management business logic."""

    def __init__(self, db: AsyncSession) -> None:
        self.candidate_repo = CandidateRepository(db)
        self.activity_repo = ActivityLogRepository(db)

    async def create_candidate(
        self, company_id: uuid.UUID, user_id: uuid.UUID, candidate_data: dict
    ) -> Candidate:
        """Create a new candidate."""
        candidate = Candidate(
            company_id=company_id,
            full_name=candidate_data["full_name"],
            email=candidate_data.get("email"),
            phone=candidate_data.get("phone"),
            location=candidate_data.get("location"),
            skills=candidate_data.get("skills", []),
            education=candidate_data.get("education"),
            experience=candidate_data.get("experience"),
            certifications=candidate_data.get("certifications"),
            languages=candidate_data.get("languages", []),
            linkedin=candidate_data.get("linkedin"),
            github=candidate_data.get("github"),
            portfolio=candidate_data.get("portfolio"),
            summary=candidate_data.get("summary"),
            resume_path=candidate_data.get("resume_path"),
        )
        candidate = await self.candidate_repo.create(candidate)
        await self.activity_repo.create(
            user_id, f"Created candidate: {candidate.full_name}"
        )
        return candidate

    async def get_candidate(self, candidate_id: uuid.UUID) -> Candidate:
        """Get a specific candidate by ID."""
        candidate = await self.candidate_repo.get_by_id(candidate_id)
        if not candidate:
            raise ValueError("Candidate not found.")
        return candidate

    async def get_candidates(
        self,
        company_id: uuid.UUID,
        page: int = 1,
        size: int = 20,
        search: str | None = None,
        skills: list[str] | None = None,
        location: str | None = None,
    ) -> dict:
        """Get all candidates with search, filter, and pagination."""
        skip = (page - 1) * size
        candidates, total = await self.candidate_repo.get_all(
            company_id=company_id,
            skip=skip,
            limit=size,
            search=search,
            skills=skills,
            location=location,
        )
        return {"candidates": candidates, "total": total, "page": page, "size": size}

    async def update_candidate(
        self, candidate_id: uuid.UUID, user_id: uuid.UUID, update_data: dict
    ) -> Candidate:
        """Update a candidate."""
        candidate = await self.candidate_repo.get_by_id(candidate_id)
        if not candidate:
            raise ValueError("Candidate not found.")

        candidate = await self.candidate_repo.update(candidate, update_data)
        await self.activity_repo.create(
            user_id, f"Updated candidate: {candidate.full_name}"
        )
        return candidate

    async def delete_candidate(
        self, candidate_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        """Delete a candidate."""
        candidate = await self.candidate_repo.get_by_id(candidate_id)
        if not candidate:
            raise ValueError("Candidate not found.")

        await self.activity_repo.create(
            user_id, f"Deleted candidate: {candidate.full_name}"
        )
        await self.candidate_repo.delete(candidate)

    async def create_from_parsed_resume(
        self, company_id: uuid.UUID, user_id: uuid.UUID, parsed_data: dict, resume_path: str | None = None
    ) -> Candidate:
        """Create a candidate from AI-parsed resume data."""
        candidate_data = {
            "full_name": parsed_data.get("full_name", "Unknown"),
            "email": parsed_data.get("email"),
            "phone": parsed_data.get("phone"),
            "skills": parsed_data.get("skills", []),
            "experience": parsed_data.get("experience"),
            "education": parsed_data.get("education"),
            "certifications": parsed_data.get("certifications"),
            "languages": parsed_data.get("languages", []),
            "linkedin": parsed_data.get("linkedin"),
            "github": parsed_data.get("github"),
            "portfolio": parsed_data.get("portfolio"),
            "resume_path": resume_path,
        }
        return await self.create_candidate(company_id, user_id, candidate_data)
