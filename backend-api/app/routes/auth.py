from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserOut
from app.services.auth_service import login_user, register_user

router = APIRouter()


@router.post(
    "/register", 
    response_model=UserOut, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
async def register(
    data: RegisterRequest, 
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Register a new user in the system using standard email and password.
    Returns the created user object.
    """
    return await register_user(db, data)


@router.post(
    "/login", 
    response_model=TokenResponse,
    summary="Login user"
)
async def login(
    data: LoginRequest, 
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Login a user by verifying credentials and returning a JWT token.
    """
    return await login_user(db, data)


@router.get(
    "/me", 
    response_model=UserOut,
    summary="Get current user"
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Get the details of the currently authenticated user.
    """
    return current_user
