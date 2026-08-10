from langchain_groq import ChatGroq
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


def get_llm(temperature: float = 0.3, max_tokens: int = 4096) -> ChatGroq:
    """Initialize and return a ChatGroq LLM instance."""
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama-3.3-70b-versatile",
        temperature=temperature,
        max_tokens=max_tokens,
    )
    logger.info("Initialized ChatGroq LLM with llama-3.3-70b-versatile")
    return llm
