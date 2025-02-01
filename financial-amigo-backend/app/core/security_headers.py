from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

from app.core.config import settings


def setup_security_headers(app):
    """Configure security headers for the FastAPI application"""
    # Force HTTPS in production
    if settings.USE_HTTPS:
        app.add_middleware(HTTPSRedirectMiddleware)

    @app.middleware("http")
    async def add_security_headers(request, call_next):
        response = await call_next(request)

        # Security headers
        response.headers.update(
            {
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                "X-XSS-Protection": "1; mode=block",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            }
        )

        # Add HSTS only if HTTPS is enabled
        if settings.USE_HTTPS:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        return response
