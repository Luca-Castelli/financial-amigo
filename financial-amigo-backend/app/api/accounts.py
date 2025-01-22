from typing import List
from uuid import UUID

from app.core.auth import get_current_user, require_auth
from app.core.database import get_db
from app.models.account import Account, AccountType
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class AccountCreate(BaseModel):
    name: str
    type: AccountType
    currency: str
    description: str | None = None
    broker: str | None = None
    account_number: str | None = None


class AccountUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    broker: str | None = None
    account_number: str | None = None


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


@router.post("", response_model=AccountResponse)
@require_auth
async def create_account(
    account: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Account:
    """Create a new investment account."""
    # Validate currency
    if account.currency not in ["CAD", "USD"]:
        raise HTTPException(400, "Invalid currency. Must be CAD or USD.")

    # Create account
    db_account = Account(
        user_id=current_user.id,
        name=account.name,
        type=account.type,
        currency=account.currency,
        description=account.description,
        broker=account.broker,
        account_number=account.account_number,
    )
    db.add(db_account)

    try:
        db.commit()
        db.refresh(db_account)
        return db_account
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Failed to create account: {str(e)}")


@router.get("", response_model=List[AccountResponse])
@require_auth
async def list_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Account]:
    """List all accounts for the current user."""
    return db.query(Account).filter(Account.user_id == current_user.id).all()


@router.get("/{account_id}", response_model=AccountResponse)
@require_auth
async def get_account(
    account_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Account:
    """Get a specific account by ID."""
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(404, "Account not found")
    return account


@router.patch("/{account_id}", response_model=AccountResponse)
@require_auth
async def update_account(
    account_id: UUID,
    account_update: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Account:
    """Update an account's details."""
    # Get existing account
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(404, "Account not found")

    # Update fields if provided
    if account_update.name is not None:
        account.name = account_update.name
    if account_update.description is not None:
        account.description = account_update.description
    if account_update.broker is not None:
        account.broker = account_update.broker
    if account_update.account_number is not None:
        account.account_number = account_update.account_number

    try:
        db.commit()
        db.refresh(account)
        return account
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Failed to update account: {str(e)}")


@router.delete("/{account_id}")
@require_auth
async def delete_account(
    account_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an account and all associated data (holdings, transactions, etc.)."""
    # Get the account
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(404, "Account not found")

    try:
        # Delete the account (cascading will handle related records)
        account_name = account.name  # Store name before deletion for response
        db.delete(account)
        db.commit()
        return {
            "status": "success",
            "message": f"Account '{account_name}' and all associated data deleted successfully",
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Failed to delete account: {str(e)}")
