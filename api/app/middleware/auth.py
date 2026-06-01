import uuid

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User


async def get_current_user(
    x_session_id: str = Header(default=""),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get or create user by session ID. MVP: no login required."""
    if not x_session_id:
        x_session_id = str(uuid.uuid4())

    result = await db.execute(
        select(User).where(User.session_id == x_session_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        user = User(session_id=x_session_id, credits=0)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
