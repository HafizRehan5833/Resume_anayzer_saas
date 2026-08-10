import json

from app.ai.llm import get_llm
from app.ai.prompts import CANDIDATE_MATCH_PROMPT
from app.core.logging import get_logger

logger = get_logger(__name__)


async def match_candidate_to_job(
    candidate_profile: str, job_description: str
) -> dict:
    """Match a candidate profile against a job description using AI."""
    llm = get_llm(temperature=0.2)
    prompt = CANDIDATE_MATCH_PROMPT.format(
        candidate_profile=candidate_profile,
        job_description=job_description,
    )

    logger.info("Sending candidate-job match request to AI...")
    response = await llm.ainvoke(prompt)
    response_text = response.content.strip()

    # Clean up response
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        response_text = "\n".join(lines)

    try:
        match_data = json.loads(response_text)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse match response: {response_text[:200]}")
        match_data = {
            "match_score": 0.0,
            "strengths": [],
            "weaknesses": ["Unable to analyze - AI parsing error"],
            "missing_skills": [],
            "recommendation": "Unable to generate recommendation due to parsing error.",
        }

    logger.info(f"Match score: {match_data.get('match_score', 0)}")
    return match_data
