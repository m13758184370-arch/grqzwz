import uuid
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class InterviewQuestionSet(Base):
    __tablename__ = "interview_question_sets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    industry_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("industries.id"), nullable=False)

    position_level: Mapped[str | None] = mapped_column(String(32), nullable=True)
    role_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    company_type: Mapped[str | None] = mapped_column(String(64), nullable=True)

    questions: Mapped[dict] = mapped_column(JSONB, default=dict)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(32), default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
