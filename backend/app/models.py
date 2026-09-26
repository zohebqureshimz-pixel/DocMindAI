from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import VECTOR

from app.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    users: Mapped[list["User"]] = relationship(
        back_populates="organization"
    )

    documents: Mapped[list["Document"]] = relationship(
    back_populates="organization"
)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    organization_user_id: Mapped[int] = mapped_column(
        nullable=False
    )

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default="EMPLOYEE",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    organization: Mapped["Organization"] = relationship(
        back_populates="users"
    )

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id"),
        nullable=False,
        index=True
    )

    uploaded_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    storage_key: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="UPLOADED",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    organization: Mapped["Organization"] = relationship(
    back_populates="documents"
)

    uploader: Mapped["User"] = relationship()


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id"),
        nullable=False,
        index=True
    )

    chunk_index: Mapped[int] = mapped_column(nullable=False)

    content: Mapped[str] = mapped_column(String, nullable=False)

    embedding: Mapped[list[float] | None] = mapped_column(
    VECTOR(3072),
    nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    document: Mapped["Document"] = relationship()


class AIRequest(Base):
    __tablename__ = "ai_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id"),
        nullable=False,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id"),
        nullable=False,
        index=True
    )

    question: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    model: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    input_tokens: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )

    output_tokens: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )

    total_tokens: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )

    estimated_cost: Mapped[float] = mapped_column(
        default=0.0,
        nullable=False
    )

    latency: Mapped[float] = mapped_column(
        default=0.0,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="SUCCESS",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )    