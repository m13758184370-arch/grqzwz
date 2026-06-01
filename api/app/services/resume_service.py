import json
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.industry import Industry
from app.models.resume import Resume
from app.models.user import User
from app.prompts.base import prompt_loader
from app.schemas.resume import ResumeCreate
from app.services.ai_service import ai_service


class ResumeService:
    async def create_and_generate(
        self,
        db: AsyncSession,
        user: User,
        payload: ResumeCreate,
    ) -> Resume:
        # Find industry
        result = await db.execute(
            select(Industry).where(Industry.slug == payload.industry_slug)
        )
        industry = result.scalar_one_or_none()
        if not industry:
            raise ValueError(f"Industry not found: {payload.industry_slug}")

        # Create resume record
        resume = Resume(
            user_id=user.id,
            industry_id=industry.id,
            raw_data=payload.raw_data.model_dump(),
            status="generating",
            position_level=payload.position_level or "中级",
            target_company_type=payload.target_company_type or "",
        )
        db.add(resume)
        await db.commit()
        await db.refresh(resume)

        try:
            # Build prompts
            system_prompt = prompt_loader.build_resume_system_prompt(payload.industry_slug)
            user_prompt = prompt_loader.build_resume_user_prompt(
                industry_slug=payload.industry_slug,
                raw_data_json=json.dumps(payload.raw_data.model_dump(), ensure_ascii=False, indent=2),
                position_level=payload.position_level or "中级",
                target_company_type=payload.target_company_type or "",
            )

            # Call AI
            result = await ai_service.generate_resume(system_prompt, user_prompt)

            # Update resume with generated content
            resume.generated_sections = result["data"].get("sections", {})
            resume.generated_full_text = self._sections_to_text(result["data"].get("sections", {}))
            resume.tokens_used = result["cost"]["input_tokens"] + result["cost"]["output_tokens"]
            resume.status = "completed"
        except Exception as e:
            resume.status = "failed"
            resume.generated_sections = {"error": str(e)}
            await db.commit()
            raise

        await db.commit()
        await db.refresh(resume)
        return resume

    def _sections_to_text(self, sections: dict) -> str:
        """Convert structured sections to plain text for full-text display."""
        lines = []

        if "个人信息" in sections:
            info = sections["个人信息"]
            lines.append(f"{info.get('name', '')}")
            lines.append(f"{info.get('phone', '')} | {info.get('email', '')} | {info.get('location', '')}")
            lines.append("")

        if "个人总结" in sections:
            lines.append("个人总结")
            lines.append(sections["个人总结"])
            lines.append("")

        if "工作经历" in sections:
            lines.append("工作经历")
            for exp in sections["工作经历"]:
                lines.append(f"{exp.get('company', '')} | {exp.get('title', '')} | {exp.get('duration', '')}")
                for bullet in exp.get("bullets", []):
                    lines.append(f"  • {bullet}")
                lines.append("")

        if "项目经验" in sections:
            lines.append("项目经验")
            for proj in sections["项目经验"]:
                lines.append(f"{proj.get('name', '')} | {proj.get('role', '')} | {proj.get('duration', '')}")
                for bullet in proj.get("bullets", []):
                    lines.append(f"  • {bullet}")
                lines.append("")

        if "教育背景" in sections:
            lines.append("教育背景")
            for edu in sections["教育背景"]:
                lines.append(f"{edu.get('school', '')} | {edu.get('degree', '')} | {edu.get('major', '')} | {edu.get('duration', '')}")
            lines.append("")

        if "专业技能" in sections:
            lines.append("专业技能")
            lines.append("、".join(sections["专业技能"]))
            lines.append("")

        if "自我评价" in sections:
            lines.append("自我评价")
            lines.append(sections["自我评价"])

        return "\n".join(lines)

    async def get_resume(self, db: AsyncSession, resume_id: uuid.UUID) -> Resume | None:
        result = await db.execute(select(Resume).where(Resume.id == resume_id))
        return result.scalar_one_or_none()

    async def get_user_resumes(
        self, db: AsyncSession, user_id: uuid.UUID, page: int = 1, page_size: int = 10
    ) -> tuple[list[Resume], int]:
        count_result = await db.execute(
            select(Resume).where(Resume.user_id == user_id)
        )
        total = len(count_result.scalars().all())

        result = await db.execute(
            select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), total


resume_service = ResumeService()
