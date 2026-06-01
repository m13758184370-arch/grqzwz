import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    industry_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("industries.id"), nullable=False)

    raw_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    generated_sections: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    generated_full_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    pdf_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="draft")
    position_level: Mapped[str | None] = mapped_column(String(32), nullable=True)
    target_company_type: Mapped[str | None] = mapped_column(String(64), nullable=True)

    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
