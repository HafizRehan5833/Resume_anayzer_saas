import json

from app.ai.llm import get_llm
from app.ai.prompts import INTERVIEW_QUESTIONS_PROMPT
from app.core.logging import get_logger

logger = get_logger(__name__)


async def generate_interview_questions(
    candidate_profile: str, job_requirements: str
) -> dict:
    """Generate tailored interview questions using AI."""
    llm = get_llm(temperature=0.4)
    prompt = INTERVIEW_QUESTIONS_PROMPT.format(
        candidate_profile=candidate_profile,
        job_requirements=job_requirements,
    )

    logger.info("Generating interview questions with AI...")
    response = await llm.ainvoke(prompt)
    response_text = response.content.strip()

    # Clean up response
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        response_text = "\n".join(lines)

    try:
        questions_data = json.loads(response_text)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse questions response: {response_text[:200]}")
        questions_data = {
            "technical_questions": ["Tell us about your technical experience."],
            "hr_questions": ["Why are you interested in this role?"],
            "behavioral_questions": ["Describe a challenging situation you faced."],
        }

    logger.info("Interview questions generated successfully.")
    return questions_data
