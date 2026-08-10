import json
from pathlib import Path

import pdfplumber

from app.ai.llm import get_llm
from app.ai.prompts import RESUME_PARSER_PROMPT
from app.core.logging import get_logger

logger = get_logger(__name__)


async def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text content from a PDF file."""
    text_parts: list[str] = []
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    full_text = "\n".join(text_parts)
    if not full_text.strip():
        raise ValueError("Could not extract any text from the PDF.")

    logger.info(f"Extracted {len(full_text)} characters from {file_path}")
    return full_text


async def parse_resume(file_path: str) -> dict:
    """Parse a resume PDF and extract structured data using AI."""
    resume_text = await extract_text_from_pdf(file_path)

    llm = get_llm(temperature=0.1)
    prompt = RESUME_PARSER_PROMPT.format(resume_text=resume_text)

    logger.info("Sending resume to AI for parsing...")
    response = await llm.ainvoke(prompt)
    response_text = response.content.strip()

    # Clean up response - remove markdown code blocks if present
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        response_text = "\n".join(lines)

    try:
        parsed_data = json.loads(response_text)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse AI response as JSON: {response_text[:200]}")
        parsed_data = {
            "full_name": None,
            "email": None,
            "phone": None,
            "skills": [],
            "experience": None,
            "education": None,
            "projects": None,
            "certifications": None,
            "languages": [],
            "linkedin": None,
            "github": None,
            "portfolio": None,
        }

    logger.info(f"Parsed resume for: {parsed_data.get('full_name', 'Unknown')}")
    return parsed_data
