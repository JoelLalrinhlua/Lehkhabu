from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.purchase import Purchase
from app.schemas.purchase import PurchaseOut

router = APIRouter()

@router.get("/", response_model=list[PurchaseOut])
async def list_purchases(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all purchases for the current user.
    """
    result = await db.execute(
        select(Purchase).where(Purchase.user_id == current_user.id)
    )
    return result.scalars().all()
