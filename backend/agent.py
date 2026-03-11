"""
JSO Code Portfolio Evaluation Agent
LangGraph-based agent for analyzing GitHub repositories
"""

import os
import re
import json
import httpx
from typing import TypedDict, Annotated, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
import operator


# ─── State ────────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: Annotated[List, operator.add]
    github_url: str
    repo_data: Optional[dict]
    analysis_results: Optional[dict]
    final_score: Optional[dict]
    error: Optional[str]


# ─── GitHub Tools ─────────────────────────────────────────────────────────────

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

def github_headers():
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


@tool
def fetch_repo_metadata(repo_url: str) -> dict:
    """Fetch basic metadata about a GitHub repository."""
    # Parse owner/repo from URL
    match = re.search(r"github\.com/([^/]+)/([^/\s]+)", repo_url)
    if not match:
        return {"error": "Invalid GitHub URL"}
    owner, repo = match.group(1), match.group(2).rstrip("/")

    try:
        with httpx.Client(timeout=15) as client:
            r = client.get(
                f"https://api.github.com/repos/{owner}/{repo}",
                headers=github_headers()
            )
            if r.status_code != 200:
                return {"error": f"GitHub API error: {r.status_code}"}
            data = r.json()
            return {
                "name": data.get("name"),
                "description": data.get("description"),
                "language": data.get("language"),
                "stars": data.get("stargazers_count", 0),
                "forks": data.get("forks_count", 0),
                "open_issues": data.get("open_issues_count", 0),
                "size_kb": data.get("size", 0),
                "default_branch": data.get("default_branch", "main"),
                "created_at": data.get("created_at"),
                "updated_at": data.get("updated_at"),
                "topics": data.get("topics", []),
                "license": data.get("license", {}).get("name") if data.get("license") else None,
                "has_readme": True,  # will be verified below
                "owner": owner,
                "repo": repo,
            }
    except Exception as e:
        return {"error": str(e)}


@tool
def fetch_repo_languages(owner: str, repo: str) -> dict:
    """Fetch language breakdown of a GitHub repository."""
    try:
        with httpx.Client(timeout=15) as client:
            r = client.get(
                f"https://api.github.com/repos/{owner}/{repo}/languages",
                headers=github_headers()
            )
            return r.json() if r.status_code == 200 else {"error": str(r.status_code)}
    except Exception as e:
        return {"error": str(e)}


@tool
def fetch_repo_structure(owner: str, repo: str, branch: str = "main") -> dict:
    """Fetch the top-level file/folder structure of a GitHub repository."""
    try:
        with httpx.Client(timeout=15) as client:
            r = client.get(
                f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=0",
                headers=github_headers()
            )
            if r.status_code != 200:
                # Try master branch
                r = client.get(
                    f"https://api.github.com/repos/{owner}/{repo}/git/trees/master?recursive=0",
                    headers=github_headers()
                )
            if r.status_code != 200:
                return {"error": f"Could not fetch tree: {r.status_code}"}
            tree = r.json().get("tree", [])
            files = [item["path"] for item in tree if item["type"] == "blob"]
            folders = [item["path"] for item in tree if item["type"] == "tree"]
            return {
                "files": files[:50],
                "folders": folders[:30],
                "total_files": len(files),
                "total_folders": len(folders),
            }
    except Exception as e:
        return {"error": str(e)}


@tool
def fetch_readme(owner: str, repo: str) -> dict:
    """Fetch the README content of a GitHub repository."""
    try:
        with httpx.Client(timeout=15) as client:
            r = client.get(
                f"https://api.github.com/repos/{owner}/{repo}/readme",
                headers={**github_headers(), "Accept": "application/vnd.github.raw"}
            )
            if r.status_code == 200:
                content = r.text[:3000]  # Limit to 3000 chars
                return {"content": content, "length": len(r.text)}
            return {"content": None, "length": 0}
    except Exception as e:
        return {"error": str(e)}


@tool
def fetch_commits(owner: str, repo: str) -> dict:
    """Fetch recent commit activity and contributor info."""
    try:
        with httpx.Client(timeout=15) as client:
            r = client.get(
                f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=20",
                headers=github_headers()
            )
            if r.status_code != 200:
                return {"error": str(r.status_code)}
            commits = r.json()
            messages = [c.get("commit", {}).get("message", "")[:80] for c in commits[:20]]
            authors = list({c.get("commit", {}).get("author", {}).get("name", "Unknown") for c in commits})
            return {
                "recent_commit_messages": messages,
                "contributors": authors[:10],
                "commit_count_sample": len(commits),
            }
    except Exception as e:
        return {"error": str(e)}


