import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class BookBase(BaseModel):
    title: str
    description: str | None = None
    isbn: str | None = None
    language: str = "en"
    category: str
    tags: list[str] = []
    price: float = 0.0
    is_free: bool = False
    
class BookCreate(BookBase):
    pass

class BookUpdate(BookBase):
    title: str | None = None
    category: str | None = None

class BookOut(BookBase):
    id: uuid.UUID
    slug: str
    author_id: uuid.UUID
    status: str
    
    cover_image_url: str | None = None
    file_url: str | None = None
    cover_color_primary: str | None = None
    cover_color_secondary: str | None = None
    
    total_pages: int | None = None
    word_count: int | None = None
    
    average_rating: float
    rating_count: int
    purchase_count: int
    
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ReviewBase(BaseModel):
    rating: int
    comment: str | None = None

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ShelfEntryBase(BaseModel):
    shelf: str

class ShelfEntryCreate(ShelfEntryBase):
    book_id: uuid.UUID

class ShelfEntryOut(ShelfEntryBase):
    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    added_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
