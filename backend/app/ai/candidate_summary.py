import json

from app.ai.llm import get_llm
from app.ai.prompts import CANDIDATE_SUMMARY_PROMPT
from app.core.logging import get_logger

logger = get_logger(__name__)


async def generate_candidate_summary(candidate_info: str) -> dict:
    """Generate a professional summary of a candidate using AI."""
    llm = get_llm(temperature=0.3)
    prompt = CANDIDATE_SUMMARY_PROMPT.format(candidate_info=candidate_info)

    logger.info("Generating candidate summary with AI...")
    response = await llm.ainvoke(prompt)
    response_text = response.content.strip()

    # Clean up response
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        response_text = "\n".join(lines)

    try:
        summary_data = json.loads(response_text)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse summary response: {response_text[:200]}")
        summary_data = {
            "professional_summary": "Unable to generate summary.",
            "key_skills": [],
            "experience_summary": "Unable to generate experience summary.",
            "hiring_recommendation": "Unable to generate recommendation.",
        }

    logger.info("Candidate summary generated successfully.")
    return summary_data
