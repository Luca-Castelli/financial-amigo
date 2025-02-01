from fastapi import FastAPI

from app.api.api import api_router
from app.core.cors import setup_cors
from app.core.security_headers import setup_security_headers

# Create FastAPI app
app = FastAPI(title="FinancialAmigo API")

# Setup CORS before adding routes
setup_cors(app)

# Include API router with /api prefix
app.include_router(api_router, prefix="/api")

# Setup security headers
setup_security_headers(app)


@app.get("/")
async def root():
    return {"message": "Welcome to FinancialAmigo API"}
