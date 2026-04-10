from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_active_author
from app.models.user import User, AuthorProfile
from app.schemas.user import UserOut, AuthorProfileOut
from uuid import UUID

router = APIRouter()


@router.get("/", response_model=list[UserOut])
async def list_users(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    """
    List users in the system (Basic implementation, might need admin scope).
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: UUID, db: AsyncSession = Depends(get_db)
):
    """
    Get a specific user by ID.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/author-profile", response_model=AuthorProfileOut)
async def get_user_author_profile(
    user_id: UUID, db: AsyncSession = Depends(get_db)
):
    """
    Get the author profile associated with a user, if any.
    """
    result = await db.execute(select(AuthorProfile).where(AuthorProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Author profile not found for this user")
    return profile
