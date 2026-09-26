from pathlib import Path
import uuid
from fastapi import Query
from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
    BackgroundTasks,
)
from app.analytics import (
    log_ai_request,
    get_admin_analytics,
)

from sqlalchemy.orm import Session
from app.insights import generate_admin_insights

from app.database import get_db
from app.storage import supabase
from app.documents_processor import process_document

from app.langchain.retriever import retrieve_documents
from app.rag import answer_question
from app.analytics import log_ai_request
from app.models import Organization, User, Document

from app.schemas import (
    RegisterRequest,
    EmployeeCreateRequest,
    EmployeeResponse,
    UserResponse,
    LoginRequest,
    TokenResponse,
    DocumentResponse,
    SearchRequest,
    AskRequest,
)

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin,
)

from fastapi.middleware.cors import CORSMiddleware



# --------------------------------------------------
# Configuration
# --------------------------------------------------

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="DocMind AI",
    description="Enterprise Document Intelligence Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "DocMind AI API is running 🚀"
    }


# --------------------------------------------------
# Authentication
# --------------------------------------------------

@app.post("/auth/register", response_model=UserResponse)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):

    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    organization = Organization(
        name=data.organization_name
    )

    db.add(organization)
    db.flush()

    user = User(
        organization_user_id=1,
        organization_id=organization.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="ADMIN",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@app.post("/auth/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        user_id=user.id,
        organization_id=user.organization_id,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

# --------------------------------------------------
# Employee Management
# --------------------------------------------------

@app.post("/users/employees", response_model=EmployeeResponse)
def create_employee(
    data: EmployeeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # Make sure the email isn't already registered
    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # Find the next user ID within this organization
    last_user = (
        db.query(User)
        .filter(
            User.organization_id == current_user.organization_id
        )
        .order_by(User.organization_user_id.desc())
        .first()
    )

    next_organization_user_id = (
        last_user.organization_user_id + 1
        if last_user
        else 1
    )

    employee = User(
        organization_id=current_user.organization_id,
        organization_user_id=next_organization_user_id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="EMPLOYEE",
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee

@app.get("/users/employees", response_model=list[EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    employees = (
        db.query(User)
        .filter(
            User.organization_id == current_user.organization_id,
            User.role == "EMPLOYEE",
        )
        .order_by(User.organization_user_id.asc())
        .all()
    )

    return employees


# --------------------------------------------------
# User
# --------------------------------------------------

@app.get(
    "/users/me",
    response_model=UserResponse,
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


# --------------------------------------------------
# Admin
# --------------------------------------------------

@app.get("/admin/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_admin),
):

    return {
        "message": "Welcome to the Admin Dashboard",
        "user": current_user.name,
        "organization_id": current_user.organization_id,
    }


# --------------------------------------------------
# Documents
# --------------------------------------------------

@app.post(
    "/documents",
    response_model=DocumentResponse,
)
def create_document(
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    document = Document(
        organization_id=current_user.organization_id,
        uploaded_by=current_user.id,
        filename=filename,
        storage_key=(
            f"documents/"
            f"{current_user.organization_id}/"
            f"{filename}"
        ),
        status="UPLOADED",
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@app.get(
    "/documents",
    response_model=list[DocumentResponse],
)
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    documents = (
        db.query(Document)
        .filter(
            Document.organization_id
            == current_user.organization_id
        )
        .all()
    )

    return documents


# --------------------------------------------------
# Document Upload
# --------------------------------------------------

@app.post(
    "/documents/upload",
    response_model=DocumentResponse,
)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )

    safe_filename = Path(file.filename).name

    unique_filename = (
        f"{uuid.uuid4()}_{safe_filename}"
    )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10 MB",
        )

    storage_path = (
        f"{current_user.organization_id}/"
        f"{current_user.id}/"
        f"{unique_filename}"
    )

    try:

        # ------------------------------------------
        # Upload PDF to Supabase Storage
        # ------------------------------------------

        supabase.storage.from_("Documents").upload(
            storage_path,
            contents,
            {
                "content-type": "application/pdf"
            },
        )

        # ------------------------------------------
        # Create database record
        # ------------------------------------------

        document = Document(
            organization_id=current_user.organization_id,
            uploaded_by=current_user.id,
            filename=safe_filename,
            storage_key=storage_path,
            status="UPLOADED",
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        # ------------------------------------------
        # Mark as processing
        # ------------------------------------------

        document.status = "PROCESSING"
        db.commit()

        # ------------------------------------------
        # Background LangChain processing
        # ------------------------------------------

        background_tasks.add_task(
            process_document,
            document.id,
            document.storage_key,
        )

        return document

    except Exception:

        db.rollback()

        # Remove uploaded file if necessary
        try:

            supabase.storage.from_(
                "Documents"
            ).remove(
                [storage_path]
            )

        except Exception:
            pass

        raise HTTPException(
            status_code=500,
            detail="Failed to upload document",
        )


# --------------------------------------------------
# Semantic Search
# --------------------------------------------------

@app.post("/search")
def search_documents(
    data: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    documents = retrieve_documents(
        query=data.query,
        document_id=data.document_id,
        organization_id=current_user.organization_id,
        db=db,
        top_k=data.top_k,
    )

    return [
        {
            "chunk_index": document.metadata["chunk_index"],
            "content": document.page_content,
            "similarity": document.metadata["similarity"],
        }
        for document in documents
    ]


# --------------------------------------------------
# LangChain RAG Question Answering
# --------------------------------------------------

@app.post("/ask")
def ask_question(
    data: AskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = answer_question(
        question=data.question,
        document_id=data.document_id,
        organization_id=current_user.organization_id,
        db=db,
        top_k=data.top_k
    )

    log_ai_request(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        document_id=data.document_id,
        question=data.question,
        result=result,
    )

    return result

@app.get("/admin/analytics")
def admin_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_analytics(
        db=db,
        organization_id=current_user.organization_id,
        days=days,
    )

@app.get("/admin/insights")
def admin_insights(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    print("INSIGHTS ROUTE USER:", current_user.id)
    print("INSIGHTS ORGANIZATION:", current_user.organization_id)

    return generate_admin_insights(
        db=db,
        organization_id=current_user.organization_id,
        days=days,
    )