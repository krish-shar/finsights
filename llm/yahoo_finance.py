import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime

ticker = "TSLA"

URL = f"https://finance.yahoo.com/quote/{ticker}/news/"

# Define a user agent
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Make the request with the user agent
response = requests.get(URL, headers=headers)

# print(response.text)

soup = BeautifulSoup(response.text, 'html.parser')

body = soup.find('div', class_='filtered-stories x-large yf-ovk92u rulesBetween infiniteScroll')

news_list = body.find_all('li', class_="stream-item yf-ovk92u")

end = min(len(news_list), 25)

ans = []

for i in range(0, end):
    item = news_list[i]

    title = item.find("h3", class_="clamp yf-1sxfjua").text
    body = item.find("p", class_="clamp yf-1sxfjua").text

    ans.append((title, body))

for item in ans:
    print(item)
    print()

print(len(ans))