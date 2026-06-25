import asyncio
import logging
import platform
import subprocess

import aiohttp

logger = logging.getLogger("OllamaHealth")

OLLAMA_URL = "http://localhost:11434"
OLLAMA_EXE = r"C:\Users\HP\AppData\Local\Programs\Ollama\ollama.exe"


async def check_ollama_health(timeout: float = 5.0) -> bool:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{OLLAMA_URL}/api/tags", timeout=timeout) as r:
                return r.status == 200
    except Exception as e:
        logger.warning(f"Ollama health check failed: {e}")
        return False


async def wait_for_ollama(max_wait: int = 120) -> bool:
    logger.info(f"Waiting for Ollama (up to {max_wait}s)...")
    for i in range(max_wait):
        if await check_ollama_health():
            logger.info(f"Ollama alive after {i}s")
            return True
        await asyncio.sleep(1)
    logger.error("Ollama did not start in time")
    return False


def restart_ollama():
    system = platform.system()
    try:
        if system == "Windows":
            subprocess.Popen(
                ["powershell", "-Command",
                 "Get-Process ollama -ErrorAction SilentlyContinue | Stop-Process -Force"],
                shell=False
            )
            subprocess.Popen([OLLAMA_EXE, "serve"], shell=False)
        elif system == "Darwin":
            subprocess.Popen(["osascript", "-e", 'tell app "Ollama" to quit'])
            subprocess.Popen(["open", "-a", "Ollama"])
        else:
            subprocess.Popen(["systemctl", "restart", "ollama"])
        logger.info("Ollama restart triggered")
    except Exception as e:
        logger.error(f"Ollama restart failed: {e}")
