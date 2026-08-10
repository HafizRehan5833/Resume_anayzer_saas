from langchain_core.messages import HumanMessage

from app.ai.graph import get_recruitment_graph
from app.core.logging import get_logger

logger = get_logger(__name__)


async def run_recruitment_agent(user_message: str) -> str:
    """Run the recruitment AI agent with a user message and return the response."""
    graph = get_recruitment_graph()

    logger.info(f"Agent processing: {user_message[:100]}...")

    result = await graph.ainvoke(
        {"messages": [HumanMessage(content=user_message)]}
    )

    # Extract the final response from the last AI message
    messages = result["messages"]
    for message in reversed(messages):
        if hasattr(message, "content") and message.content and not hasattr(message, "tool_calls"):
            response = message.content
            logger.info(f"Agent response: {response[:100]}...")
            return response
        if hasattr(message, "content") and message.content and hasattr(message, "tool_calls") and not message.tool_calls:
            response = message.content
            logger.info(f"Agent response: {response[:100]}...")
            return response

    # Fallback - return the last message content
    last_message = messages[-1]
    response = last_message.content if hasattr(last_message, "content") else "I couldn't process your request."
    logger.info(f"Agent fallback response: {response[:100]}...")
    return response
