from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class QuestionSchema(BaseModel):
    id: str
    question: str
    category: str = ""
    difficulty: str = ""
    what_interviewer_looks_for: str = ""
    suggested_framework: str = ""
    answer_outline: str = ""
    common_mistakes: str = ""


class QuestionSetSchema(BaseModel):
    behavioral: list[QuestionSchema]
    professional: list[QuestionSchema]
    company_type: list[QuestionSchema]
    preparation_tips: str = ""


class InterviewCreate(BaseModel):
    industry_slug: str
    position_level: str = "中级"
    role_type: str = ""
    company_type: str = ""
    resume_id: UUID | None = None


class InterviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    resume_id: UUID | None = None
    industry_id: UUID
    position_level: str | None = None
    role_type: str | None = None
    company_type: str | None = None
    questions: dict
    tokens_used: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InterviewListResponse(BaseModel):
    items: list[InterviewResponse]
    total: int
    page: int
    page_size: int
