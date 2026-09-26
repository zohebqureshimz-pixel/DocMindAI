from sqlalchemy.orm import Session
from langchain_core.documents import Document

from app.models import Document as DBDocument, DocumentChunk
from app.langchain.embeddings import get_embedding_model
import time

def retrieve_documents(
    query: str,
    document_id: int,
    organization_id: int,
    db: Session,
    top_k: int = 5,
):
    start = time.perf_counter()

    document = (
        db.query(DBDocument)
        .filter(
            DBDocument.id == document_id,
            DBDocument.organization_id == organization_id,
        )
        .first()
    )

    if document is None:
        return []

    print(f"DB document check: {time.perf_counter() - start:.3f}s")

    embedding_start = time.perf_counter()

    embedding_model = get_embedding_model()
    query_embedding = embedding_model.embed_query(query)

    print(
        f"Query embedding: "
        f"{time.perf_counter() - embedding_start:.3f}s"
    )

    retrieval_start = time.perf_counter()

    results = (
        db.query(
            DocumentChunk,
            (
                1 - DocumentChunk.embedding.cosine_distance(
                    query_embedding
                )
            ).label("similarity"),
        )
        .filter(DocumentChunk.document_id == document_id)
        .order_by(
            DocumentChunk.embedding.cosine_distance(query_embedding)
        )
        .limit(top_k)
        .all()
    )

    print(
        f"Vector retrieval: "
        f"{time.perf_counter() - retrieval_start:.3f}s"
    )

    documents = []

    for chunk, similarity in results:
        documents.append(
            Document(
                page_content=chunk.content,
                metadata={
                    "chunk_index": chunk.chunk_index,
                    "similarity": float(similarity),
                    "document_id": chunk.document_id,
                },
            )
        )

    print(
        f"Total retrieval: "
        f"{time.perf_counter() - start:.3f}s"
    )

    return documents