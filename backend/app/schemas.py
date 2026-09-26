from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    organization_name: str
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class EmployeeCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class EmployeeResponse(BaseModel):
    id: int
    organization_user_id: int
    name: str
    email: EmailStr
    role: str
    organization_id: int

    class Config:
        from_attributes = True    


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    organization_user_id: int
    name: str
    email: EmailStr
    role: str
    organization_id: int

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    filename: str
    storage_key: str
    status: str
    organization_id: int
    uploaded_by: int

    class Config:
        from_attributes = True

class SearchRequest(BaseModel):
    query: str
    document_id: int
    top_k: int = 5        

class AskRequest(BaseModel):
    question: str
    document_id: int
    top_k: int = 5