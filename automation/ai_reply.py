import logging
import aiohttp
import asyncio
from datetime import datetime

logger = logging.getLogger("AIReply")

OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3.2"
DEFAULT_PROMPT = "You are a friendly Instagram user. Reply to the latest group chat message naturally. Keep it short and casual. Message: {message}"


async def get_ollama_models():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{OLLAMA_URL}/api/tags", timeout=5) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return [m["name"] for m in data.get("models", [])]
    except Exception as e:
        logger.error(f"Ollama not available: {e}")
    return []


async def generate_reply(message: str, system_prompt: str = None, model: str = None) -> str:
    prompt = (system_prompt or DEFAULT_PROMPT).format(message=message)
    payload = {
        "model": model or DEFAULT_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.7, "max_tokens": 150}
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=30) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("response", "").strip()
                return f"[Ollama error: {resp.status}]"
    except Exception as e:
        logger.error(f"Ollama generate failed: {e}")
        return "[AI unavailable]"


async def extract_latest_message(page) -> str:
    messages = await page.query_selector_all('[role="button"] div[dir="auto"]')
    for msg in reversed(messages):
        text = await msg.inner_text()
        if text and len(text) > 3:
            return text
    return ""


async def reply_to_group(client, target_group: str, message: str) -> dict:
    try:
        page = client.page
        if not page:
            return {"success": False, "error": "No page"}

        await page.goto("https://www.instagram.com/direct/inbox/", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(4)

        chat = page.locator(f'[role="button"]:has-text("{target_group}"), a:has-text("{target_group}")').first
        await chat.wait_for(timeout=15000)
        await chat.click()
        await asyncio.sleep(3)

        textarea = await page.query_selector("textarea")
        if not textarea:
            return {"success": False, "error": "No text input found"}

        await textarea.click()
        await textarea.type(message, delay=50)

        send_btn = await page.query_selector("svg[aria-label='Send']")
        if send_btn:
            await send_btn.click()
        else:
            await page.press("textarea", "Enter")

        await asyncio.sleep(2)
        return {"success": True, "replied": message}
    except Exception as e:
        logger.error(f"Reply failed: {e}")
        return {"success": False, "error": str(e)}
