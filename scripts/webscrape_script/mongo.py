import pandas as pd
from tqdm import tqdm
import json 
import ast

df=pd.read_csv('asin.csv', sep=',',names=['asin', 'title', 'author'])

with open('meta_Kindle_Store.json', 'r') as f:
    with open('meta_update.json', 'w') as fo:
        contents = f.readlines()
        for l in tqdm(contents): 
            try:
                l_dict = ast.literal_eval(l.strip())
                val = df.loc[df['asin'] == l_dict['asin']].values[0]
                l_dict['title'] = val[1]
                l_dict['author'] = val[2]
                json.dump(l_dict, fo)
            except: 
                print('not found')