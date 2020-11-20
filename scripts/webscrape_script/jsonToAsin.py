import json
import ast
import re
from tqdm import tqdm

json_file_path = "meta_Kindle_Store.json"

with open(json_file_path, 'r') as f:
    contents = f.read()
    json_data = ast.literal_eval(json.dumps(contents))
    data_dict = json_data.split("\n")
    with open('asinF.csv', 'w', newline='') as file:
        writer = csv.writer(file)
        for i in tqdm(range(len(data_dict))):
            try:
                asin = re.findall(r'[^{},:\'\"\s]+', data_dict[i])[1] 
                writer.writerow([asin])
            except IndexError: 
                print("Finish")
