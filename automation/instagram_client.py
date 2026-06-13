import os
import asyncio
import logging
from playwright.async_api import async_playwright

from config import (
    INSTAGRAM_USERNAME,
    INSTAGRAM_PASSWORD,
    BROWSER_HEADLESS,
    SCREENSHOT_DIR,
)

logger = logging.getLogger("InstagramClient")

STORAGE_FILE = os.path.join(os.path.dirname(__file__), "instagram_state.json")


class InstagramClient:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.authenticated = False

    async def start(self):
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=BROWSER_HEADLESS,
            args=["--no-sandbox", "--disable-setuid-sandbox"],
        )

        if os.path.exists(STORAGE_FILE):
            self.context = await self.browser.new_context(
                storage_state=STORAGE_FILE,
                viewport={"width": 390, "height": 844},
                user_agent=(
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
                    "Mobile/15E148 Safari/604.1"
                ),
            )
            self.page = await self.context.new_page()
            self.page.set_default_timeout(30000)

            try:
                await self.page.goto("https://www.instagram.com/", timeout=20000)
                await self.page.wait_for_timeout(3000)
                if "/accounts/login" not in self.page.url:
                    self.authenticated = True
                    logger.info("Restored session from saved state")
                    return
            except Exception:
                pass

        self.context = await self.browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent=(
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
                "Mobile/15E148 Safari/604.1"
            ),
        )
        self.page = await self.context.new_page()
        self.page.set_default_timeout(30000)

    async def login(self, username=None, password=None):
        user = username or INSTAGRAM_USERNAME
        pwd = password or INSTAGRAM_PASSWORD

        if not user or not pwd:
            raise ValueError("Instagram credentials not configured")

        await self.page.goto("https://www.instagram.com/accounts/login/")
        await self.page.wait_for_timeout(5000)

        found = False
        for attempt in range(3):
            try:
                await self.page.wait_for_selector('input[name="username"]', timeout=8000)
                found = True
                break
            except Exception:
                await self.page.wait_for_timeout(2000)

        if not found:
            return False

        try:
            await self.page.fill('input[name="username"]', user)
            await self.page.wait_for_timeout(500)
            await self.page.fill('input[name="password"]', pwd)
            await self.page.wait_for_timeout(500)
        except Exception:
            return False

        try:
            await self.page.click('button[type="submit"]')
        except Exception:
            try:
                await self.page.evaluate("document.querySelector('form button')?.click()")
            except Exception:
                await self.page.keyboard.press("Enter")

        await self.page.wait_for_timeout(10000)

        current_url = self.page.url
        if "/accounts/login" not in current_url and "login" not in current_url:
            self.authenticated = True
            await self.context.storage_state(path=STORAGE_FILE)
            return True

        self.authenticated = False
        return False

    async def navigate_to_reels(self):
        try:
            await self.page.goto("https://www.instagram.com/reels/", timeout=45000)
            await self.page.wait_for_timeout(4000)
        except Exception:
            pass

    async def select_reel(self, mode="random"):
        await self.navigate_to_reels()
        await self.page.wait_for_timeout(5000)
        return self.page.url

    async def share_to_group(self, target_group: str) -> dict:
        result = {"success": False, "reel_id": None, "error": None}
        import time
        start = time.time()

        try:
            await self.page.evaluate("window.scrollTo(0, window.innerHeight)")
            await self.page.wait_for_timeout(2000)
        except Exception:
            pass

        await self.page.wait_for_timeout(2000)

        ok = await self.page.evaluate("""
            (() => {
                const all = document.querySelectorAll('div[role="button"], button, a, svg');
                for (const el of all) {
                    const txt = (el.textContent || el.innerHTML || '').toLowerCase();
                    const label = (el.getAttribute && el.getAttribute('aria-label') || '').toLowerCase();
                    if (txt.includes('share') || label.includes('share')) {
                        el.dispatchEvent(new Event('click', {bubbles: true}));
                        return true;
                    }
                }
                return false;
            })
        """)
        await self.page.wait_for_timeout(3000)

        if not ok:
            result["error"] = "Share button not found"
            return result

        ok = await self.page.evaluate(f"""
            (() => {{
                const inputs = document.querySelectorAll('input');
                for (const inp of inputs) {{
                    if (inp.offsetParent !== null) {{
                        inp.value = '{target_group}';
                        inp.dispatchEvent(new Event('input', {{bubbles: true}}));
                        return true;
                    }}
                }}
                return false;
            }})
        """)
        await self.page.wait_for_timeout(3000)

        if not ok:
            result["error"] = "Search box not found"
            return result

        ok = await self.page.evaluate(f"""
            (() => {{
                const items = document.querySelectorAll('div[role="button"]');
                for (const item of items) {{
                    const txt = (item.textContent || '').toLowerCase();
                    if (txt.includes('{target_group}'.toLowerCase())) {{
                        item.dispatchEvent(new Event('click', {{bubbles: true}}));
                        return true;
                    }}
                }}
                return false;
            }})
        """)
        await self.page.wait_for_timeout(2000)

        ok = await self.page.evaluate("""
            (() => {
                const all = document.querySelectorAll('div[role="button"], button, svg');
                for (const el of all) {
                    const txt = (el.textContent || '').toLowerCase();
                    const label = (el.getAttribute && el.getAttribute('aria-label') || '').toLowerCase();
                    if (txt.includes('send') || label.includes('send')) {
                        el.dispatchEvent(new Event('click', {bubbles: true}));
                        return true;
                    }
                }
                return false;
            })
        """)
        await self.page.wait_for_timeout(2000)

        if ok:
            result["success"] = True
        else:
            result["error"] = "Send button not found"

        elapsed = int((time.time() - start) * 1000)
        result["execution_time_ms"] = elapsed
        return result

    async def _screenshot(self, name):
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
        try:
            await self.page.screenshot(path=path, timeout=5000)
        except Exception:
            pass
        return path

    async def close(self):
        if self.browser:
            await self.browser.close()

    async def get_session_token(self):
        cookies = await self.context.cookies()
        for cookie in cookies:
            if cookie["name"] == "sessionid":
                return cookie["value"]
        return None
