from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class RawDataSchema(BaseModel):
    name: str = ""
    phone: str = ""
    email: str = ""
    location: str = ""
    education: list[dict] = Field(default_factory=list)
    work_experience: list[dict] = Field(default_factory=list)
    projects: list[dict] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    self_evaluation: str = ""


class ResumeCreate(BaseModel):
    industry_slug: str
    raw_data: RawDataSchema
    position_level: str | None = None
    target_company_type: str | None = None


class GeneratedSection(BaseModel):
    pass


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    industry_id: UUID
    raw_data: dict
    generated_sections: dict | None = None
    generated_full_text: str | None = None
    pdf_url: str | None = None
    status: str
    position_level: str | None = None
    target_company_type: str | None = None
    tokens_used: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResumeStatusResponse(BaseModel):
    status: str
    progress: str = "generating_content"


class ResumeListResponse(BaseModel):
    items: list[ResumeResponse]
    total: int
    page: int
    page_size: int
