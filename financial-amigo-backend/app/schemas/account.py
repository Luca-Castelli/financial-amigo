from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class AccountType(str, Enum):
    TFSA = "TFSA"
    RRSP = "RRSP"
    FHSA = "FHSA"
    NON_REGISTERED = "NON_REGISTERED"

    def __str__(self) -> str:
        return self.value


class AccountCreate(BaseModel):
    name: str
    type: AccountType
    currency: str
    description: str | None = None
    broker: str | None = None
    account_number: str | None = None

    class Config:
        from_attributes = True


class AccountUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    broker: str | None = None
    account_number: str | None = None

    class Config:
        from_attributes = True


class AccountResponse(BaseModel):
    id: UUID
    name: str
    type: AccountType
    currency: str
    description: str | None = None
    broker: str | None = None
    account_number: str | None = None
    cash_balance: float = 0
    cash_interest_ytd: float = 0

    class Config:
        from_attributes = True
