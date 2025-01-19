from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users

app = FastAPI(
    title="FinancialAmigo API",
    description="Backend API for FinancialAmigo portfolio tracking application",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/")
async def root():
    return {"message": "Welcome to FinancialAmigo API"}
