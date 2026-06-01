import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewListResponse, InterviewResponse
from app.services.credit_service import credit_service
from app.services.interview_service import interview_service

router = APIRouter(prefix="/api/v1/interviews", tags=["interviews"])


@router.post("", response_model=InterviewResponse)
async def create_interview(
    payload: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not await credit_service.has_credits(db, user):
        raise HTTPException(status_code=402, detail="Insufficient credits. Please purchase a package.")

    await credit_service.consume_credit(db, user)
    question_set = await interview_service.create_and_generate(db, user, payload)
    return InterviewResponse.model_validate(question_set)


@router.get("/{question_set_id}", response_model=InterviewResponse)
async def get_interview(
    question_set_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    qs = await interview_service.get_question_set(db, question_set_id)
    if not qs or qs.user_id != user.id:
        raise HTTPException(status_code=404, detail="Question set not found")
    return InterviewResponse.model_validate(qs)


@router.get("", response_model=InterviewListResponse)
async def list_interviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items, total = await interview_service.get_user_question_sets(db, user.id, page, page_size)
    return InterviewListResponse(
        items=[InterviewResponse.model_validate(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
    )
