import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class UserBase(BaseModel):
    email: str
    username: str
    full_name: str
    role: str
    avatar_url: str | None = None
    bio: str | None = None

class UserOut(UserBase):
    id: uuid.UUID
    is_active: bool
    is_email_verified: bool
    following_count: int
    followers_count: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AuthorProfileBase(BaseModel):
    pen_name: str | None = None
    website: str | None = None
    social_links: str | None = None

class AuthorProfileOut(AuthorProfileBase):
    id: uuid.UUID
    total_books: int
    total_sales: int
    
    model_config = ConfigDict(from_attributes=True)

class AuthorApplicationCreate(BaseModel):
    writing_sample: str
    motivation: str
    genre: str
    social_links: str | None = None

class AuthorApplicationOut(AuthorApplicationCreate):
    id: uuid.UUID
    status: str
    admin_notes: str | None = None
    reviewed_at: datetime | None = None
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
