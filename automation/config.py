import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:5000")
API_TOKEN = os.getenv("API_TOKEN", "")

BROWSER_HEADLESS = os.getenv("BROWSER_HEADLESS", "true").lower() == "true"
INSTAGRAM_USERNAME = os.getenv("INSTAGRAM_USERNAME", "")
INSTAGRAM_PASSWORD = os.getenv("INSTAGRAM_PASSWORD", "")

SCREENSHOT_DIR = os.getenv("SCREENSHOT_DIR", "/app/screenshots")

REEL_SELECTION_MODES = ["random", "trending", "smart"]
DEFAULT_MODE = "random"

MIN_EXECUTION_INTERVAL_SECONDS = 15