# ─── LLM & Graph ──────────────────────────────────────────────────────────────

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

SYSTEM_PROMPT = """You are the JSO Code Portfolio Evaluation Agent — an expert AI system that analyzes GitHub repositories to help recruiters assess technical candidates fairly and transparently.

Your goal: produce a structured, unbiased portfolio evaluation with:
1. A score out of 100 (broken into sub-scores)
2. Strengths identified in the codebase
3. Concrete, actionable improvement recommendations
4. A plain-English summary suitable for HR consultants

Evaluation dimensions:
- Code Quality (25 pts): readability, structure, naming, comments
- Project Complexity (25 pts): architecture, features, tech stack depth
- Documentation (20 pts): README quality, inline docs, setup instructions
- Maintenance & Activity (15 pts): commit frequency, issue handling, branch strategy
- Professional Standards (15 pts): license, CI/CD, tests, security practices

Always be fair, constructive, and specific. Never penalize for language choice or unconventional approaches — evaluate execution quality.

When you have gathered enough data using the available tools, produce a final JSON evaluation in this exact format:
```json
{
  "repo_name": "...",
  "overall_score": 0-100,
  "grade": "A/B/C/D/F",
  "sub_scores": {
    "code_quality": 0-25,
    "project_complexity": 0-25,
    "documentation": 0-20,
    "maintenance_activity": 0-15,
    "professional_standards": 0-15
  },
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "recruiter_summary": "2-3 sentence plain English summary",
  "tech_stack": ["..."],
  "recommendation": "Strong Hire / Consider / Needs Development"
}
```
"""

tools = [fetch_repo_metadata, fetch_repo_languages, fetch_repo_structure, fetch_readme, fetch_commits]

def get_llm():
    return ChatOpenAI(
        model="gpt-4o",
        api_key=OPENAI_API_KEY,
        temperature=0.2,
    ).bind_tools(tools)


def agent_node(state: AgentState):
    llm = get_llm()
    messages = state["messages"]
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
    response = llm.invoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState):
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return "parse_results"


def parse_results_node(state: AgentState):
    """Extract the JSON evaluation from the final AI message."""
    last_msg = state["messages"][-1]
    content = last_msg.content if hasattr(last_msg, "content") else ""
    
    # Try to extract JSON block
    json_match = re.search(r"```json\s*([\s\S]+?)\s*```", content)
    if json_match:
        try:
            data = json.loads(json_match.group(1))
            return {"final_score": data}
        except json.JSONDecodeError:
            pass
    
    # Try raw JSON
    try:
        data = json.loads(content)
        return {"final_score": data}
    except Exception:
        pass
    
    return {"final_score": {"error": "Could not parse evaluation", "raw": content[:500]}}


def build_graph():
    graph = StateGraph(AgentState)
    tool_node = ToolNode(tools)

    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.add_node("parse_results", parse_results_node)

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue, {
        "tools": "tools",
        "parse_results": "parse_results",
    })
    graph.add_edge("tools", "agent")
    graph.add_edge("parse_results", END)

    return graph.compile()


# ─── Public API ───────────────────────────────────────────────────────────────

def evaluate_repository(github_url: str) -> dict:
    """Main entry point: evaluate a GitHub repository."""
    graph = build_graph()
    initial_state = {
        "messages": [
            HumanMessage(
                content=f"""Please evaluate this GitHub repository for a technical candidate: {github_url}

Use the available tools to:
1. Fetch repository metadata
2. Get language breakdown  
3. Examine folder/file structure
4. Read the README
5. Check recent commits

Then provide a complete structured evaluation in the specified JSON format."""
            )
        ],
        "github_url": github_url,
        "repo_data": None,
        "analysis_results": None,
        "final_score": None,
        "error": None,
    }
    
    result = graph.invoke(initial_state)
    return result.get("final_score", {"error": "No result produced"})


if __name__ == "__main__":
    import sys
    url = sys.argv[1] if len(sys.argv) > 1 else "https://github.com/tiangolo/fastapi"
    result = evaluate_repository(url)
    print(json.dumps(result, indent=2))
