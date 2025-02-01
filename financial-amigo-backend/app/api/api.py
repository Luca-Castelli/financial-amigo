from app.api import auth
from fastapi import APIRouter

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
