import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.industry import Industry
from app.models.interview_question import InterviewQuestionSet
from app.models.resume import Resume
from app.models.user import User
from app.prompts.base import prompt_loader
from app.schemas.interview import InterviewCreate
from app.services.ai_service import ai_service


class InterviewService:
    async def create_and_generate(
        self,
        db: AsyncSession,
        user: User,
        payload: InterviewCreate,
    ) -> InterviewQuestionSet:
        # Find industry
        result = await db.execute(
            select(Industry).where(Industry.slug == payload.industry_slug)
        )
        industry = result.scalar_one_or_none()
        if not industry:
            raise ValueError(f"Industry not found: {payload.industry_slug}")

        # Get resume summary if provided
        resume_summary = ""
        if payload.resume_id:
            resume_result = await db.execute(
                select(Resume).where(Resume.id == payload.resume_id)
            )
            resume = resume_result.scalar_one_or_none()
            if resume and resume.generated_full_text:
                resume_summary = resume.generated_full_text[:2000]  # Limit context

        # Create question set record
        question_set = InterviewQuestionSet(
            user_id=user.id,
            resume_id=payload.resume_id,
            industry_id=industry.id,
            position_level=payload.position_level,
            role_type=payload.role_type,
            company_type=payload.company_type,
            status="generating",
        )
        db.add(question_set)
        await db.commit()
        await db.refresh(question_set)

        try:
            # Build prompts
            system_prompt = prompt_loader.build_interview_system_prompt(payload.industry_slug)
            user_prompt = prompt_loader.build_interview_user_prompt(
                industry_slug=payload.industry_slug,
                position_level=payload.position_level,
                role_type=payload.role_type,
                company_type=payload.company_type,
                resume_summary=resume_summary,
            )

            # Call AI
            result = await ai_service.generate_interview_questions(system_prompt, user_prompt)

            # Update question set
            question_set.questions = result["data"]
            question_set.tokens_used = result["cost"]["input_tokens"] + result["cost"]["output_tokens"]
            question_set.status = "completed"
        except Exception as e:
            question_set.status = "failed"
            question_set.questions = {"error": str(e)}
            await db.commit()
            raise

        await db.commit()
        await db.refresh(question_set)
        return question_set

    async def get_question_set(
        self, db: AsyncSession, question_set_id: uuid.UUID
    ) -> InterviewQuestionSet | None:
        result = await db.execute(
            select(InterviewQuestionSet).where(InterviewQuestionSet.id == question_set_id)
        )
        return result.scalar_one_or_none()

    async def get_user_question_sets(
        self, db: AsyncSession, user_id: uuid.UUID, page: int = 1, page_size: int = 10
    ) -> tuple[list[InterviewQuestionSet], int]:
        count_result = await db.execute(
            select(InterviewQuestionSet).where(InterviewQuestionSet.user_id == user_id)
        )
        total = len(count_result.scalars().all())

        result = await db.execute(
            select(InterviewQuestionSet)
            .where(InterviewQuestionSet.user_id == user_id)
            .order_by(InterviewQuestionSet.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), total


interview_service = InterviewService()
