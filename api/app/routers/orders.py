import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.industry import Industry
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate, OrderListResponse, OrderResponse

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])

# Pricing table (cents RMB)
PRICES = {
    "resume_generation": 990,
    "interview_questions": 990,
    "bundle": 1490,
}


def _generate_order_no() -> str:
    now = datetime.now()
    return f"RV{now.strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"


@router.post("", response_model=OrderResponse)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.product_type not in PRICES:
        raise HTTPException(status_code=400, detail=f"Invalid product type: {payload.product_type}")

    amount = PRICES[payload.product_type]

    # Find industry
    result = await db.execute(select(Industry).where(Industry.slug == payload.industry_slug))
    industry = result.scalar_one_or_none()

    order = Order(
        user_id=user.id,
        order_no=_generate_order_no(),
        product_type=payload.product_type,
        industry_id=industry.id if industry else None,
        amount_cents=amount,
        payment_method=payload.payment_method,
        payment_status="pending",
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    resp = OrderResponse.model_validate(order)
    resp.amount_display = f"{amount / 100:.2f}"
    return resp


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    resp = OrderResponse.model_validate(order)
    resp.amount_display = f"{order.amount_cents / 100:.2f}"
    return resp


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    count_result = await db.execute(
        select(func.count()).select_from(Order).where(Order.user_id == user.id)
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(Order)
        .where(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    orders = result.scalars().all()

    items = []
    for o in orders:
        resp = OrderResponse.model_validate(o)
        resp.amount_display = f"{o.amount_cents / 100:.2f}"
        items.append(resp)

    return OrderListResponse(items=items, total=total, page=page, page_size=page_size)
