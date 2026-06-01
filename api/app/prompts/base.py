import yaml
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent


class PromptLoader:
    """Loads and renders prompt templates with industry-specific context."""

    def __init__(self):
        self._cache: dict[str, str] = {}
        self._industry_configs: dict[str, dict] = {}

    def _read(self, relative_path: str) -> str:
        if relative_path not in self._cache:
            filepath = PROMPTS_DIR / relative_path
            if not filepath.exists():
                raise FileNotFoundError(f"Prompt file not found: {filepath}")
            self._cache[relative_path] = filepath.read_text(encoding="utf-8")
        return self._cache[relative_path]

    def _fill(self, template: str, **kwargs: str) -> str:
        """Fill template placeholders using simple string replacement.
        Uses {key} syntax. JSON curly braces in the template are safe
        because they don't match any placeholder keys."""
        result = template
        for key, value in kwargs.items():
            result = result.replace("{" + key + "}", value)
        return result

    def _default_industry_config(self, slug: str) -> dict:
        return {
            "slug": slug,
            "name_zh": slug,
            "resume": {
                "keywords": {"required": [], "bonus": []},
                "custom_instructions": "",
            },
            "interview": {
                "professional_instructions": "",
                "professional_topics": [],
                "company_types": [],
            },
        }

    def load_industry_config(self, slug: str) -> dict:
        if slug not in self._industry_configs:
            filepath = PROMPTS_DIR / "industries" / f"{slug}.yaml"
            if filepath.exists():
                with open(filepath, encoding="utf-8") as f:
                    self._industry_configs[slug] = yaml.safe_load(f)
            else:
                self._industry_configs[slug] = self._default_industry_config(slug)
        return self._industry_configs[slug]

    def build_resume_system_prompt(self, industry_slug: str) -> str:
        industry = self.load_industry_config(industry_slug)
        resume_cfg = industry.get("resume", {})

        context_parts = []
        context_parts.append(f"目标行业：{industry['name_zh']}")
        keywords = resume_cfg.get("keywords", {})
        context_parts.append(f"必须包含的关键词：{', '.join(keywords.get('required', []))}")
        context_parts.append(f"加分关键词：{', '.join(keywords.get('bonus', []))}")
        context_parts.append(resume_cfg.get("custom_instructions", ""))

        template = self._read("resume/system_prompt.txt")
        return self._fill(template, industry_context="\n".join(context_parts))

    def build_resume_user_prompt(
        self,
        industry_slug: str,
        raw_data_json: str,
        position_level: str = "中级",
        target_company_type: str = "",
    ) -> str:
        industry = self.load_industry_config(industry_slug)
        resume_cfg = industry.get("resume", {})

        template = self._read("resume/user_prompt_template.txt")
        return self._fill(
            template,
            industry_name=industry["name_zh"],
            position_level=position_level,
            target_company_type=target_company_type or "不限",
            raw_data_json=raw_data_json,
            industry_specific_instructions=resume_cfg.get("custom_instructions", ""),
        )

    def build_interview_system_prompt(self, industry_slug: str) -> str:
        industry = self.load_industry_config(industry_slug)
        interview_cfg = industry.get("interview", {})

        template = self._read("interview/system_prompt.txt")
        return self._fill(
            template,
            industry_professional_context=interview_cfg.get("professional_instructions", ""),
            company_type_context=self._build_company_type_context(industry_slug),
        )

    def build_interview_user_prompt(
        self,
        industry_slug: str,
        position_level: str,
        role_type: str,
        company_type: str,
        resume_summary: str = "",
    ) -> str:
        industry = self.load_industry_config(industry_slug)
        interview_cfg = industry.get("interview", {})

        company_type_instructions = ""
        for ct in interview_cfg.get("company_types", []):
            if ct["slug"] == company_type:
                company_type_instructions = ct.get("instructions", "")
                break

        template = self._read("interview/user_prompt_template.txt")
        return self._fill(
            template,
            industry_name=industry["name_zh"],
            position_level=position_level,
            role_type=role_type,
            company_type=company_type,
            resume_summary=resume_summary or "用户未提供简历信息",
            industry_professional_instructions=interview_cfg.get("professional_instructions", ""),
            company_type_instructions=company_type_instructions or "无特殊要求",
        )

    def _build_company_type_context(self, industry_slug: str) -> str:
        industry = self.load_industry_config(industry_slug)
        interview_cfg = industry.get("interview", {})
        parts = []
        for ct in interview_cfg.get("company_types", []):
            parts.append(f"- {ct['name_zh']}：{ct.get('instructions', '')}")
        return "\n".join(parts)


prompt_loader = PromptLoader()
