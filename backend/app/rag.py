import time

from sqlalchemy.orm import Session

from app.langchain.rag_chain import build_rag_chain


def answer_question(
    question: str,
    document_id: int,
    organization_id: int,
    db: Session,
    top_k: int = 5,
):
    chain = build_rag_chain(
        db=db,
        document_id=document_id,
        organization_id=organization_id,
        top_k=top_k,
    )

    start_time = time.perf_counter()

    result = chain.invoke(question)

    latency = time.perf_counter() - start_time

    print("\n========== AI USAGE ==========")
    print(f"Latency: {latency:.2f} seconds")
    print(f"Usage: {result.get('usage_metadata', {})}")
    print(f"Model: {result.get('response_metadata', {}).get('model_name')}")
    print("==============================\n")

    result["latency"] = latency

    return result