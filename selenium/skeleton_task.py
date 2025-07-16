from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import json, sys

TARGET = sys.argv[1] if len(sys.argv) > 1 else "https://example.com/"

# 1. connect to the remote Chrome in the container
opts = Options()
opts.add_argument("--headless=new")
driver = webdriver.Remote(
    command_executor="http://localhost:4444",
    options=opts,
)

# 2. open page and collect HTML
driver.get(TARGET)
soup = BeautifulSoup(driver.page_source, "html.parser")

# placeholddr parsing logic
data = [
    {"text": a.get_text(strip=True), "href": a["href"]}
    for a in soup.select("a[href]")[:10]
]

print(json.dumps(data, indent=2, ensure_ascii=False))
driver.quit()
