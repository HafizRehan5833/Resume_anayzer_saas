import json
from langchain_core.tools import tool

from app.ai.resume_parser import parse_resume
from app.ai.candidate_matcher import match_candidate_to_job
from app.ai.candidate_summary import generate_candidate_summary
from app.ai.interview_questions import generate_interview_questions
from app.ai.job_generator import generate_job_description
from app.core.logging import get_logger

logger = get_logger(__name__)


@tool
async def resume_parser_tool(file_path: str) -> str:
    """Parse a resume PDF file and extract structured candidate information.
    Use this tool when the user wants to parse, analyze, or extract data from a resume.
    Input should be the file path to a PDF resume.
    """
    logger.info(f"Tool: Parsing resume at {file_path}")
    result = await parse_resume(file_path)
    return json.dumps(result, indent=2)


@tool
async def candidate_search_tool(query: str) -> str:
    """Search for candidates based on skills, experience, or other criteria.
    Use this tool when the user wants to find or search for candidates.
    Input should be a search query describing the candidates to find.
    Returns instructions for the database search.
    """
    logger.info(f"Tool: Searching candidates with query: {query}")
    return json.dumps({
        "action": "candidate_search",
        "query": query,
        "message": f"To find candidates matching '{query}', use the candidate search API with the relevant skill or keyword filters. "
        f"You can search by skills, location, or name through the /api/v1/candidates endpoint with search parameters."
    })


@tool
async def candidate_summary_tool(candidate_info: str) -> str:
    """Generate a professional summary for a candidate.
    Use this tool when the user wants to summarize a candidate's profile.
    Input should be the candidate's profile information as text.
    """
    logger.info("Tool: Generating candidate summary")
    result = await generate_candidate_summary(candidate_info)
    return json.dumps(result, indent=2)


@tool
async def job_matcher_tool(candidate_profile: str, job_description: str) -> str:
    """Match a candidate against a job description and return a compatibility score.
    Use this tool when the user wants to match or compare a candidate to a job.
    Inputs should be the candidate profile and job description as text.
    """
    logger.info("Tool: Matching candidate to job")
    result = await match_candidate_to_job(candidate_profile, job_description)
    return json.dumps(result, indent=2)


@tool
async def interview_question_tool(candidate_profile: str, job_requirements: str) -> str:
    """Generate tailored interview questions for a candidate.
    Use this tool when the user wants to create or generate interview questions.
    Inputs should be the candidate profile and job requirements as text.
    """
    logger.info("Tool: Generating interview questions")
    result = await generate_interview_questions(candidate_profile, job_requirements)
    return json.dumps(result, indent=2)


@tool
async def job_generator_tool(title: str, experience: str, skills: str, location: str) -> str:
    """Generate a professional job description.
    Use this tool when the user wants to create or generate a job description or job posting.
    Inputs should be the job title, required experience, skills (comma-separated), and location.
    """
    logger.info(f"Tool: Generating job description for {title}")
    skills_list = [s.strip() for s in skills.split(",")]
    result = await generate_job_description(title, experience, skills_list, location)
    return json.dumps(result, indent=2)


@tool
async def database_search_tool(search_type: str, query: str) -> str:
    """Search the database for candidates or jobs.
    Use this tool when the user wants to look up information in the database.
    search_type should be 'candidates' or 'jobs'.
    query should describe what to search for.
    """
    logger.info(f"Tool: Database search - type={search_type}, query={query}")
    return json.dumps({
        "action": "database_search",
        "search_type": search_type,
        "query": query,
        "message": f"To search {search_type} for '{query}', use the /api/v1/{search_type} endpoint with search parameters. "
        f"This tool helps route your request to the correct API endpoint."
    })


# List of all available tools for the agent
ALL_TOOLS = [
    resume_parser_tool,
    candidate_search_tool,
    candidate_summary_tool,
    job_matcher_tool,
    interview_question_tool,
    job_generator_tool,
    database_search_tool,
]
