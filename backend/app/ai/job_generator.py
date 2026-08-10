import json

from app.ai.llm import get_llm
from app.ai.prompts import JOB_DESCRIPTION_PROMPT
from app.core.logging import get_logger

logger = get_logger(__name__)


async def generate_job_description(
    title: str, experience: str, skills: list[str], location: str
) -> dict:
    """Generate a professional job description using AI."""
    llm = get_llm(temperature=0.5)
    prompt = JOB_DESCRIPTION_PROMPT.format(
        title=title,
        experience=experience,
        skills=", ".join(skills),
        location=location,
    )

    logger.info(f"Generating job description for: {title}")
    response = await llm.ainvoke(prompt)
    response_text = response.content.strip()

    # Clean up response
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        response_text = "\n".join(lines)

    try:
        job_data = json.loads(response_text)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse job description response: {response_text[:200]}")
        job_data = {
            "title": title,
            "description": f"We are looking for a {title} with {experience} of experience.",
            "requirements": skills,
            "responsibilities": [f"Work with {s}" for s in skills],
            "benefits": ["Competitive salary", "Health insurance", "Remote work options"],
        }

    logger.info(f"Job description generated for: {title}")
    return job_data
