from datetime import timedelta
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    # Check if email exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )
        
    # Check if username exists
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
        )

    # Create new user
    new_user = User(
        email=data.email,
        username=data.username,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=UserRole.USER,  # Default role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def login_user(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    # Find user by email
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User account is inactive"
        )

    # Create JWT token
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    token = create_access_token(
        subject=str(user.id), 
        expires_delta=access_token_expires,
        extra_claims={"role": user.role.value, "username": user.username}
    )
    
    return TokenResponse(access_token=token)
