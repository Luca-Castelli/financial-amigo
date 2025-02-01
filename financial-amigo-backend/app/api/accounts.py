from typing import List

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.account import Account
from app.models.user import User
from app.schemas.account import AccountCreate, AccountResponse, AccountUpdate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("")
async def create_account(
    account_data: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountResponse:
    """Create a new account."""
    account = Account(**account_data.dict(), user_id=current_user.id)
    db.add(account)
    try:
        db.commit()
        db.refresh(account)
        return AccountResponse.from_orm(account)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
async def list_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[AccountResponse]:
    """List all accounts for the current user."""
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    return [AccountResponse.from_orm(account) for account in accounts]


@router.get("/{account_id}")
async def get_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountResponse:
    """Get a specific account."""
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return AccountResponse.from_orm(account)


@router.patch("/{account_id}")
async def update_account(
    account_id: str,
    account_data: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountResponse:
    """Update an account."""
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    for key, value in account_data.dict(exclude_unset=True).items():
        setattr(account, key, value)

    try:
        db.commit()
        db.refresh(account)
        return AccountResponse.from_orm(account)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{account_id}")
async def delete_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Delete an account."""
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    try:
        db.delete(account)
        db.commit()
        return {"status": "success", "message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
