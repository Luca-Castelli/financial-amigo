"""
Import all models and set up relationships after all models are defined.
This avoids circular import issues.
"""

from app.db.base_class import Base
from app.models.account import Account
from app.models.benchmark import Benchmark, BenchmarkValue, PortfolioBenchmark
from app.models.cash_transaction import CashTransaction
from app.models.historical_balance import HistoricalBalance
from app.models.historical_fx_rate import HistoricalFXRate
from app.models.historical_price import HistoricalPrice
from app.models.holding import Holding
from app.models.security import Security
from app.models.transaction import Transaction
from app.models.user import User

# Make sure all models are imported
__all__ = [
    "Base",
    "User",
    "Account",
    "Security",
    "Holding",
    "Transaction",
    "CashTransaction",
    "HistoricalBalance",
    "HistoricalPrice",
    "HistoricalFXRate",
    "Benchmark",
    "BenchmarkValue",
    "PortfolioBenchmark",
]
