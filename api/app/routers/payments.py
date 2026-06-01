from datetime import datetime

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.order import Order
from app.services.credit_service import credit_service

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


@router.post("/callback")
async def payment_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """WeChat Pay / Alipay callback endpoint.
    In production, validate the signature before updating order status.
    """
    body = await request.json()
    order_no = body.get("out_trade_no") or body.get("order_no")
    if not order_no:
        return {"code": "FAIL", "message": "Missing order_no"}

    result = await db.execute(select(Order).where(Order.order_no == order_no))
    order = result.scalar_one_or_none()
    if not order:
        return {"code": "FAIL", "message": "Order not found"}

    # Grant credits based on product type
    credit_map = {
        "resume_generation": 1,
        "interview_questions": 1,
        "bundle": 2,
    }
    credits_to_grant = credit_map.get(order.product_type, 1)

    from app.models.user import User

    user_result = await db.execute(select(User).where(User.id == order.user_id))
    user = user_result.scalar_one_or_none()

    if user:
        await credit_service.grant_credits(db, user, credits_to_grant)

    order.payment_status = "paid"
    order.paid_at = datetime.now()
    await db.commit()

    return {"code": "SUCCESS", "message": "OK"}
