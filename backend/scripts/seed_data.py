import asyncio
from app.database.database import async_session_factory, engine, Base
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.application import Application
from app.core.security import get_password_hash

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session_factory() as session:
        company = Company(name="Acme Corp", address="123 Main St")
        session.add(company)
        await session.flush()
        admin = User(
            email="admin@acme.com",
            full_name="Admin User",
            hashed_password=get_password_hash("password123"),
            role=UserRole.ADMIN,
            company_id=company.id,
        )
        session.add(admin)
        await session.flush()
        job = Job(
            title="Software Engineer",
            description="Develop awesome software.",
            location="Remote",
            employment_type="Full-time",
            status="open",
            company_id=company.id,
            posted_by=admin.id,
        )
        session.add(job)
        await session.flush()
        candidate = Candidate(
            full_name="Jane Doe",
            email="jane.doe@example.com",
            summary="Experienced developer.",
            skills="Python,FastAPI,React",
            location="Remote",
            company_id=company.id,
        )
        session.add(candidate)
        await session.flush()
        application = Application(
            candidate_id=candidate.id,
            job_id=job.id,
            status="applied",
            created_by=admin.id,
        )
        session.add(application)
        await session.commit()
        print("✅ Seed data inserted")

if __name__ == "__main__":
    asyncio.run(main())
