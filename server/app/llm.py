"""The WhatsApp agent's brain: one call to any OpenAI-compatible chat API."""
import logging
import re

from openai import OpenAI

from . import config

log = logging.getLogger("llm")

_client: OpenAI | None = None


def client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(base_url=config.LLM_BASE_URL or None, api_key=config.LLM_API_KEY,
                         timeout=45, max_retries=2)
    return _client


def reply(system_prompt: str, messages: list[dict]) -> str | None:
    """messages: [{"role": "user" | "assistant", "content": "..."}]. Returns None on failure."""
    if not (config.LLM_API_KEY and config.LLM_MODEL):
        log.error("No reply: LLM_API_KEY / LLM_MODEL missing")
        return None
    options = {}
    if config.LLM_TEMPERATURE:
        options["temperature"] = float(config.LLM_TEMPERATURE)
    try:
        response = client().chat.completions.create(
            model=config.LLM_MODEL,
            messages=[{"role": "system", "content": system_prompt}, *messages],
            **options,
        )
    except Exception as error:  # any provider error: the caller sends a fallback line
        log.error("Model call failed: %s", error)
        return None
    return clean(response.choices[0].message.content or "") or None


def clean(text: str) -> str:
    """Strip what chat models add but WhatsApp shows literally: reasoning blocks, markdown, a name tag."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S)      # reasoning models (Groq, NVIDIA)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)                       # **bold**
    text = re.sub(r"^#+\s*", "", text, flags=re.M)                     # headings
    text = re.sub(r"^\s*(Urja|Assistant)\s*:\s*", "", text, flags=re.I)
    return text.strip()
