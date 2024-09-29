import requests
import json
from bs4 import BeautifulSoup


ticker = "TSLA"
limit = "25"
start = "2024-05-03T00%3A00%3A00Z"
end = "2024-05-04T00%3A00%3A00Z"

url = f"https://data.alpaca.markets/v1beta1/news?start={start}&end={end}&sort=desc&symbols={ticker}&limit={limit}&include_content=true"

headers = {
    "accept": "application/json",
    "APCA-API-KEY-ID": "PK8776ZRCTL3LB3PG9C0",
    "APCA-API-SECRET-KEY": "iZzsElc0CwgBaHdMWgx49EyMFXP4JVHL8vcHhadC"
}

response = requests.get(url, headers=headers)

news = json.loads(response.text)
news = news["news"]

ans = []
for item in news:
    content = item["content"]
    content = BeautifulSoup(content, 'html.parser').text
    
    ans.append(content)


for stuff in ans:
    print(stuff)