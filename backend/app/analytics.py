from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import AIRequest

# Gemini 3.6 Flash Standard pricing
INPUT_PRICE_PER_MILLION = 0.75
OUTPUT_PRICE_PER_MILLION = 3.75


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
) -> float:
    input_cost = (
        input_tokens / 1_000_000
    ) * INPUT_PRICE_PER_MILLION

    output_cost = (
        output_tokens / 1_000_000
    ) * OUTPUT_PRICE_PER_MILLION

    return input_cost + output_cost


def log_ai_request(
    db: Session,
    organization_id: int,
    user_id: int,
    document_id: int,
    question: str,
    result: dict,
):
    usage = result.get("usage_metadata") or {}
    response_metadata = result.get("response_metadata") or {}

    input_tokens = usage.get("input_tokens", 0) or 0
    output_tokens = usage.get("output_tokens", 0) or 0
    total_tokens = usage.get("total_tokens", 0) or 0

    model = response_metadata.get(
        "model_name",
        "unknown"
    )

    latency = result.get("latency", 0) or 0

    estimated_cost = calculate_cost(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
    )

    ai_request = AIRequest(
        organization_id=organization_id,
        user_id=user_id,
        document_id=document_id,
        question=question,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        estimated_cost=estimated_cost,
        latency=latency,
        status="SUCCESS",
    )

    db.add(ai_request)
    db.commit()

    return ai_request


def get_admin_analytics(
    db: Session,
    organization_id: int,
    days: int = 30,
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    stats = (
        db.query(
            func.count(AIRequest.id).label("total_requests"),
            func.coalesce(
                func.sum(AIRequest.input_tokens), 0
            ).label("total_input_tokens"),
            func.coalesce(
                func.sum(AIRequest.output_tokens), 0
            ).label("total_output_tokens"),
            func.coalesce(
                func.sum(AIRequest.total_tokens), 0
            ).label("total_tokens"),
            func.coalesce(
                func.sum(AIRequest.estimated_cost), 0.0
            ).label("total_estimated_cost"),
            func.coalesce(
                func.avg(AIRequest.latency), 0.0
            ).label("average_latency"),
        )
        .filter(
    AIRequest.organization_id == organization_id,
    AIRequest.created_at >= cutoff,
)
        .first()
    )

    model_stats = (
        db.query(
            AIRequest.model,
            func.count(AIRequest.id).label("requests"),
            func.coalesce(
                func.sum(AIRequest.total_tokens), 0
            ).label("total_tokens"),
            func.coalesce(
                func.sum(AIRequest.estimated_cost), 0.0
            ).label("estimated_cost"),
        )
        .filter(
    AIRequest.organization_id == organization_id,
    AIRequest.created_at >= cutoff,
)
        .group_by(AIRequest.model)
        .all()
    )

    user_stats = (
        db.query(
            AIRequest.user_id,
            func.count(AIRequest.id).label("requests"),
            func.coalesce(
                func.sum(AIRequest.total_tokens), 0
            ).label("total_tokens"),
            func.coalesce(
                func.sum(AIRequest.estimated_cost), 0.0
            ).label("estimated_cost"),
        )
        .filter(
    AIRequest.organization_id == organization_id,
    AIRequest.created_at >= cutoff,
)
        .group_by(AIRequest.user_id)
        .all()
    )

    daily_stats = (
    db.query(
        func.date(AIRequest.created_at).label("date"),
        func.count(AIRequest.id).label("requests"),
        func.coalesce(func.sum(AIRequest.total_tokens), 0).label("total_tokens"),
        func.coalesce(func.sum(AIRequest.estimated_cost), 0.0).label("estimated_cost"),
        func.coalesce(func.avg(AIRequest.latency), 0.0).label("average_latency"),
    )
    .filter(
        AIRequest.organization_id == organization_id,
        AIRequest.created_at >= cutoff,
    )
    .group_by(func.date(AIRequest.created_at))
    .order_by(func.date(AIRequest.created_at))
    .all()
)

    return {
        "total_requests": stats.total_requests,
        "total_input_tokens": stats.total_input_tokens,
        "total_output_tokens": stats.total_output_tokens,
        "total_tokens": stats.total_tokens,
        "total_estimated_cost": round(
            float(stats.total_estimated_cost), 8
        ),
        "average_latency": round(
            float(stats.average_latency), 2
        ),
        "requests_by_model": [
            {
                "model": row.model,
                "requests": row.requests,
                "total_tokens": row.total_tokens,
                "estimated_cost": round(
                    float(row.estimated_cost), 8
                ),
            }
            for row in model_stats
        ],
        "daily_stats": [
    {
        "date": str(row.date),
        "requests": row.requests,
        "total_tokens": row.total_tokens,
        "estimated_cost": round(float(row.estimated_cost), 8),
        "average_latency": round(float(row.average_latency), 2),
    }
    for row in daily_stats
],
        "requests_by_user": [
            {
                "user_id": row.user_id,
                "requests": row.requests,
                "total_tokens": row.total_tokens,
                "estimated_cost": round(
                    float(row.estimated_cost), 8
                ),
            }
            for row in user_stats
        ],
    }