from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)

from app.langchain.retriever import retrieve_documents
from app.llm import get_rag_chain


def build_rag_chain(
    db,
    document_id: int,
    organization_id: int,
    top_k: int = 5,
):

    # -----------------------------------------
    # 1. Retrieve LangChain Documents
    # -----------------------------------------

    def retrieve(question: str):

        documents = retrieve_documents(
            query=question,
            document_id=document_id,
            organization_id=organization_id,
            db=db,
            top_k=top_k,
        )

        return documents

    retriever = RunnableLambda(retrieve)

    # -----------------------------------------
    # 2. Convert Documents into Context
    # -----------------------------------------

    def format_documents(documents):

        return "\n\n".join(
            f"[Chunk {doc.metadata['chunk_index']}]\n"
            f"{doc.page_content}"
            for doc in documents
        )


    # -----------------------------------------
    # 3. Complete LangChain RAG Pipeline
    # -----------------------------------------

    rag_chain = (
        RunnableParallel(
            documents=retriever,
            question=RunnablePassthrough(),
        )
        .assign(
            context=lambda x: format_documents(
                x["documents"]
            )
        )
        .assign(
            response=get_rag_chain()
        )
        | RunnableLambda(build_result)
    )
    return rag_chain


# -----------------------------------------
# Extract text from Gemini response
# -----------------------------------------

def build_result(x):
    response = x["response"]

    return {
        "answer": extract_text(response),
        "sources": [
            {
                "chunk_index": doc.metadata["chunk_index"],
                "similarity": doc.metadata["similarity"],
            }
            for doc in x["documents"]
        ],
        "usage_metadata": getattr(response, "usage_metadata", {}),
        "response_metadata": getattr(response, "response_metadata", {}),
    }


def extract_text(response):
    content = response.content

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        text_parts = []

        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    text_parts.append(block.get("text", ""))

        return "".join(text_parts)

    return str(content)