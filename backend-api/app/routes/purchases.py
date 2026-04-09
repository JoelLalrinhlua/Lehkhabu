from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def create_purchase():
    return {"id": "1"}
