from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def setup_cors(app):
    """Configure CORS for the FastAPI application"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
