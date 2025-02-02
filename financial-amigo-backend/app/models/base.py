"""
Import all models and set up relationships after all models are defined.
This avoids circular import issues.
"""

from app.db.base_class import Base
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.user import User

# Make sure all models are imported
__all__ = [
    "Base",
    "User",
    "Account",
    "Transaction",
]
