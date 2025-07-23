import os
import datetime
from pathlib import Path
import urllib.parse
import json

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

from dotenv import load_dotenv

load_dotenv()

CACHE_DIR = Path(os.getenv("CACHE_DIR"))
CACHE_DIR.mkdir(exist_ok=True)

def today() -> str:
    return datetime.date.today().isoformat()

def cache_path(url: str) -> Path:
    """Stable, filename-safe path for a given URL."""
    slug = urllib.parse.quote_plus(url)
    # slug = hashlib.sha256(url.encode()).hexdigest()[:16] # shorter variant
    return CACHE_DIR / f"{slug}.json"

def load_from_cache(url: str):
    p = cache_path(url)
    if not p.exists():
        return None
    try:
        obj = json.loads(p.read_text())
        if obj.get("date") == today():
            print("Served from cache")
            return obj.get("snippets", [])
    except json.JSONDecodeError:
        pass
    return None

def save_to_cache(url: str, snippets):
    p = cache_path(url)
    p.write_text(json.dumps({"date": today(), "snippets": snippets}))

def scrape(target_url: str) -> list[str]:
    # remote Chrome in the container
    opts = Options()
    opts.add_argument("--headless=new")
    driver = webdriver.Remote(
        command_executor=os.getenv("SELENIUM_EXECUTOR"),
        options=opts,
    )

    # open page and collect HTML
    driver.set_page_load_timeout(int(os.getenv("TIMEOUT")))
    driver.get(target_url)

    # parse HTML
    soup = BeautifulSoup(driver.page_source, "html.parser")
    pinned = soup.select(os.getenv("TARGET_TAG01"))

    result = [str(div) for div in pinned]

    driver.quit()

    return result