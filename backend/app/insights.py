from sqlalchemy.orm import Session

from app.analytics import get_admin_analytics
from app.llm import get_llm
from langchain_core.prompts import ChatPromptTemplate


def generate_admin_insights(
    db: Session,
    organization_id: int,
    days: int = 30,
):
    analytics = get_admin_analytics(
        db=db,
        organization_id=organization_id,
        days=days,
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",

                """
You are an enterprise analytics assistant for DocMind AI.

Analyze the organization's usage analytics provided below.

Your job is to identify useful observations about:
- overall usage
- employee activity
- model usage
- token consumption
- estimated LLM cost
- latency
- usage trends

IMPORTANT RULES:
1. Use ONLY the analytics data provided.
2. Do not invent numbers or facts.
3. Do not make assumptions about employees.
4. Do not expose private questions or document contents.
5. Clearly distinguish observations from recommendations.
6. Keep the response concise and useful for an organization administrator.

Return the result using exactly these sections:

## Usage Overview
Brief summary of overall usage.

## Employee Activity
Describe notable usage patterns across users.

## Cost & Token Usage
Describe token consumption and estimated LLM cost.

## Performance
Describe latency and any notable performance observations.

## Recommendations
Give 2-3 practical recommendations based only on the provided analytics.

Analytics:
{analytics}
""",
            ),
            (
                "human",
                "Generate the organization's AI insights.",
            ),
        ]
    )

    chain = prompt | get_llm()

    response = chain.invoke(
        {
            "analytics": analytics,
        }
    )

    content = response.content

    if isinstance(content, list):
        content = "\n".join(
        item.get("text", "")
        for item in content
        if isinstance(item, dict)
    )

    return {
    "period_days": days,
    "insights": content,
}