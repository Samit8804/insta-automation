import asyncio
import logging

import aiohttp

from ollama_health import check_ollama_health, wait_for_ollama, restart_ollama

logger = logging.getLogger("AIReply")

OLLAMA_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3.2"
DEFAULT_PROMPT = "You are a friendly Instagram user. Reply to the latest group chat message naturally. Keep it short and casual. Message: {message}"

COMPOSER_SELECTORS = [
    'div[role="textbox"][contenteditable="true"]',
    'div[aria-label="Message"][contenteditable="true"]',
    'div[aria-label="Send message"][contenteditable="true"]',
    'textarea',
    'input[type="text"]',
]


async def get_ollama_models():
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
            async with session.get(f"{OLLAMA_URL}/api/tags") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return [m["name"] for m in data.get("models", [])]
    except Exception as e:
        logger.error(f"Ollama not available: {e}")
    return []


async def generate_reply(message: str, system_prompt: str = None, model: str = None, max_retries: int = 3) -> str:
    prompt = (system_prompt or DEFAULT_PROMPT).format(message=message)
    payload = {
        "model": model or DEFAULT_MODEL,
        "prompt": prompt,
        "stream": False,
        "keep_alive": "10m",
        "options": {"temperature": 0.7, "num_predict": 150},
    }

    for attempt in range(1, max_retries + 1):
        if not await check_ollama_health():
            logger.warning(f"Ollama down, attempt {attempt}/{max_retries}")
            if attempt == max_retries:
                restart_ollama()
                if not await wait_for_ollama(120):
                    return "[AI unavailable]"
            else:
                await wait_for_ollama(30)
                continue

        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=120)) as session:
                async with session.post(f"{OLLAMA_URL}/api/generate", json=payload) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("response", "").strip()
                    text = await resp.text()
                    logger.error(f"Ollama returned {resp.status}: {text}")
                    return f"[Ollama error: {resp.status}]"
        except asyncio.TimeoutError:
            logger.warning(f"Ollama timeout attempt {attempt}")
            if attempt == max_retries:
                restart_ollama()
                return "[AI unavailable]"
            await asyncio.sleep(2 ** attempt)
        except aiohttp.ClientError as e:
            logger.warning(f"Ollama client error attempt {attempt}: {e}")
            await asyncio.sleep(2 ** attempt)

    return "[AI unavailable]"


async def extract_latest_message(page) -> str:
    messages = await page.query_selector_all('[role="button"] div[dir="auto"]')
    for msg in reversed(messages):
        text = await msg.inner_text()
        if text and len(text) > 3:
            return text
    return ""


async def _dismiss_popups(page):
    for _ in range(3):
        dismissed = False
        for btn_text in ["Not Now", "Not now", "Cancel", "Close"]:
            btn = page.locator(f'button:has-text("{btn_text}")').first
            try:
                await btn.wait_for(timeout=1500)
                if await btn.is_visible():
                    await btn.click()
                    await asyncio.sleep(0.5)
                    dismissed = True
                    break
            except Exception:
                continue
        if not dismissed:
            break
    try:
        await page.keyboard.press("Escape")
    except Exception:
        pass


async def _find_composer(page, timeout: int = 15) -> any:
    for sel in COMPOSER_SELECTORS:
        try:
            elem = page.locator(sel).first
            await elem.wait_for(state="visible", timeout=timeout)
            if await elem.is_visible():
                logger.info(f"Found composer via: {sel}")
                return elem
        except Exception:
            continue
    logger.warning("No composer found, dumping debug info")
    count = await page.locator('[contenteditable="true"]').count()
    logger.warning(f"contenteditable elements on page: {count}")
    for i in range(count):
        el = page.locator('[contenteditable="true"]').nth(i)
        tag = await el.evaluate("e => e.tagName")
        aria = await el.get_attribute("aria-label") or ""
        visible = await el.is_visible()
        logger.warning(f"  [{i}] tag={tag} aria='{aria}' visible={visible}")
    return None


async def _send_via_composer(composer, text: str, page):
    await composer.click()
    await asyncio.sleep(0.3)

    tag = await composer.evaluate("e => e.tagName.toLowerCase()")
    if tag == "textarea":
        await composer.fill(text)
    else:
        await composer.evaluate("el => el.focus()")
        await page.keyboard.type(text, delay=20)

    await asyncio.sleep(0.5)

    try:
        send_btn = page.locator('svg[aria-label="Send"]').first
        if await send_btn.is_visible(timeout=2000):
            await send_btn.click()
            return
    except Exception:
        pass

    await page.keyboard.press("Enter")
    await asyncio.sleep(1)
    await page.keyboard.press("Enter")


async def reply_to_group(client, target_group: str, message: str) -> dict:
    try:
        page = client.page
        if not page:
            return {"success": False, "error": "No page"}

        await page.goto("https://www.instagram.com/direct/inbox/", wait_until="networkidle", timeout=30000)
        await asyncio.sleep(3)

        await _dismiss_popups(page)

        chat = page.locator(f'[role="button"]:has-text("{target_group}"), a:has-text("{target_group}")').first
        await chat.wait_for(timeout=15000)
        await chat.dispatch_event("click")
        await asyncio.sleep(5)

        await _dismiss_popups(page)

        composer = await _find_composer(page)
        if not composer:
            return {"success": False, "error": "No text input found"}

        await _send_via_composer(composer, message, page)

        await asyncio.sleep(2)
        return {"success": True, "replied": message}
    except Exception as e:
        logger.error(f"Reply failed: {e}")
        return {"success": False, "error": str(e)}
