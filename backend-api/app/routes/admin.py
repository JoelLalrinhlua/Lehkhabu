from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.models.book import Book

router = APIRouter()

@router.get("/stats")
async def get_stats(
    current_admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get backend platform stats (Admin only).
    """
    users_count = await db.execute(select(func.count(User.id)))
    books_count = await db.execute(select(func.count(Book.id)))
    
    return {
        "status": "online",
        "total_users": users_count.scalar() or 0,
        "total_published_books": books_count.scalar() or 0
    }
