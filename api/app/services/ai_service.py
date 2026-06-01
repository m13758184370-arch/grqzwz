import json
import time
from typing import Any

from anthropic import AnthropicBedrock, AnthropicVertex, AsyncAnthropic

from app.config import settings


class AIService:
    def __init__(self):
        self._client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = "claude-haiku-4-5-20251001",
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> dict[str, Any]:
        """
        Call Claude API and parse the response as JSON.
        Uses prompt caching on the system prompt to reduce costs.
        """
        start_time = time.monotonic()

        cached_system = [{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}]

        response = await self._client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=cached_system,
            messages=[{"role": "user", "content": user_prompt}],
        )

        elapsed = time.monotonic() - start_time

        text = response.content[0].text if response.content else ""

        # Parse JSON from response
        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown or other wrapping
            import re

            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                result = json.loads(match.group(0))
            else:
                raise ValueError(f"Failed to parse AI response as JSON. Raw: {text[:500]}")

        usage = response.usage
        cost_info = {
            "input_tokens": usage.input_tokens if usage else 0,
            "output_tokens": usage.output_tokens if usage else 0,
            "cached_input_tokens": getattr(usage, "cache_read_input_tokens", 0) if usage else 0,
            "elapsed_seconds": round(elapsed, 2),
        }

        return {"data": result, "cost": cost_info}

    async def generate_resume(self, system_prompt: str, user_prompt: str) -> dict:
        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model="claude-haiku-4-5-20251001",
            max_tokens=4096,
            temperature=0.7,
        )

    async def generate_interview_questions(self, system_prompt: str, user_prompt: str) -> dict:
        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model="claude-sonnet-4-6-20250514",
            max_tokens=8192,
            temperature=0.8,
        )


ai_service = AIService()
