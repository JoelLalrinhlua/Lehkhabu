from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_author
from app.models.book import Book, BookStatus
from app.models.user import User, AuthorProfile
from app.schemas.book import BookCreate, BookOut, BookUpdate

router = APIRouter()


@router.get("/", response_model=list[BookOut])
async def list_books(
    skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)
):
    """
    List all published books (publicly visible).
    """
    result = await db.execute(
        select(Book).where(Book.status == BookStatus.PUBLISHED).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.post(
    "/",
    response_model=BookOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new draft book (Authors only)"
)
async def create_book(
    data: BookCreate,
    current_user: Annotated[User, Depends(get_current_active_author)],
    db: AsyncSession = Depends(get_db)
):
    """
    Allows an author to create a new book draft.
    """
    # Verify the user has an author profile
    result = await db.execute(select(AuthorProfile).where(AuthorProfile.user_id == current_user.id))
    author_profile = result.scalar_one_or_none()
    
    if not author_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="You must set up an Author Profile before publishing."
        )

    # Generate a sluggified version of the title
    base_slug = data.title.lower().replace(" ", "-").replace("'", "")
    # Extremely basic uniqueness mechanism; for production use a robust slugifier loop
    import uuid
    safe_slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"

    new_book = Book(
        title=data.title,
        slug=safe_slug,
        description=data.description,
        isbn=data.isbn,
        language=data.language,
        category=data.category,
        tags=data.tags,
        price=data.price,
        is_free=data.is_free,
        author_id=author_profile.id,
        status=BookStatus.DRAFT,
    )
    
    db.add(new_book)
    await db.commit()
    await db.refresh(new_book)
    return new_book


@router.get("/{slug}", response_model=BookOut)
async def get_book(
    slug: str, db: AsyncSession = Depends(get_db)
):
    """
    Get book details by its slug.
    """
    result = await db.execute(select(Book).where(Book.slug == slug))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
