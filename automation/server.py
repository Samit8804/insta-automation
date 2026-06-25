import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engine import AutoShareEngine
from ai_reply import DEFAULT_MODEL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AutomationServer")

engine = AutoShareEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting automation server...")

    async def init_browser():
        try:
            from ollama_health import check_ollama_health, wait_for_ollama, restart_ollama

            if not await check_ollama_health():
                logger.warning("Ollama not responding — restarting...")
                restart_ollama()
                if await wait_for_ollama(120):
                    logger.info("Ollama is ready")
                else:
                    logger.error("Ollama failed to start — AI reply will be unavailable")

            await engine.initialize()
            if engine.client.authenticated:
                logger.info("Session restored — already logged in")
            else:
                await engine.client.page.goto("https://www.instagram.com/")
                logger.info("Browser opened — please log in manually in the Chrome window")
        except Exception as e:
            logger.warning(f"Browser init: {e}")

    async def ai_reply_loop():
        while True:
            try:
                await asyncio.sleep(30)
                if engine.client.authenticated:
                    await engine.check_ai_replies()
            except Exception as e:
                logger.warning(f"AI reply loop: {e}")

    asyncio.create_task(init_browser())
    asyncio.create_task(ai_reply_loop())
    yield
    await engine.stop()


app = FastAPI(title="InstaFlow Automation Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ShareRequest(BaseModel):
    userId: str
    groupId: str
    groupName: str
    targetGroup: str
    mode: str = "random"


class ShareResponse(BaseModel):
    success: bool
    executionTime: int
    message: str = ""


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "authenticated": engine.client.authenticated,
        "running": engine.running,
    }


@app.post("/share")
async def share_reel(req: ShareRequest):
    if not engine.client.authenticated:
        return {"success": False, "executionTime": 0, "message": "Not logged in"}

    group = {"_id": req.groupId, "groupName": req.groupName, "targetGroup": req.targetGroup}
    schedule = {"selectionMode": req.mode}

    import time
    start = time.time()

    try:
        result = await engine.execute_share(req.userId, group, schedule)
        elapsed = int((time.time() - start) * 1000)
        return {
            "success": result.get("success", False),
            "executionTime": result.get("execution_time_ms", elapsed),
            "message": result.get("error") or ("Shared" if result.get("success") else "Failed"),
        }
    except Exception as e:
        elapsed = int((time.time() - start) * 1000)
        return {"success": False, "executionTime": elapsed, "message": str(e)}


@app.get("/status")
async def status():
    return {
        "authenticated": engine.client.authenticated,
        "running": engine.running,
        "has_session": engine.session_token is not None,
        "page_open": engine.client.page is not None,
        "url": engine.client.page.url if engine.client.page else "",
    }


@app.post("/savesession")
async def save_session():
    try:
        if engine.client.context:
            from instagram_client import STORAGE_FILE
            await engine.client.context.storage_state(path=STORAGE_FILE)
            engine.client.authenticated = True
            engine.session_token = await engine.client.get_session_token()
            return {"success": True, "message": "Session saved"}
        return {"success": False, "message": "No browser context"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/login-page")
async def login_page():
    return {
        "message": "A Chrome browser window should be open on your screen. Log into Instagram there, then call POST /savesession to save the session."
    }



class AIRequest(BaseModel):
    groupId: str
    groupName: str = ""
    targetGroup: str
    message: str = ""
    model: str = DEFAULT_MODEL
    prompt: str = ""


@app.get("/ai/models")
async def ai_models():
    from ai_reply import get_ollama_models
    models = await get_ollama_models()
    return {"models": models}


@app.post("/ai/reply")
async def ai_reply(req: AIRequest):
    if not engine.client.authenticated:
        return {"success": False, "error": "Not logged in", "reply": ""}

    from ai_reply import generate_reply, reply_to_group
    import time
    start = time.time()

    latest = req.message
    try:
        if engine.client.page:
            elem = await engine.client.page.query_selector('[role="button"] div[dir="auto"]')
            if elem:
                texts = await engine.client.page.query_selector_all('[role="button"] div[dir="auto"]')
                for t in reversed(texts):
                    txt = await t.inner_text()
                    if txt and len(txt) > 3:
                        latest = txt
                        break
    except:
        pass

    if not latest:
        return {"success": False, "error": "No messages found", "reply": ""}

    ai_reply_text = await generate_reply(latest, system_prompt=req.prompt or None, model=req.model or None)

    group = {"_id": req.groupId, "groupName": req.groupName, "targetGroup": req.targetGroup}
    result = await reply_to_group(engine.client, req.targetGroup, ai_reply_text)

    elapsed = int((time.time() - start) * 1000)
    return {
        "success": result.get("success", False),
        "reply": ai_reply_text,
        "original": latest,
        "executionTime": elapsed,
        "error": result.get("error"),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
