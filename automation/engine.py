import asyncio
import logging
import time
from datetime import datetime

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

        logger.info(f"Share result: success={result.get('success')}, time={result.get('execution_time_ms')}ms")

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
