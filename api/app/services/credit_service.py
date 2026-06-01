from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class CreditService:
    async def has_credits(self, db: AsyncSession, user: User, amount: int = 1) -> bool:
        """Check if user has enough credits."""
        await db.refresh(user)
        return user.credits >= amount

    async def consume_credit(self, db: AsyncSession, user: User, amount: int = 1) -> bool:
        """Consume one credit. Returns False if insufficient."""
        await db.refresh(user)
        if user.credits < amount:
            return False
        user.credits -= amount
        await db.commit()
        return True

    async def grant_credits(self, db: AsyncSession, user: User, amount: int) -> None:
        """Grant credits to user after payment."""
        user.credits += amount
        await db.commit()


credit_service = CreditService()
