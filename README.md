\# DocMind AI



\## Enterprise Document Intelligence Platform



DocMind AI is an enterprise-focused document intelligence platform that allows organizations to securely upload documents, process them through a Retrieval-Augmented Generation (RAG) pipeline, and ask questions about their internal knowledge.



The platform is designed around \*\*multi-tenancy, role-based access control, document processing, RAG, analytics, and AI-powered insights\*\*.



\---



\## 🚀 Features



\### 🔐 Authentication \& Authorization



\- User registration and login

\- JWT-based authentication

\- Password hashing

\- Role-based access control

\- Admin and Employee roles

\- Protected workspace routes

\- Admin-only management routes



\### 🏢 Multi-Tenant Architecture



Each organization has its own isolated workspace.



\- Organizations are created during registration

\- Users belong to a specific organization

\- Employees are scoped to their organization

\- Organization-specific user IDs

\- Organization-level document ownership

\- Organization-aware backend authorization



\### 📄 Document Intelligence



\- PDF document upload

\- Document storage using Supabase Storage

\- Background document processing

\- PDF text extraction

\- Document chunking

\- Embedding generation

\- Vector-based retrieval



\### 🧠 RAG Pipeline



DocMind AI uses a Retrieval-Augmented Generation architecture:



```text

User Question

&#x20;     ↓

Query Processing

&#x20;     ↓

Embedding

&#x20;     ↓

Vector Retrieval

&#x20;     ↓

Relevant Document Chunks

&#x20;     ↓

Context Construction

&#x20;     ↓

LLM

&#x20;     ↓

AI Answer



The system retrieves relevant information from uploaded organizational documents before generating an answer.



👥 Employee Management



Administrators can:



Create employees

View employees

Assign organization-scoped user IDs

Manage users within their organization



Employees cannot access administrator-only functionality.



📊 Admin Analytics



The platform tracks AI usage and provides administrator analytics such as:



AI request activity

Request statistics

Usage information

Organization-level analytics

🤖 AI Insights



DocMind AI also includes an administrator insights section designed to transform AI usage data into useful organizational-level insights.



🏗️ System Architecture

&#x20;                   ┌─────────────────────┐

&#x20;                   │      Next.js        │

&#x20;                   │      Frontend       │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;                              │ REST API

&#x20;                              ▼

&#x20;                   ┌─────────────────────┐

&#x20;                   │       FastAPI       │

&#x20;                   │       Backend       │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;            ┌─────────────────┼─────────────────┐

&#x20;            │                 │                 │

&#x20;            ▼                 ▼                 ▼

&#x20;      ┌───────────┐     ┌────────────┐    ┌─────────────┐

&#x20;      │ PostgreSQL│     │  Supabase  │    │    RAG      │

&#x20;      │ Database  │     │  Storage   │    │   Pipeline  │

&#x20;      └───────────┘     └────────────┘    └──────┬──────┘

&#x20;                                                  │

&#x20;                                                  ▼

&#x20;                                           ┌─────────────┐

&#x20;                                           │     LLM     │

&#x20;                                           └─────────────┘

🗄️ Database Architecture



The main database entities include:



Organizations

&#x20;     │

&#x20;     ├── Users

&#x20;     │     ├── Admin

&#x20;     │     └── Employees

&#x20;     │

&#x20;     └── Documents

&#x20;             │

&#x20;             └── Document Chunks

&#x20;                     │

&#x20;                     └── Embeddings



Users

&#x20; │

&#x20; └── AI Requests

Organization-Scoped User IDs



Each organization maintains its own user numbering system.



Example:



Global ID    Organization    Organization User ID

\--------------------------------------------------

1            Organization A          1

2            Organization A          2

3            Organization A          3



4            Organization B          1

5            Organization B          2

6            Organization B          3



This allows organizations to have their own internal user identifiers while maintaining globally unique database IDs.



🛠️ Tech Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

Backend

Python

FastAPI

SQLAlchemy

Pydantic

Alembic

AI / RAG

LangChain

Retrieval-Augmented Generation (RAG)

Local embeddings

Vector retrieval

Gemini API

Database \& Storage

PostgreSQL

Supabase

Supabase Storage

DevOps

Docker

Git

GitHub

📁 Project Structure

DocMindAI/

│

├── backend/

│   │

│   ├── app/

│   │   ├── langchain/

│   │   │   ├── document\_loader.py

│   │   │   ├── embeddings.py

│   │   │   ├── rag\_chain.py

│   │   │   ├── retriever.py

│   │   │   └── spilitter.py

│   │   │

│   │   ├── analytics.py

│   │   ├── database.py

│   │   ├── documents\_processor.py

│   │   ├── insights.py

│   │   ├── llm.py

│   │   ├── main.py

│   │   ├── models.py

│   │   ├── rag.py

│   │   ├── schemas.py

│   │   ├── security.py

│   │   └── storage.py

│   │

│   ├── alembic/

│   │   └── versions/

│   │

│   ├── Dockerfile

│   ├── requirements.txt

│   └── alembic.ini

│

├── frontend/

│   │

│   ├── app/

│   │   ├── login/

│   │   ├── signup/

│   │   └── workspace/

│   │       ├── admin/

│   │       │   ├── analytics/

│   │       │   ├── employee/

│   │       │   ├── insights/

│   │       │   └── layout.tsx

│   │       ├── chat/

│   │       ├── documents/

│   │       ├── profile/

│   │       └── layout.tsx

│   │

│   ├── lib/

│   │   └── api.ts

│   │

│   ├── Dockerfile

│   ├── package.json

│   └── next.config.ts

│

├── .gitignore

└── README.md

🔒 Security



DocMind AI implements multiple layers of security.



Authentication



JWT tokens are used to authenticate users accessing protected backend endpoints.



Password Security



Passwords are stored as hashed values rather than plain text.



Role-Based Access



Administrator functionality is protected using backend authorization.



ADMIN

&#x20; │

&#x20; ├── Workspace

&#x20; ├── Documents

&#x20; ├── Analytics

&#x20; ├── AI Insights

&#x20; └── Employee Management



EMPLOYEE

&#x20; │

&#x20; ├── Workspace

&#x20; ├── Documents

&#x20; └── AI Chat

Organization Isolation



Backend queries use the authenticated user's organization ID to restrict access to organization-specific resources.



Frontend route protection is used as an additional layer, while the backend remains the primary security boundary.



🐳 Docker



Both the backend and frontend are containerized.



Backend



Build:



docker build -t docmind-backend .



Run:



docker run --name docmind-backend -p 8000:8000 --env-file .env docmind-backend

Frontend



Build:



docker build -t docmind-frontend .



Run:



docker run --name docmind-frontend -p 3000:3000 docmind-frontend

🔑 Environment Variables



Sensitive environment variables are kept outside the Git repository.



Example:



DATABASE\_URL=

SUPABASE\_URL=

SUPABASE\_KEY=

GEMINI\_API\_KEY=

JWT\_SECRET=

NEXT\_PUBLIC\_API\_URL=



Actual credentials should never be committed to GitHub.



🗃️ Database Migrations



DocMind AI uses Alembic for database schema migrations.



Example:



alembic upgrade head



Migrations are used to version and manage changes to the database schema, including:



Organizations

Users

Documents

Document chunks

Embeddings

AI request analytics

Organization-scoped user IDs

💻 Local Development

Backend



Create and activate a Python virtual environment:



python -m venv .venv



Activate it on Windows:



.venv\\Scripts\\Activate.ps1



Install dependencies:



pip install -r requirements.txt



Run FastAPI:



uvicorn app.main:app --reload



The API will be available at:



http://localhost:8000

Frontend



Install dependencies:



npm install



Run the development server:



npm run dev



The frontend will be available at:



http://localhost:3000

📈 Current Project Status



DocMind AI currently includes:



✅ User registration

✅ User login

✅ JWT authentication

✅ Organization creation

✅ Multi-tenant architecture

✅ Organization-scoped user IDs

✅ Employee creation

✅ Employee listing

✅ Role-based authorization

✅ Protected workspace

✅ Admin-only routes

✅ PDF upload

✅ Supabase Storage

✅ Document processing

✅ Document chunking

✅ Embeddings

✅ RAG pipeline

✅ LangChain integration

✅ AI question answering

✅ AI request analytics

✅ Admin analytics dashboard

✅ AI insights

✅ Backend Dockerization

✅ Frontend Dockerization

✅ Database migrations with Alembic

✅ Git/GitHub version control

🔮 Future Improvements



Potential future improvements include:



Advanced RAG evaluation

RAGAS-based evaluation pipelines

Prompt injection protection

PII detection and protection

Improved document ingestion

Background job queues

Advanced observability

Token and cost monitoring

Cloud database optimization

Cloud object storage optimization

More granular organization permissions

Enterprise audit logs

Production-scale deployment

🎯 Project Goal



The goal of DocMind AI is to move beyond a simple document chatbot and build an enterprise-oriented document intelligence platform.



The project focuses on combining:



Multi-Tenancy

&#x20;     +

Authentication

&#x20;     +

Authorization

&#x20;     +

Document Processing

&#x20;     +

RAG

&#x20;     +

LLM

&#x20;     +

Analytics

&#x20;     +

AI Insights

&#x20;     +

Docker



into a single full-stack AI system.



👨‍💻 Author



Zoheb Qureshi



AI Engineer | Computer Science Student



GitHub:

https://github.com/zohebqureshimz-pixel



LinkedIn:

https://www.linkedin.com/in/zoheb-qureshi/



⭐ If you find the project interesting, feel free to explore the code and architecture.

