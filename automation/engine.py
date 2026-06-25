import asyncio
import logging
from datetime import datetime

import aiohttp
import requests

from instagram_client import InstagramClient
from config import BACKEND_URL, API_TOKEN

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AutoShareEngine")


class AutoShareEngine:
    def __init__(self):
        self.client = InstagramClient()
        self.running = False
        self.session_token = None

    async def initialize(self):
        logger.info("Starting Instagram client...")
        await self.client.start()
        if self.client.authenticated:
            self.session_token = await self.client.get_session_token()
            logger.info("Instagram session restored")
        else:
            logger.info("Browser ready — login manually in the Chrome window")
        return self.client.authenticated

    async def execute_share(self, user_id: str, group: dict, schedule: dict) -> dict:
        mode = schedule.get("selectionMode", "random")
        target = group.get("targetGroup", "")

        logger.info(f"Executing share for group '{group.get('groupName')}' with mode '{mode}'")

        reel_url = await self.client.select_reel(mode=mode)
        result = await self.client.share_to_group(target)

        logger.info(f"Share result: success={result.get('success')}, error={result.get('error')}, time={result.get('execution_time_ms')}ms")

        return result

    async def run_for_user(self, user_id: str):
        try:
            schedules_resp = requests.get(
                f"{BACKEND_URL}/api/schedules",
                headers={"Authorization": f"Bearer {API_TOKEN}"},
                timeout=10,
            )
            if schedules_resp.status_code != 200:
                return
            schedules = schedules_resp.json().get("schedules", [])

            groups_resp = requests.get(
                f"{BACKEND_URL}/api/groups",
                headers={"Authorization": f"Bearer {API_TOKEN}"},
                timeout=10,
            )
            if groups_resp.status_code != 200:
                return
            groups = groups_resp.json().get("groups", [])

            active_groups = {g["_id"]: g for g in groups if g.get("status") == "active"}

            now = datetime.now()
            current_day = now.strftime("%A")

            for schedule in schedules:
                if schedule.get("status") != "active":
                    continue
                if current_day not in schedule.get("activeDays", []):
                    continue

                for group_id, group in active_groups.items():
                    await self.execute_share(user_id, group, schedule)
                    await asyncio.sleep(5)

        except Exception as e:
            logger.error(f"Error in run_for_user: {e}")

    async def run_once(self):
        try:
            if not self.client.page or not self.client.authenticated:
                logger.info("Re-initializing Instagram client...")
                await self.initialize()

            resp = requests.get(
                f"{BACKEND_URL}/api/analytics/admin",
                headers={"Authorization": f"Bearer {API_TOKEN}"},
                timeout=10,
            )

            self.running = True
        except Exception as e:
            logger.error(f"Run error: {e}")

    async def check_ai_replies(self):
        try:
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {API_TOKEN}"} if API_TOKEN else {}
                async with session.get(f"{BACKEND_URL}/api/ai/settings", headers=headers, timeout=10) as resp:
                    if resp.status != 200:
                        return
                    settings = await resp.json()

            if not settings.get("enabled"):
                return

            model = settings.get("model", "llama3.2")
            prompt = settings.get("prompt", "")
            group_ids = settings.get("targetGroups", [])
            if not group_ids:
                return

            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {API_TOKEN}"} if API_TOKEN else {}
                async with session.get(f"{BACKEND_URL}/api/groups", headers=headers, timeout=10) as resp:
                    if resp.status != 200:
                        return
                    data = await resp.json()
                    all_groups = data.get("groups", [])

            target_groups = [g for g in all_groups if g.get("_id") in group_ids]
            if not target_groups:
                return

            from ai_reply import generate_reply, reply_to_group, extract_latest_message

            for group in target_groups:
                target = group.get("targetGroup") or group.get("groupName", "")
                if not target:
                    continue

                try:
                    page = self.client.page
                    if not page:
                        continue

                    from ai_reply import _find_composer, _dismiss_popups

                    await page.goto("https://www.instagram.com/direct/inbox/", wait_until="networkidle", timeout=30000)
                    await asyncio.sleep(3)

                    if "/direct/t/" in page.url:
                        back = page.locator('button:has-text("Back"), a:has-text("Back"), svg[aria-label="Back"]').first
                        try:
                            await back.wait_for(timeout=5000)
                            await back.click()
                            await asyncio.sleep(3)
                        except Exception:
                            await page.goto("https://www.instagram.com/direct/inbox/", timeout=30000)
                            await asyncio.sleep(3)

                    await _dismiss_popups(page)

                    chat = page.locator(f'[role="button"]:has-text("{target}"), a:has-text("{target}")').first
                    await chat.wait_for(timeout=15000)
                    await chat.dispatch_event("click")
                    await asyncio.sleep(5)

                    await _dismiss_popups(page)

                    composer = await _find_composer(page)
                    if composer:
                        logger.info(f"Composer found for '{target}', ready for reply")
                    else:
                        logger.warning(f"No composer found for '{target}'")

                    latest = await extract_latest_message(page)
                    if not latest or len(latest) < 3:
                        continue

                    cache_key = f"ai_replied_{target}"
                    last = getattr(self, cache_key, None)
                    if latest == last:
                        continue
                    setattr(self, cache_key, latest)

                    reply_text = await generate_reply(latest, prompt or None, model)
                    if reply_text.startswith("[") and reply_text.endswith("]"):
                        logger.warning(f"Skipping reply '{reply_text}' for '{target}'")
                        continue

                    result = await reply_to_group(self.client, target, reply_text)
                    if result.get("success"):
                        logger.info(f"AI replied in '{target}': {reply_text[:50]}")
                except Exception as e:
                    logger.warning(f"AI reply check for '{target}' failed: {e}")
        except Exception as e:
            logger.error(f"AI reply check error: {type(e).__name__}: {e}")

    async def stop(self):
        self.running = False
        await self.client.close()
        logger.info("Engine stopped")


async def main():
    engine = AutoShareEngine()
    initialized = await engine.initialize()

    if not initialized:
        logger.warning("Continuing without authentication (scheduled checks only)")

    try:
        while True:
            await engine.run_once()
            await asyncio.sleep(60)
    except KeyboardInterrupt:
        await engine.stop()


if __name__ == "__main__":
    asyncio.run(main())
