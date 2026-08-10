from typing import TypedDict, Annotated, Sequence
import operator

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.ai.llm import get_llm
from app.ai.tools import ALL_TOOLS
from app.ai.prompts import AGENT_SYSTEM_PROMPT
from app.core.logging import get_logger

logger = get_logger(__name__)


class AgentState(TypedDict):
    """State schema for the recruitment agent graph."""
    messages: Annotated[Sequence[BaseMessage], operator.add]


def should_continue(state: AgentState) -> str:
    """Determine whether the agent should continue to tools or end."""
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END


def create_agent_graph():
    """Create and compile the LangGraph recruitment agent."""
    llm = get_llm(temperature=0.3, max_tokens=4096)
    llm_with_tools = llm.bind_tools(ALL_TOOLS)

    async def agent_node(state: AgentState) -> dict:
        """The main agent node that processes messages and decides actions."""
        messages = state["messages"]
        # Ensure system prompt is at the beginning
        if not any(isinstance(m, SystemMessage) for m in messages):
            messages = [SystemMessage(content=AGENT_SYSTEM_PROMPT)] + list(messages)

        response = await llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    # Build the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", ToolNode(ALL_TOOLS))

    # Set entry point
    workflow.set_entry_point("agent")

    # Add conditional edges
    workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    workflow.add_edge("tools", "agent")

    # Compile
    graph = workflow.compile()
    logger.info("LangGraph recruitment agent compiled successfully.")
    return graph


# Singleton compiled graph
recruitment_graph = None


def get_recruitment_graph():
    """Get or create the recruitment agent graph singleton."""
    global recruitment_graph
    if recruitment_graph is None:
        recruitment_graph = create_agent_graph()
    return recruitment_graph
