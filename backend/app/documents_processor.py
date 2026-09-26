import os
import tempfile

from sqlalchemy.orm import Session

from app.storage import supabase
from app.database import SessionLocal
from app.models import DocumentChunk

from app.langchain.document_loader import load_pdf
from app.langchain.spilitter import split_documents
from app.langchain.embeddings import get_embedding_model
from app.models import Document, DocumentChunk

def process_document(document_id: int, storage_path: str):
    print(f"Processing document {document_id}...")

    pdf_bytes = (
        supabase.storage
        .from_("Documents")
        .download(storage_path)
    )

    with tempfile.NamedTemporaryFile(
        suffix=".pdf",
        delete=False
    ) as temp_file:
        temp_file.write(pdf_bytes)
        temp_path = temp_file.name

    db: Session = SessionLocal()

    try:
        # 1. Load PDF using LangChain
        documents = load_pdf(temp_path)

        print(
            f"Document {document_id}: "
            f"loaded {len(documents)} pages"
        )

        # 2. Split documents using LangChain
        chunks = split_documents(documents)

        print(
            f"Document {document_id}: "
            f"created {len(chunks)} chunks"
        )

        # 3. Extract chunk text
        chunk_texts = [
            chunk.page_content
            for chunk in chunks
        ]

        # 4. Generate embeddings using LangChain
        embedding_model = get_embedding_model()

        embeddings = embedding_model.embed_documents(
            chunk_texts
        )

        print(
            f"Document {document_id}: "
            f"generated {len(embeddings)} embeddings"
        )

        # 5. Save chunks + embeddings
        for index, (chunk, embedding) in enumerate(
            zip(chunks, embeddings)
        ):
            document_chunk = DocumentChunk(
                document_id=document_id,
                chunk_index=index,
                content=chunk.page_content,
                embedding=embedding
            )

            db.add(document_chunk)

        db.commit()

        print(
            f"Document {document_id}: "
            f"saved {len(chunk_texts)} chunks with embeddings"
        )

        db.commit()

        document = db.query(Document).filter(
        Document.id == document_id
        ).first()

        if document:
           document.status = "READY"
           db.commit()

        # Show first 3 chunks for testing
        for i, chunk in enumerate(chunks[:3], start=1):
            print(f"\n--- Chunk {i} ---")
            print(chunk.page_content[:500])

    except Exception as e:
        db.rollback()

        print(
            f"Document {document_id} processing failed:"
        )
        print(e)

        raise

    finally:
        db.close()
        os.remove(temp_path)

    print(
        f"Document {document_id} processing completed."
    )