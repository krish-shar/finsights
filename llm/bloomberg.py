import requests
from bs4 import BeautifulSoup
from datetime import datetime

ticker = "AAPL"

URL = "https://www.bloomberg.com/search?query=AAPL"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Make the request with the user agent
response = requests.get(URL, headers=headers)

soup = BeautifulSoup(response.text, 'html.parser')

print(soup.text)

body = soup.find("section", class_="mainContent__35589475db")

print(body)


# news_list = body.find_all("div", class_="storyItem__aaf871c1c5")

# print(news_list)

# item = news_list[0]

# print(item)