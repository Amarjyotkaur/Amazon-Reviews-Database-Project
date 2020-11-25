import pandas as pd
from tqdm import tqdm
import json 
import ast

df=pd.read_csv('/Users/tengfone/Downloads/asin.csv', sep=',',names=['asin', 'title', 'author'])

with open('/Users/tengfone/Downloads/meta_Kindle_Store.json', 'r') as f:
    with open('/Users/tengfone/Downloads/meta_update.json', 'w') as fo:
        contents = f.readlines()
        for l in tqdm(contents):
            l_dict = ast.literal_eval(l.strip()) 
            try:
                val = df.loc[df['asin'] == l_dict['asin']].values[0]
                l_dict['title'] = val[1]
                l_dict['author'] = val[2]
                json.dump(l_dict, fo)
            except IndexError:
                l_dict['title'] = float('nan')
                l_dict['author'] = float('nan')
                json.dump(l_dict, fo)