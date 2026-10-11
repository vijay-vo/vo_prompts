"""The WhatsApp agent's brain: one call to any OpenAI-compatible chat API."""
import logging

from openai import OpenAI

from . import config

log = logging.getLogger("llm")

_client: OpenAI | None = None


def client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(base_url=config.LLM_BASE_URL or None, api_key=config.LLM_API_KEY)
    return _client


def reply(system_prompt: str, messages: list[dict]) -> str | None:
    """messages: [{"role": "user" | "assistant", "content": "..."}]. Returns None on failure."""
    try:
        response = client().chat.completions.create(
            model=config.LLM_MODEL,
            messages=[{"role": "system", "content": system_prompt}, *messages],
        )
        return (response.choices[0].message.content or "").strip() or None
    except Exception as error:  # any provider error: the caller sends a fallback line
        log.error("LLM call failed: %s", error)
        return None
