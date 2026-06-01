import uuid
from pathlib import Path

from playwright.async_api import async_playwright

from app.config import settings

TEMPLATES_DIR = Path(__file__).parent / "pdf_templates"


class PDFService:
    async def generate_resume_pdf(self, sections: dict, resume_id: uuid.UUID) -> bytes:
        """Generate a single-page A4 PDF resume from structured sections."""
        html = self._build_html(sections)

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(viewport={"width": 794, "height": 1123})
            await page.set_content(html, wait_until="networkidle")
            await page.wait_for_timeout(500)  # Ensure fonts are rendered

            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "15mm", "bottom": "15mm", "left": "15mm", "right": "15mm"},
                scale=1.0,
            )
            await browser.close()
            return pdf_bytes

    def _build_html(self, sections: dict) -> str:
        """Build HTML from structured resume sections optimized for Chinese PDF."""
        info = sections.get("个人信息", {})
        summary = sections.get("个人总结", "")
        work_exps = sections.get("工作经历", [])
        projects = sections.get("项目经验", [])
        education = sections.get("教育背景", [])
        skills = sections.get("专业技能", [])
        self_eval = sections.get("自我评价", "")

        work_html = self._render_work_experience(work_exps)
        projects_html = self._render_projects(projects)
        education_html = self._render_education(education)
        skills_html = self._render_skills(skills)

        return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  @page {{ size: A4; margin: 15mm; }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Hiragino Sans GB", sans-serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: #1a1a1a;
  }}
  .header {{
    text-align: center;
    margin-bottom: 14pt;
    padding-bottom: 10pt;
    border-bottom: 1.5pt solid #2563eb;
  }}
  .header .name {{ font-size: 18pt; font-weight: 700; color: #111; margin-bottom: 4pt; }}
  .header .contact {{ font-size: 9pt; color: #555; }}
  .header .contact span {{ margin: 0 8pt; }}
  .section-title {{
    font-size: 11pt;
    font-weight: 700;
    color: #2563eb;
    margin-top: 12pt;
    margin-bottom: 6pt;
    padding-bottom: 2pt;
    border-bottom: 0.5pt solid #ccc;
  }}
  .summary {{ margin-bottom: 4pt; }}
  .exp-item {{ margin-bottom: 8pt; }}
  .exp-header {{ display: flex; justify-content: space-between; font-size: 10pt; }}
  .exp-header .company {{ font-weight: 700; }}
  .exp-header .title {{ color: #444; }}
  .exp-header .duration {{ color: #888; font-size: 9pt; }}
  .bullets {{ margin-top: 2pt; padding-left: 14pt; }}
  .bullets li {{ font-size: 10pt; margin-bottom: 1pt; }}
  .skills-list {{ display: flex; flex-wrap: wrap; gap: 4pt 8pt; }}
  .skill-tag {{ font-size: 9.5pt; }}
  .skill-tag::after {{ content: " · "; color: #ccc; }}
  .skill-tag:last-child::after {{ content: ""; }}
  .edu-item {{ display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 2pt; }}
  .self-eval {{ font-size: 10pt; color: #444; }}
</style>
</head>
<body>
  <div class="header">
    <div class="name">{info.get('name', '')}</div>
    <div class="contact">
      <span>{info.get('phone', '')}</span>
      <span>{info.get('email', '')}</span>
      <span>{info.get('location', '')}</span>
      <span>{info.get('years_of_exp', '')}</span>
    </div>
  </div>

  <div class="section-title">个人总结</div>
  <div class="summary">{summary}</div>

  <div class="section-title">工作经历</div>
  {work_html}

  <div class="section-title">项目经验</div>
  {projects_html}

  <div class="section-title">教育背景</div>
  {education_html}

  <div class="section-title">专业技能</div>
  <div class="skills-list">{skills_html}</div>

  {f'<div class="section-title">自我评价</div><div class="self-eval">{self_eval}</div>' if self_eval else ''}
</body>
</html>"""

    def _render_work_experience(self, exps: list) -> str:
        items = []
        for exp in exps:
            bullets = "".join(f"<li>{b}</li>" for b in exp.get("bullets", []))
            items.append(f"""
<div class="exp-item">
  <div class="exp-header">
    <span><span class="company">{exp.get('company', '')}</span> | <span class="title">{exp.get('title', '')}</span></span>
    <span class="duration">{exp.get('duration', '')}</span>
  </div>
  <ul class="bullets">{bullets}</ul>
</div>""")
        return "\n".join(items)

    def _render_projects(self, projects: list) -> str:
        items = []
        for proj in projects:
            bullets = "".join(f"<li>{b}</li>" for b in proj.get("bullets", []))
            items.append(f"""
<div class="exp-item">
  <div class="exp-header">
    <span><span class="company">{proj.get('name', '')}</span> | <span class="title">{proj.get('role', '')}</span></span>
    <span class="duration">{proj.get('duration', '')}</span>
  </div>
  <ul class="bullets">{bullets}</ul>
</div>""")
        return "\n".join(items) if items else "<div></div>"

    def _render_education(self, edu_list: list) -> str:
        items = []
        for edu in edu_list:
            items.append(f"""
<div class="edu-item">
  <span>{edu.get('school', '')} | {edu.get('degree', '')} · {edu.get('major', '')}</span>
  <span style="color:#888">{edu.get('duration', '')}</span>
</div>""")
        return "\n".join(items) if items else "<div></div>"

    def _render_skills(self, skills: list) -> str:
        return "".join(f'<span class="skill-tag">{s}</span>' for s in skills)


pdf_service = PDFService()
