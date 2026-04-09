import uvicorn
from fastapi import FastAPI
from app.routes import health

app = FastAPI(title="Lehkhabu AI Service")

app.include_router(health.router, tags=["health"])

@app.get("/")
async def root():
    return {"message": "Lehkhabu AI Service (Phase 2 Skeleton)"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
