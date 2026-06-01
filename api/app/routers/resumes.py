import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.resume import ResumeCreate, ResumeListResponse, ResumeResponse, ResumeStatusResponse
from app.services.credit_service import credit_service
from app.services.pdf_service import pdf_service
from app.services.resume_service import resume_service

router = APIRouter(prefix="/api/v1/resumes", tags=["resumes"])


@router.post("", response_model=ResumeResponse)
async def create_resume(
    payload: ResumeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not await credit_service.has_credits(db, user):
        raise HTTPException(status_code=402, detail="Insufficient credits. Please purchase a package.")

    await credit_service.consume_credit(db, user)
    resume = await resume_service.create_and_generate(db, user, payload)
    return ResumeResponse.model_validate(resume)


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    resume = await resume_service.get_resume(db, resume_id)
    if not resume or resume.user_id != user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeResponse.model_validate(resume)


@router.get("/{resume_id}/status", response_model=ResumeStatusResponse)
async def get_resume_status(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    resume = await resume_service.get_resume(db, resume_id)
    if not resume or resume.user_id != user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeStatusResponse(status=resume.status)


@router.get("/{resume_id}/pdf")
async def download_resume_pdf(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    resume = await resume_service.get_resume(db, resume_id)
    if not resume or resume.user_id != user.id:
        raise HTTPException(status_code=404, detail="Resume not found")

    if resume.status != "completed" or not resume.generated_sections:
        raise HTTPException(status_code=400, detail="Resume not ready")

    pdf_bytes = await pdf_service.generate_resume_pdf(resume.generated_sections, resume_id)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="resume-{resume_id}.pdf"'},
    )


@router.get("", response_model=ResumeListResponse)
async def list_resumes(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items, total = await resume_service.get_user_resumes(db, user.id, page, page_size)
    return ResumeListResponse(
        items=[ResumeResponse.model_validate(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
    )
