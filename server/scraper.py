import httpx
from bs4 import BeautifulSoup
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Connection": "keep-alive",
    "Accept-Language": "en-US,en;q=0.9,lt;q=0.8,et;q=0.7,de;q=0.6",
}
URL = "https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=Python&locationstring=Montr%C3%A9al%2C+QC&locationparam=22446&sort=M"
page = httpx.get(URL, headers=HEADERS)
jobs = page.text.split("<article")
soup = BeautifulSoup(page.text, "html.parser" )
jobs = soup.get_text(separator="\n", strip=True)
with open("myfile.txt", "w") as f:
    f.write(page.text)
