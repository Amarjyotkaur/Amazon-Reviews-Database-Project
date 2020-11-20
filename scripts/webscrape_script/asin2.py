import os
import pandas as pd
import requests
import csv
import concurrent.futures
from bs4 import BeautifulSoup
import time
import random

MAX_THREADS = 10

def extract_info_scrape(one_asin):
    time.sleep(random.uniform(0, 0.2))
    page = requests.get("https://www.goodreads.com/search?utf8=%E2%9C%93&q={}&search_type=books".format(one_asin), headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(page.content, 'html.parser')
    try:
        title = soup.find(class_="bookTitle").getText().strip()
        print(title)
        author = soup.find(class_="authorName").getText().strip()
    except AttributeError:
        title = ""
        author = ""
    with open('./asin.csv', mode='a') as f:
        csvWriter = csv.writer(f, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        csvWriter.writerow([one_asin,title, author])


def main():
    start_time = time.time()
    path = "./metadata_raw.csv"
    data = pd.read_csv(path)
    all_asin_list = data["asin"].tolist()
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        executor.map(extract_info_scrape, all_asin_list)
    end_time = time.time()
    print("Total time taken: ", end_time-start_time)


main()