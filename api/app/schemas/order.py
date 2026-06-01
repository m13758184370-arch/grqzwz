from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class OrderCreate(BaseModel):
    product_type: str  # resume_generation | interview_questions | bundle
    industry_slug: str
    payment_method: str = "wechat_pay"


class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID | None = None
    order_no: str
    product_type: str
    amount_cents: int
    amount_display: str = ""
    payment_method: str | None = None
    payment_status: str
    qr_code_url: str | None = None
    paid_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
