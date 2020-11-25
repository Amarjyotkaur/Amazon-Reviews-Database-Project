### Did not use this script

import pymongo
from bs4 import BeautifulSoup
import requests
import csv

client = pymongo.MongoClient("mongodb://admin:password@3.93.248.66:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")
db = client["admin"]
with open('asin.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["asin", "title", "author"])
    col = db["metadatas"].find(no_cursor_timeout=True).batch_size(5)
    for doc in col:
        page = requests.get("https://www.goodreads.com/search?utf8=%E2%9C%93&q={}&search_type=books".format(doc['asin']), headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(page.content, 'html.parser')
        try:
            title = soup.find(class_="bookTitle").getText().strip()
            author = soup.find(class_="authorName").getText().strip()
            print(title)
            writer.writerow([doc['asin'], title, author])
        except AttributeError:
            writer.writerow([None, None, None])
col.close()